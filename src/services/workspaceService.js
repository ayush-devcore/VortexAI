// ─────────────────────────────────────────────────────────────
// Workspace Service — Business Logic Layer
// ─────────────────────────────────────────────────────────────

const workspaceRepository = require('../repositories/workspaceRepository');
const notificationService = require('./notificationService');

/**
 * Get all workspaces
 */
const getAllWorkspaces = () => {
  return workspaceRepository.findAll();
};

/**
 * Get a single workspace by ID
 */
const getWorkspaceById = (id) => {
  const workspace = workspaceRepository.findById(id);
  if (!workspace) {
    throw new Error(`Workspace with ID "${id}" not found`);
  }
  return workspace;
};

/**
 * Create a new workspace
 */
const createWorkspace = (data) => {
  // Validate required fields
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Workspace name is required');
  }

  const workspace = workspaceRepository.create({
    name: data.name.trim(),
    description: data.description || '',
    owner: data.owner || 'System',
    members: data.members || 1,
    status: data.status || 'active'
  });

  // Fire notification
  notificationService.notifyWorkspaceCreated(workspace);

  return workspace;
};

/**
 * Update an existing workspace
 */
const updateWorkspace = (id, data) => {
  const workspace = workspaceRepository.update(id, data);
  if (!workspace) {
    throw new Error(`Workspace with ID "${id}" not found`);
  }
  return workspace;
};

/**
 * Delete a workspace
 */
const deleteWorkspace = (id) => {
  const deleted = workspaceRepository.remove(id);
  if (!deleted) {
    throw new Error(`Workspace with ID "${id}" not found`);
  }
  return { message: `Workspace "${id}" deleted successfully` };
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
