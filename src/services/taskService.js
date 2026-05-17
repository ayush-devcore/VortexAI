const taskRepository = require('../repositories/taskRepository');
const notificationService = require('./notificationService');
const { emitToWorkspace } = require('../config/socket');
const { assertWorkspaceMember, assertTaskAccess } = require('../utils/access');
const { prisma } = require('../config/database');

const getAllTasks = async (filters = {}, userId) => {
  if (!userId) throw Object.assign(new Error('Authentication required'), { status: 401 });
  return taskRepository.findAll(filters, userId);
};

const getTaskById = async (id, userId) => {
  await assertTaskAccess(id, userId);
  const task = await taskRepository.findById(id);
  if (!task) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  return task;
};

const createTask = async (data, userId) => {
  if (!data.title?.trim()) throw Object.assign(new Error('Task title is required'), { status: 400 });
  if (!userId) throw Object.assign(new Error('Authentication required'), { status: 401 });

  let workspaceId = data.workspaceId;
  if (!workspaceId) {
    const first = await prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true },
    });
    workspaceId = first?.workspaceId;
  }
  if (!workspaceId) throw Object.assign(new Error('No workspace available'), { status: 400 });
  await assertWorkspaceMember(workspaceId, userId);

  const { assigneeName, ...cleanData } = data;
  const task = await taskRepository.create({
    title: cleanData.title.trim(),
    description: cleanData.description || '',
    workspaceId,
    assigneeId: cleanData.assigneeId || null,
    creatorId: userId,
    priority: (cleanData.priority || 'MEDIUM').toUpperCase(),
    status: (cleanData.status || 'PENDING').toUpperCase(),
    tags: cleanData.tags || [],
    dueDate: cleanData.dueDate ? new Date(cleanData.dueDate) : null,
  });

  await notificationService.notifyTaskCreated(task, userId);
  emitToWorkspace(workspaceId, 'task:changed', { action: 'created', task });
  return task;
};

const updateTask = async (id, data, userId) => {
  const existing = await assertTaskAccess(id, userId);
  const task = await taskRepository.update(id, {
    ...(data.title && { title: data.title.trim() }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status && { status: data.status.toUpperCase() }),
    ...(data.priority && { priority: data.priority.toUpperCase() }),
    ...(data.tags && { tags: data.tags }),
    ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
  });
  if (!task) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  await notificationService.notifyTaskUpdated(task, userId);
  emitToWorkspace(existing.workspaceId, 'task:changed', { action: 'updated', task });
  return task;
};

const deleteTask = async (id, userId) => {
  const existing = await assertTaskAccess(id, userId);
  const deleted = await taskRepository.remove(id);
  if (!deleted) throw Object.assign(new Error(`Task "${id}" not found`), { status: 404 });
  emitToWorkspace(existing.workspaceId, 'task:changed', { action: 'deleted', taskId: id });
  return { message: `Task deleted` };
};

const getDashboardStats = async (userId) => {
  const all = await taskRepository.findAll({}, userId);
  const active = all.filter((t) => t.status === 'ACTIVE');
  const pending = all.filter((t) => t.status === 'PENDING');
  const completed = all.filter((t) => t.status === 'COMPLETED');
  const total = all.length || 1;
  const velocity = Math.round((completed.length / total) * 100);
  const prev = Math.max(0, velocity - 8);
  const trend = velocity >= prev ? `+${velocity - prev}%` : `${velocity - prev}%`;

  return {
    activeTasks: active.length,
    pendingTasks: pending.length,
    totalTasks: all.length,
    teamVelocity: velocity,
    aiInsights: {
      score: Math.min(99, 70 + velocity / 3),
      trend: velocity > 50 ? 'up' : 'stable',
      suggestion:
        pending.length > active.length
          ? 'Focus on clearing pending tasks to improve sprint velocity.'
          : 'Team productivity is on track. Keep momentum on active work.',
    },
    velocityTrend: trend,
  };
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};
