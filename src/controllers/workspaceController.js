// ─────────────────────────────────────────────────────────────
// Workspace Controller — HTTP Request Handlers
// ─────────────────────────────────────────────────────────────

const workspaceService = require('../services/workspaceService');

/**
 * GET /api/v1/workspace
 * Retrieve all workspaces
 */
const getAll = (req, res) => {
  try {
    const workspaces = workspaceService.getAllWorkspaces();
    res.json({
      success: true,
      count: workspaces.length,
      data: workspaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/v1/workspace/:id
 * Retrieve a single workspace
 */
const getById = (req, res) => {
  try {
    const workspace = workspaceService.getWorkspaceById(req.params.id);
    res.json({
      success: true,
      data: workspace
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/v1/workspace
 * Create a new workspace
 */
const create = (req, res) => {
  try {
    const workspace = workspaceService.createWorkspace(req.body);
    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: workspace
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PUT /api/v1/workspace/:id
 * Update a workspace
 */
const update = (req, res) => {
  try {
    const workspace = workspaceService.updateWorkspace(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Workspace updated successfully',
      data: workspace
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/v1/workspace/:id
 * Delete a workspace
 */
const remove = (req, res) => {
  try {
    const result = workspaceService.deleteWorkspace(req.params.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { getAll, getById, create, update, remove };
