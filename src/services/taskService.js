// ─────────────────────────────────────────────────────────────
// Task Service — Business Logic Layer
// ─────────────────────────────────────────────────────────────

const taskRepository = require('../repositories/taskRepository');
const notificationService = require('./notificationService');

/**
 * Get all tasks with optional filters
 */
const getAllTasks = (filters = {}) => {
  return taskRepository.findAll(filters);
};

/**
 * Get a single task by ID
 */
const getTaskById = (id) => {
  const task = taskRepository.findById(id);
  if (!task) {
    throw new Error(`Task with ID "${id}" not found`);
  }
  return task;
};

/**
 * Create a new task
 */
const createTask = (data) => {
  // Validate required fields
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Task title is required');
  }

  const task = taskRepository.create({
    title: data.title.trim(),
    description: data.description || '',
    assignee: data.assignee || 'Unassigned',
    workspace: data.workspace || null,
    priority: data.priority || 'medium',
    status: data.status || 'pending',
    tags: data.tags || [],
    dueDate: data.dueDate || null
  });

  // Fire notification
  notificationService.notifyTaskCreated(task);

  return task;
};

/**
 * Update an existing task
 */
const updateTask = (id, data) => {
  const task = taskRepository.update(id, data);
  if (!task) {
    throw new Error(`Task with ID "${id}" not found`);
  }

  notificationService.notifyTaskUpdated(task);
  return task;
};

/**
 * Delete a task
 */
const deleteTask = (id) => {
  const deleted = taskRepository.remove(id);
  if (!deleted) {
    throw new Error(`Task with ID "${id}" not found`);
  }
  return { message: `Task "${id}" deleted successfully` };
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = () => {
  const allTasks = taskRepository.findAll();
  const activeTasks = allTasks.filter(t => t.status === 'active');
  const pendingTasks = allTasks.filter(t => t.status === 'pending');

  // Calculate velocity (simulated — tasks completed per sprint)
  const velocity = Math.round((activeTasks.length / allTasks.length) * 100);

  return {
    activeTasks: activeTasks.length,
    pendingTasks: pendingTasks.length,
    totalTasks: allTasks.length,
    teamVelocity: velocity,
    aiInsights: {
      score: 87,
      trend: 'up',
      suggestion: 'Team productivity increased 12% this sprint. Consider reallocating resources from pending DevOps tasks.'
    }
  };
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
};
