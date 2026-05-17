// ─────────────────────────────────────────────────────────
// Task Repository — Prisma ORM with In-Memory Fallback
// ─────────────────────────────────────────────────────────

const { prisma, isDBAvailable } = require('../config/database');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');
const logger = require('../config/logger');



/** Check if Prisma is available (cached — no network call) */
function usePrisma() {
  return isDBAvailable();
}

const findAll = async (filters = {}, userId = null) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  
  const where = {};
  if (filters.status) where.status = filters.status.toUpperCase();
  if (filters.priority) where.priority = filters.priority.toUpperCase();
  if (filters.workspaceId) where.workspaceId = filters.workspaceId;
  // RLS: only tasks in user's workspaces
  if (userId) {
    where.workspace = { members: { some: { userId } } };
  }
  const cached = await cacheGet(`tasks:${JSON.stringify(where)}`);
  if (cached) return cached;
  const tasks = await prisma.task.findMany({ where, include: { assignee: { select: { name: true } }, workspace: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  await cacheSet(`tasks:${JSON.stringify(where)}`, tasks, 120);
  return tasks;
};

const findById = async (id) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  return prisma.task.findUnique({ where: { id }, include: { assignee: { select: { name: true } }, workspace: { select: { name: true } } } });
};

const create = async (data) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  const task = await prisma.task.create({ data, include: { assignee: { select: { name: true } } } });
  await cacheDel('tasks:{}');
  return task;
};

const update = async (id, data) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  const task = await prisma.task.update({ where: { id }, data });
  await cacheDel('tasks:{}');
  return task;
};

const remove = async (id) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  await prisma.task.delete({ where: { id } });
  await cacheDel('tasks:{}');
  return true;
};

module.exports = { findAll, findById, create, update, remove };
