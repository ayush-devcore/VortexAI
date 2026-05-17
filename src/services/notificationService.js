// ─────────────────────────────────────────────────────────────
// Notification Service — Mock Implementation
// ─────────────────────────────────────────────────────────────
// This service simulates notifications via console logging.
// TODO: Replace with a real notification system (e.g., SendGrid,
//       Pusher, Firebase Cloud Messaging, or WebSocket events).
// ─────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  WORKSPACE_CREATED: 'WORKSPACE_CREATED',
  MEMBER_JOINED: 'MEMBER_JOINED'
};

/**
 * Send a notification (mock — logs to console)
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {object} payload - Notification data
 */
const send = (type, payload) => {
  const timestamp = new Date().toISOString();
  const notification = {
    id: `notif-${Date.now()}`,
    type,
    payload,
    timestamp,
    delivered: true
  };

  console.log('\n  📬 Notification Service');
  console.log('  ──────────────────────');
  console.log(`  → Type:      ${type}`);
  console.log(`  → Time:      ${timestamp}`);
  console.log(`  → Payload:   ${JSON.stringify(payload, null, 2)}`);
  console.log('  → Status:    Delivered ✓\n');

  return notification;
};

/**
 * Notify when a new task is created
 */
const notifyTaskCreated = (task) => {
  return send(NOTIFICATION_TYPES.TASK_CREATED, {
    taskId: task.id,
    title: task.title,
    assignee: task.assignee,
    message: `New task "${task.title}" has been created and assigned to ${task.assignee || 'Unassigned'}.`
  });
};

/**
 * Notify when a workspace is created
 */
const notifyWorkspaceCreated = (workspace) => {
  return send(NOTIFICATION_TYPES.WORKSPACE_CREATED, {
    workspaceId: workspace.id,
    name: workspace.name,
    owner: workspace.owner,
    message: `Workspace "${workspace.name}" has been created by ${workspace.owner || 'System'}.`
  });
};

/**
 * Notify when a task is updated
 */
const notifyTaskUpdated = (task) => {
  return send(NOTIFICATION_TYPES.TASK_UPDATED, {
    taskId: task.id,
    title: task.title,
    message: `Task "${task.title}" has been updated.`
  });
};

module.exports = {
  NOTIFICATION_TYPES,
  send,
  notifyTaskCreated,
  notifyWorkspaceCreated,
  notifyTaskUpdated
};
