// ─────────────────────────────────────────────────────────────
// Task Repository — Data Access Layer
// ─────────────────────────────────────────────────────────────
// TODO: Connect to MongoDB/PostgreSQL using Mongoose/Prisma
// Currently returns static JSON data for development/demo purposes.
// Contributors: Implement the database layer to replace static data.
// ─────────────────────────────────────────────────────────────

let tasks = [
  {
    id: 'task-001',
    title: 'Implement user authentication flow',
    description: 'Set up JWT-based auth with refresh token rotation',
    assignee: 'Marcus Johnson',
    workspace: 'ws-002',
    priority: 'high',
    status: 'active',
    tags: ['backend', 'security'],
    dueDate: '2026-05-20T17:00:00Z',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-16T11:30:00Z'
  },
  {
    id: 'task-002',
    title: 'Design landing page hero section',
    description: 'Create a responsive hero with animated gradients and CTA',
    assignee: 'Priya Sharma',
    workspace: 'ws-003',
    priority: 'medium',
    status: 'active',
    tags: ['design', 'frontend'],
    dueDate: '2026-05-22T17:00:00Z',
    createdAt: '2026-05-12T10:00:00Z',
    updatedAt: '2026-05-17T08:00:00Z'
  },
  {
    id: 'task-003',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    assignee: 'Alex Rivera',
    workspace: 'ws-002',
    priority: 'high',
    status: 'pending',
    tags: ['devops', 'infrastructure'],
    dueDate: '2026-05-25T17:00:00Z',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T08:00:00Z'
  },
  {
    id: 'task-004',
    title: 'Write API documentation',
    description: 'Document all v1 endpoints with request/response examples',
    assignee: 'Sarah Chen',
    workspace: 'ws-001',
    priority: 'medium',
    status: 'active',
    tags: ['documentation', 'api'],
    dueDate: '2026-05-28T17:00:00Z',
    createdAt: '2026-05-15T14:00:00Z',
    updatedAt: '2026-05-16T09:45:00Z'
  },
  {
    id: 'task-005',
    title: 'Performance audit & optimization',
    description: 'Run Lighthouse audits, optimize bundle size and lazy loading',
    assignee: 'Marcus Johnson',
    workspace: 'ws-001',
    priority: 'low',
    status: 'pending',
    tags: ['performance', 'frontend'],
    dueDate: '2026-06-01T17:00:00Z',
    createdAt: '2026-05-16T10:00:00Z',
    updatedAt: '2026-05-16T10:00:00Z'
  },
  {
    id: 'task-006',
    title: 'Integrate notification microservice',
    description: 'Connect the event bus to push real-time notifications via WebSockets',
    assignee: 'Alex Rivera',
    workspace: 'ws-002',
    priority: 'high',
    status: 'active',
    tags: ['backend', 'real-time'],
    dueDate: '2026-05-24T17:00:00Z',
    createdAt: '2026-05-13T11:00:00Z',
    updatedAt: '2026-05-17T07:20:00Z'
  },
  {
    id: 'task-007',
    title: 'Create onboarding walkthrough',
    description: 'Build an interactive product tour for new workspace members',
    assignee: 'Priya Sharma',
    workspace: 'ws-003',
    priority: 'medium',
    status: 'active',
    tags: ['ux', 'frontend'],
    dueDate: '2026-05-30T17:00:00Z',
    createdAt: '2026-05-15T09:30:00Z',
    updatedAt: '2026-05-16T16:10:00Z'
  }
];

// TODO: Replace with actual DB queries (e.g., Task.find(), prisma.task.findMany())

/**
 * Retrieve all tasks, optionally filtered
 */
const findAll = (filters = {}) => {
  let result = [...tasks];

  if (filters.status) {
    result = result.filter(t => t.status === filters.status);
  }
  if (filters.priority) {
    result = result.filter(t => t.priority === filters.priority);
  }
  if (filters.workspace) {
    result = result.filter(t => t.workspace === filters.workspace);
  }
  if (filters.assignee) {
    result = result.filter(t =>
      t.assignee.toLowerCase().includes(filters.assignee.toLowerCase())
    );
  }

  return result;
};

/**
 * Find a task by ID
 */
const findById = (id) => {
  return tasks.find(t => t.id === id) || null;
};

/**
 * Create a new task record
 */
const create = (taskData) => {
  const newTask = {
    id: `task-${String(tasks.length + 1).padStart(3, '0')}`,
    ...taskData,
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    tags: taskData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return newTask;
};

/**
 * Update a task by ID
 */
const update = (id, updateData) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  tasks[index] = {
    ...tasks[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  return tasks[index];
};

/**
 * Delete a task by ID
 */
const remove = (id) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

module.exports = { findAll, findById, create, update, remove };
