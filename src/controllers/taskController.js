// ─────────────────────────────────────────────────────────
// Task Controller — Async, Auth-Aware
// ─────────────────────────────────────────────────────────

const taskService = require('../services/taskService');

const getAll = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.workspaceId) filters.workspaceId = req.query.workspaceId;
    const tasks = await taskService.getAllTasks(filters, req.user?.id);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await taskService.getDashboardStats(req.user?.id);
    res.json({ success: true, data: stats });
  } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json({ success: true, data: task });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user?.id);
    res.status(201).json({ success: true, message: 'Task created', data: task });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json({ success: true, message: 'Task updated', data: task });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

module.exports = { getAll, getStats, getById, create, update, remove };
