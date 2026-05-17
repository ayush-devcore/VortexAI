const workspaceRepository = require('../repositories/workspaceRepository');
const notificationService = require('./notificationService');
const { assertWorkspaceMember, assertWorkspaceAdmin, isWorkspaceMember } = require('../utils/access');

const getAllWorkspaces = async (userId) => {
  if (!userId) throw Object.assign(new Error('Authentication required'), { status: 401 });
  return workspaceRepository.findAll(userId);
};

const getWorkspaceById = async (id, userId) => {
  await assertWorkspaceMember(id, userId);
  const ws = await workspaceRepository.findById(id);
  if (!ws) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return ws;
};

const createWorkspace = async (data, userId) => {
  if (!userId) throw Object.assign(new Error('Authentication required'), { status: 401 });
  if (!data.name?.trim()) throw Object.assign(new Error('Workspace name is required'), { status: 400 });
  const ws = await workspaceRepository.create({
    name: data.name.trim(),
    description: data.description || '',
    ownerId: userId,
    status: 'ACTIVE',
  });
  await notificationService.notifyWorkspaceCreated(ws, userId);
  return ws;
};

const updateWorkspace = async (id, data, userId) => {
  await assertWorkspaceAdmin(id, userId);
  const ws = await workspaceRepository.update(id, data);
  if (!ws) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return ws;
};

const deleteWorkspace = async (id, userId) => {
  await assertWorkspaceAdmin(id, userId);
  const deleted = await workspaceRepository.remove(id);
  if (!deleted) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return { message: `Workspace deleted` };
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  isWorkspaceMember,
};
