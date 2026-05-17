// ─────────────────────────────────────────────────────────
// Workspace Service — Business Logic (Async/Prisma-ready)
// ─────────────────────────────────────────────────────────

const workspaceRepository = require('../repositories/workspaceRepository');
const notificationService = require('./notificationService');

const getAllWorkspaces = async (userId = null) => {
  return workspaceRepository.findAll(userId);
};

const getWorkspaceById = async (id) => {
  const ws = await workspaceRepository.findById(id);
  if (!ws) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return ws;
};

const createWorkspace = async (data, userId) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Workspace name is required'), { status: 400 });
  const ws = await workspaceRepository.create({
    name: data.name.trim(),
    description: data.description || '',
    ownerId: userId || 'dev-user-001',
    status: 'ACTIVE',
  });
  notificationService.notifyWorkspaceCreated(ws);
  return ws;
};

const updateWorkspace = async (id, data) => {
  const ws = await workspaceRepository.update(id, data);
  if (!ws) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return ws;
};

const deleteWorkspace = async (id) => {
  const deleted = await workspaceRepository.remove(id);
  if (!deleted) throw Object.assign(new Error(`Workspace "${id}" not found`), { status: 404 });
  return { message: `Workspace "${id}" deleted` };
};

module.exports = { getAllWorkspaces, getWorkspaceById, createWorkspace, updateWorkspace, deleteWorkspace };
