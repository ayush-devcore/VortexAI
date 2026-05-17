// ─────────────────────────────────────────────────────────
// Workspace Controller — Async, Auth-Aware
// ─────────────────────────────────────────────────────────

const workspaceService = require('../services/workspaceService');

const getAll = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getAllWorkspaces(req.user?.id);
    res.json({ success: true, count: workspaces.length, data: workspaces });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const ws = await workspaceService.getWorkspaceById(req.params.id);
    res.json({ success: true, data: ws });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const ws = await workspaceService.createWorkspace(req.body, req.user?.id);
    res.status(201).json({ success: true, message: 'Workspace created', data: ws });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const ws = await workspaceService.updateWorkspace(req.params.id, req.body);
    res.json({ success: true, message: 'Workspace updated', data: ws });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.id);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
