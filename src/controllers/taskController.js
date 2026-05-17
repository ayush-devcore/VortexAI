// ─────────────────────────────────────────────────────────────
// Task Controller — HTTP Request Handlers
// ─────────────────────────────────────────────────────────────

const taskService = require('../services/taskService');

/**
 * GET /api/v1/tasks
 * Retrieve all tasks (supports query filters)
 */
const getAll = (req, res) => {
  try {
    const filters = {
      status: req.query.status || undefined,
      priority: req.query.priority || undefined,
      workspace: req.query.workspace || undefined,
      assignee: req.query.assignee || undefined
    };

    // Remove undefined keys
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const tasks = taskService.getAllTasks(filters);
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/v1/tasks/stats
 * Get dashboard statistics
 */
const getStats = (req, res) => {
  try {
    const stats = taskService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/v1/tasks/:id
 * Retrieve a single task
 */
const getById = (req, res) => {
  try {
    const task = taskService.getTaskById(req.params.id);
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/v1/tasks
 * Create a new task
 */
const create = (req, res) => {
  try {
    const task = taskService.createTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PUT /api/v1/tasks/:id
 * Update a task
 */
const update = (req, res) => {
  try {
    const task = taskService.updateTask(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task
 */
const remove = (req, res) => {
  try {
    const result = taskService.deleteTask(req.params.id);
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

module.exports = { getAll, getStats, getById, create, update, remove };
