const API = '/v1/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && (data as { code?: string }).code === 'TOKEN_EXPIRED') {
    const refreshed = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) return request<T>(path, options);
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = (data as { error?: string | { message?: string } }).error;
    const message =
      typeof err === 'string' ? err : (err && typeof err === 'object' ? err.message : null) || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  status: string;
  ownerId: string;
  _count?: { members: number; tasks: number };
}

export interface WorkspaceMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; avatar?: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  tags: string[];
  dueDate?: string;
  workspaceId: string;
  assignee?: { name: string };
  workspace?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Analytics {
  overview: {
    totalTasks: number;
    activeTasks: number;
    pendingTasks: number;
    completionRate: number;
  };
  velocity: { current: number; trend: string; sprintGoal: number };
  workspaceHealth: { score: number; status: string; uptime: string; responseTime: string };
  aiInsights: { score: number; trend: string; suggestion: string };
  recentActivity: Array<{ id: string; title: string; status: string; updatedAt: string }>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ success: boolean; data: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      request<{ success: boolean; data: User; verification?: { devOnly?: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => request<{ success: boolean; data: User }>('/auth/me'),
    updateProfile: (data: { name?: string; avatar?: string }) =>
      request<{ success: boolean; data: User }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    verifyEmail: (token: string) =>
      request<{ success: boolean; data: User }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    resendVerification: () =>
      request<{ success: boolean; verification?: { devOnly?: string } }>('/auth/resend-verification', {
        method: 'POST',
      }),
  },
  tasks: {
    list: (workspaceId?: string) =>
      request<{ success: boolean; data: Task[] }>(
        `/tasks${workspaceId ? `?workspaceId=${workspaceId}` : ''}`
      ),
    get: (id: string) => request<{ success: boolean; data: Task }>(`/tasks/${id}`),
    create: (data: Partial<Task> & { title: string }) =>
      request<{ success: boolean; data: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Task>) =>
      request<{ success: boolean; data: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  analytics: () => request<{ success: boolean; data: Analytics }>('/analytics'),
  summarize: (text: string) =>
    request<{ success: boolean; summary: string }>('/summarize', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  workspaces: {
    list: () => request<{ success: boolean; data: Workspace[] }>('/workspace'),
    get: (id: string) => request<{ success: boolean; data: Workspace }>(`/workspace/${id}`),
    create: (name: string, description?: string) =>
      request<{ success: boolean; data: Workspace }>('/workspace', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),
    members: {
      list: (workspaceId: string) =>
        request<{ success: boolean; data: WorkspaceMember[] }>(`/workspace/${workspaceId}/members`),
      invite: (workspaceId: string, email: string, role = 'MEMBER') =>
        request<{ success: boolean; data: WorkspaceMember }>(`/workspace/${workspaceId}/members`, {
          method: 'POST',
          body: JSON.stringify({ email, role }),
        }),
      remove: (workspaceId: string, userId: string) =>
        request<{ success: boolean }>(`/workspace/${workspaceId}/members/${userId}`, {
          method: 'DELETE',
        }),
    },
  },
  notifications: {
    list: () =>
      request<{ success: boolean; data: Notification[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) =>
      request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
  },
};
