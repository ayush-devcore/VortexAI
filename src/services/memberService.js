const { prisma } = require('../config/database');
const { assertWorkspaceAdmin, assertWorkspaceMember } = require('../utils/access');
const notificationService = require('./notificationService');

async function listMembers(workspaceId, userId) {
  await assertWorkspaceMember(workspaceId, userId);
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } },
    orderBy: { joinedAt: 'asc' },
  });
}

async function inviteMember(workspaceId, adminId, { email, role = 'MEMBER' }) {
  await assertWorkspaceAdmin(workspaceId, adminId);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw Object.assign(new Error('User not found. They must register first.'), { status: 404 });

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
  if (existing) throw Object.assign(new Error('User is already a member'), { status: 409 });

  const member = await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId, role: role.toUpperCase() },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });

  await notificationService.notifyMemberJoined(workspaceId, user.name, user.id);
  await notificationService.create(user.id, {
    type: 'MEMBER_JOINED',
    title: 'Added to workspace',
    message: 'You were added to a workspace.',
    metadata: { workspaceId },
  });

  return member;
}

async function removeMember(workspaceId, adminId, targetUserId) {
  await assertWorkspaceAdmin(workspaceId, adminId);
  if (adminId === targetUserId) {
    throw Object.assign(new Error('Cannot remove yourself'), { status: 400 });
  }
  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });
  return { message: 'Member removed' };
}

module.exports = { listMembers, inviteMember, removeMember };
