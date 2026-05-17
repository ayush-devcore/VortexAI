const { prisma } = require('../config/database');

async function isWorkspaceMember(workspaceId, userId) {
  const m = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return !!m;
}

async function isWorkspaceAdmin(workspaceId, userId) {
  const m = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return m?.role === 'ADMIN';
}

async function assertWorkspaceMember(workspaceId, userId) {
  if (!(await isWorkspaceMember(workspaceId, userId))) {
    throw Object.assign(new Error('Not a member of this workspace'), { status: 403 });
  }
}

async function assertWorkspaceAdmin(workspaceId, userId) {
  if (!(await isWorkspaceAdmin(workspaceId, userId))) {
    throw Object.assign(new Error('Admin access required'), { status: 403 });
  }
}

async function assertTaskAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { workspaceId: true },
  });
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  await assertWorkspaceMember(task.workspaceId, userId);
  return task;
}

module.exports = {
  isWorkspaceMember,
  isWorkspaceAdmin,
  assertWorkspaceMember,
  assertWorkspaceAdmin,
  assertTaskAccess,
};
