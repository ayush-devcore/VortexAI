// ─────────────────────────────────────────────────────────
// Workspace Repository — Prisma ORM
// ─────────────────────────────────────────────────────────

const { prisma, isDBAvailable } = require('../config/database');
const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

function usePrisma() {
  return isDBAvailable();
}

const findAll = async (userId = null) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  const where = userId ? { members: { some: { userId } } } : {};
  const cached = await cacheGet(`workspaces:${userId || 'all'}`);
  if (cached) return cached;
  const ws = await prisma.workspace.findMany({ where, include: { owner: { select: { name: true } }, _count: { select: { members: true, tasks: true } } }, orderBy: { createdAt: 'desc' } });
  await cacheSet(`workspaces:${userId || 'all'}`, ws, 120);
  return ws;
};

const findById = async (id) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  return prisma.workspace.findUnique({ where: { id }, include: { owner: { select: { name: true } }, members: { include: { user: { select: { id: true, name: true, email: true } } } }, _count: { select: { tasks: true } } } });
};

const create = async (data) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  const ws = await prisma.workspace.create({
    data: { ...data, members: { create: { userId: data.ownerId, role: 'ADMIN' } } },
    include: { _count: { select: { members: true, tasks: true } } }
  });
  await cacheDel(`workspaces:${data.ownerId}`);
  return ws;
};

const update = async (id, data) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  const ws = await prisma.workspace.update({ where: { id }, data });
  await cacheDel('workspaces:all');
  return ws;
};

const remove = async (id) => {
  if (!usePrisma()) throw new Error('Database unavailable');
  await prisma.workspace.delete({ where: { id } });
  await cacheDel('workspaces:all');
  return true;
};

module.exports = { findAll, findById, create, update, remove };
