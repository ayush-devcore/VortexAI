// ─────────────────────────────────────────────────────────────
// Workspace Repository — Data Access Layer
// ─────────────────────────────────────────────────────────────
// TODO: Connect to MongoDB/PostgreSQL using Mongoose/Prisma
// Currently uses in-memory storage for development/demo purposes.
// Contributors: Replace the in-memory array with a proper DB connection.
// ─────────────────────────────────────────────────────────────

let workspaces = [
  {
    id: 'ws-001',
    name: 'Product Launch Q3',
    description: 'Cross-functional workspace for the Q3 product release cycle',
    owner: 'Sarah Chen',
    members: 12,
    status: 'active',
    createdAt: '2026-04-15T09:00:00Z',
    updatedAt: '2026-05-16T14:30:00Z'
  },
  {
    id: 'ws-002',
    name: 'Engineering Sprint 47',
    description: 'Backend infrastructure improvements and API v2 migration',
    owner: 'Marcus Johnson',
    members: 8,
    status: 'active',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-17T08:15:00Z'
  },
  {
    id: 'ws-003',
    name: 'Design System Overhaul',
    description: 'Unified component library and design token standardization',
    owner: 'Priya Sharma',
    members: 5,
    status: 'pending',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-05-15T16:45:00Z'
  }
];

// TODO: Replace with actual DB queries (e.g., Workspace.find(), prisma.workspace.findMany())

/**
 * Retrieve all workspaces
 */
const findAll = () => {
  return [...workspaces];
};

/**
 * Find a workspace by ID
 */
const findById = (id) => {
  return workspaces.find(ws => ws.id === id) || null;
};

/**
 * Create a new workspace record
 */
const create = (workspaceData) => {
  const newWorkspace = {
    id: `ws-${String(workspaces.length + 1).padStart(3, '0')}`,
    ...workspaceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  workspaces.push(newWorkspace);
  return newWorkspace;
};

/**
 * Update a workspace by ID
 */
const update = (id, updateData) => {
  const index = workspaces.findIndex(ws => ws.id === id);
  if (index === -1) return null;
  workspaces[index] = {
    ...workspaces[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  return workspaces[index];
};

/**
 * Delete a workspace by ID
 */
const remove = (id) => {
  const index = workspaces.findIndex(ws => ws.id === id);
  if (index === -1) return false;
  workspaces.splice(index, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
