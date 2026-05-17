const { prisma } = require('../config/database');
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

const NOTIFICATION_TYPES = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  MEMBER_JOINED: 'MEMBER_JOINED',
};

async function create(userId, { type, title, message, metadata = {} }) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, metadata },
    });
    const io = getIO();
    if (io) io.to(`user:${userId}`).emit('notification:new', notification);
    return notification;
  } catch (err) {
    logger.warn(`Notification persist failed: ${err.message}`);
    return { id: `local-${Date.now()}`, type, title, message, read: false, createdAt: new Date() };
  }
}

async function notifyWorkspaceMembers(workspaceId, excludeUserId, payload) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, ...(excludeUserId && { userId: { not: excludeUserId } }) },
    select: { userId: true },
  });
  await Promise.all(members.map((m) => create(m.userId, payload)));
}

async function notifyTaskCreated(task, actorId) {
  const title = 'New task created';
  const message = `"${task.title}" was added to the workspace.`;
  await notifyWorkspaceMembers(task.workspaceId, actorId, {
    type: NOTIFICATION_TYPES.TASK_CREATED,
    title,
    message,
    metadata: { taskId: task.id, workspaceId: task.workspaceId },
  });
}

async function notifyTaskUpdated(task, actorId) {
  await notifyWorkspaceMembers(task.workspaceId, actorId, {
    type: NOTIFICATION_TYPES.TASK_UPDATED,
    title: 'Task updated',
    message: `"${task.title}" was updated.`,
    metadata: { taskId: task.id, workspaceId: task.workspaceId },
  });
}

async function notifyWorkspaceCreated(workspace, ownerId) {
  await create(ownerId, {
    type: NOTIFICATION_TYPES.WORKSPACE_CREATED,
    title: 'Workspace created',
    message: `"${workspace.name}" is ready.`,
    metadata: { workspaceId: workspace.id },
  });
}

async function notifyMemberJoined(workspaceId, memberName, userId) {
  await notifyWorkspaceMembers(workspaceId, userId, {
    type: NOTIFICATION_TYPES.MEMBER_JOINED,
    title: 'New team member',
    message: `${memberName} joined the workspace.`,
    metadata: { workspaceId },
  });
}

async function getForUser(userId, { limit = 30, unreadOnly = false } = {}) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly && { read: false }) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function markRead(id, userId) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

async function markAllRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, read: false } });
}

module.exports = {
  NOTIFICATION_TYPES,
  create,
  notifyTaskCreated,
  notifyTaskUpdated,
  notifyWorkspaceCreated,
  notifyMemberJoined,
  getForUser,
  markRead,
  markAllRead,
  getUnreadCount,
};
