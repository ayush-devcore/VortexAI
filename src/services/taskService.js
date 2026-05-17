// ─────────────────────────────────────────────────────────
// Task Service — Business Logic (Async/Prisma-ready)
// ─────────────────────────────────────────────────────────

const taskRepository = require('../repositories/taskRepository');
const notificationService = require('./notificationService');

const getAllTasks = async (filters = {}, userId = null) => {
  return taskRepository.findAll(filters, userId);
};

const getTaskById = async (id) => {
  const task = await taskRepository.findById(id);
  if (!task) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  return task;
};

const createTask = async (data, userId) => {
  if (!data.title?.trim()) throw Object.assign(new Error('Task title is required'), { status: 400 });
  
  // Dynamic fallback for workspace and creator since we removed hardcoded IDs
  let targetWorkspaceId = data.workspaceId;
  if (!targetWorkspaceId) {
    const ws = await taskRepository.findAll({}, userId);
    targetWorkspaceId = ws.length > 0 ? ws[0].workspaceId : null;
    if (!targetWorkspaceId) {
       const firstWs = await require('../config/database').prisma.workspace.findFirst();
       targetWorkspaceId = firstWs?.id;
    }
  }

  let targetCreatorId = userId;
  if (!targetCreatorId) {
     const firstUser = await require('../config/database').prisma.user.findFirst();
     targetCreatorId = firstUser?.id;
  }

  const { assigneeName, ...cleanData } = data; // Remove virtual mock fields
  
  const task = await taskRepository.create({
    title: cleanData.title.trim(),
    description: cleanData.description || '',
    workspaceId: targetWorkspaceId,
    assigneeId: cleanData.assigneeId || null,
    creatorId: targetCreatorId,
    priority: (cleanData.priority || 'MEDIUM').toUpperCase(),
    status: (cleanData.status || 'PENDING').toUpperCase(),
    tags: cleanData.tags || [],
    dueDate: cleanData.dueDate ? new Date(cleanData.dueDate) : null,
  });
  notificationService.notifyTaskCreated(task);
  return task;
};

const updateTask = async (id, data) => {
  const task = await taskRepository.update(id, data);
  if (!task) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  notificationService.notifyTaskUpdated(task);
  return task;
};

const deleteTask = async (id) => {
  const deleted = await taskRepository.remove(id);
  if (!deleted) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  return { message: `Task "${id}" deleted` };
};

const getDashboardStats = async (userId = null) => {
  const all = await taskRepository.findAll({}, userId);
  const active = all.filter(t => t.status === 'ACTIVE');
  const pending = all.filter(t => t.status === 'PENDING');
  const velocity = all.length ? Math.round((active.length / all.length) * 100) : 0;
  return {
    activeTasks: active.length, pendingTasks: pending.length, totalTasks: all.length,
    teamVelocity: velocity,
    aiInsights: { score: 87, trend: 'up', suggestion: 'Team productivity increased 12% this sprint.' },
  };
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats };
