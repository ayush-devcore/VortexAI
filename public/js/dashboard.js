// ─────────────────────────────────────────────────────────
// Vortex Dashboard — Production Frontend (v3)
// ─────────────────────────────────────────────────────────

const API = '/v1/api';
let allTasks = [];
let allWorkspaces = [];

// ── Socket.io — Real-time Collaboration ─────────────────
let socket = null;
try {
  if (typeof io !== 'undefined') {
    socket = io();
    socket.emit('user:online', { name: 'Ayush', role: 'Admin' });
    socket.on('collaborators:update', (users) => {
      const el = document.getElementById('online-count');
      if (el) el.textContent = users.length;
    });
    socket.on('task:changed', () => { loadTasks(); loadAnalytics(); });
  }
} catch { /* Socket.io not loaded */ }

// ── Bootstrap ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSession();
  loadAnalytics();
  loadTasks();
  loadWorkspaces();
  setupSearch();
  setupEventListeners();
});

// ── Load Session ────────────────────────────────────────
async function loadSession() {
  try {
    const { data } = await apiFetch('/auth/me');
    const name = data.name || 'User';
    const role = data.role || 'Member';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('sidebar-name').textContent = name;
    document.getElementById('sidebar-role').textContent = role;
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('header-avatar').textContent = initials;
  } catch (e) {
    // 401 Unauthorized -> redirect to login
    window.location.href = '/login.html';
  }
}

// ── API Helpers ─────────────────────────────────────────
async function apiFetch(endpoint, opts = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.error || 'API error');
  return data;
}

// ── Load Analytics ──────────────────────────────────────
async function loadAnalytics() {
  try {
    const { data } = await apiFetch('/analytics');
    document.getElementById('stat-active').textContent = data.overview.activeTasks;
    document.getElementById('stat-velocity').textContent = data.velocity.current + '%';
    document.getElementById('stat-ai').textContent = data.aiInsights.score;
    document.getElementById('stat-health').textContent = data.workspaceHealth.score + '%';
  } catch (e) { console.error('Analytics:', e.message); }
}

// ── Load Tasks ──────────────────────────────────────────
async function loadTasks(filters = {}) {
  try {
    const params = new URLSearchParams(filters).toString();
    const { data } = await apiFetch(`/tasks${params ? '?' + params : ''}`);
    allTasks = data;
    renderTasks(data);
  } catch (e) { console.error('Tasks:', e.message); }
}

function renderTasks(tasks) {
  const tbody = document.getElementById('task-table-body');
  if (!tbody) return;

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-16">
      <div class="flex flex-col items-center justify-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <i data-lucide="zap" class="w-8 h-8 text-[#2563EB] opacity-80"></i>
        </div>
        <p class="text-lg font-bold text-slate-700">No tasks found</p>
        <p class="text-sm text-slate-500 mt-1 mb-5">Your Arctic-Vivid workspace is a blank canvas. Let's start building!</p>
        <button onclick="document.getElementById('btn-new-task').click()" class="bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:opacity-90 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-md transition-all shadow-[#2563EB]/25 flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i> Create your first task
        </button>
      </div>
    </td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  tbody.innerHTML = tasks.map(t => {
    const name = t.assignee?.name || 'Unassigned';
    const initials = name.split(' ').map(n => n[0]).join('');
    const status = (t.status || '').toLowerCase();
    const priority = (t.priority || '').toLowerCase();
    const sc = status === 'active' ? 'badge-active' : 'badge-pending';
    const pc = priority === 'high' ? 'badge-high' : priority === 'medium' ? 'badge-medium' : 'badge-low';
    const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const tags = (t.tags || []).map(tag => `<span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">${tag}</span>`).join(' ');

    return `<tr class="t-row border-b border-slate-50">
      <td class="px-6 py-4"><p class="text-sm font-semibold text-slate-700">${t.title}</p><p class="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">${t.description || ''}</p></td>
      <td class="px-6 py-4"><div class="flex items-center gap-2.5"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center text-white text-[10px] font-bold">${initials}</div><span class="text-sm text-slate-600 font-medium">${name}</span></div></td>
      <td class="px-6 py-4"><span class="badge ${pc}">${priority}</span></td>
      <td class="px-6 py-4"><span class="badge ${sc}">${status}</span></td>
      <td class="px-6 py-4 text-sm text-slate-500">${due}</td>
      <td class="px-6 py-4"><div class="flex gap-1 flex-wrap">${tags}</div></td>
    </tr>`;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Load Workspaces ─────────────────────────────────────
async function loadWorkspaces() {
  try {
    const { data } = await apiFetch('/workspace');
    allWorkspaces = data;
    
    // Socket.io Live Sync: Join the workspace rooms
    if (socket && allWorkspaces.length > 0) {
      allWorkspaces.forEach(ws => socket.emit('workspace:join', ws.id));
    }
  } catch (e) { console.error('Workspaces:', e.message); }
}

// ── Ctrl+K Search (Connected) ───────────────────────────
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  // Ctrl+K focus
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape') input.blur();
  });

  // Live search — filters tasks client-side
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.toLowerCase().trim();
      if (!q) { renderTasks(allTasks); return; }
      const filtered = allTasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.assignee?.name || '').toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
      renderTasks(filtered);
    }, 200);
  });
}

// ── Event Listeners ─────────────────────────────────────
function setupEventListeners() {
  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      window.location.href = '/login.html';
    } catch (e) { alert('Logout failed: ' + e.message); }
  });

  // Status filter
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    loadTasks(e.target.value ? { status: e.target.value } : {});
  });

  // New Task — Real-Time Optimistic UI
  document.getElementById('btn-new-task')?.addEventListener('click', async () => {
    const title = prompt('Enter task title:');
    if (!title?.trim()) return;

    // 1. Optimistic Update (Instant UI)
    const tempTask = {
      id: 'temp-' + Date.now(),
      title,
      description: 'Syncing to database...',
      status: 'PENDING',
      priority: 'MEDIUM',
      tags: [],
      createdAt: new Date().toISOString(),
      assignee: { name: 'Ayush (You)' }
    };
    allTasks.unshift(tempTask);
    renderTasks(allTasks);

    // 2. Background Fetch
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, priority: 'MEDIUM' }),
      });
      
      // 3. Replace temp with real data
      const idx = allTasks.findIndex(t => t.id === tempTask.id);
      if (idx !== -1) allTasks[idx] = res.data;
      renderTasks(allTasks);
      loadAnalytics();
      
      // 4. Live Sync
      if (socket) socket.emit('task:update', { type: 'created', title, workspaceId: res.data.workspaceId });
    } catch (e) { 
      // Revert on failure
      allTasks = allTasks.filter(t => t.id !== tempTask.id);
      renderTasks(allTasks);
      alert('Failed to save task: ' + e.message); 
    }
  });

  // AI Analyze — real async call (Slide-over UI)
  document.getElementById('btn-analyze')?.addEventListener('click', async () => {
    const text = document.getElementById('ai-input')?.value;
    if (!text?.trim()) return;

    const btn = document.getElementById('btn-analyze');
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Analyzing...';

    const slideover = document.getElementById('ai-slideover');
    const content = document.getElementById('ai-slide-content');
    
    // Slide in immediately with loading state
    slideover.classList.remove('translate-x-full');
    content.innerHTML = `<div class="flex items-center gap-3 text-slate-500 font-medium py-4"><span class="animate-spin inline-block w-4 h-4 border-2 border-slate-300 border-t-[#2563EB] rounded-full"></span> Calling Gemini AI...</div>`;

    try {
      const { data } = await apiFetch('/summarize', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      content.innerHTML = typeof marked !== 'undefined' ? marked.parse(data.markdown) : data.markdown;
    } catch (e) { 
      content.innerHTML = `<div class="text-red-500 font-medium py-4">Failed to analyze: ${e.message}</div>`;
    }

    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="zap" class="w-4 h-4"></i> Analyze';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  // Close AI Slideover
  document.getElementById('btn-close-ai')?.addEventListener('click', () => {
    document.getElementById('ai-slideover').classList.add('translate-x-full');
  });

  // Sidebar View Switcher (Event Delegation)
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = e.currentTarget.getAttribute('data-target');
      if (targetView) switchView(targetView);
    });
  });
}

// ── View Swapper ────────────────────────────────────────
function switchView(viewName) {
  // Update sidebar active states
  document.querySelectorAll('.sidebar-link').forEach(el => {
    el.classList.remove('bg-blue-50', 'text-[#2563EB]', 'font-semibold', 'active');
    el.classList.add('text-slate-500');
  });
  
  const activeLink = document.querySelector(`.sidebar-link[data-target="${viewName}"]`);
  if (activeLink) {
    activeLink.classList.remove('text-slate-500');
    activeLink.classList.add('bg-blue-50', 'text-[#2563EB]', 'font-semibold', 'active');
  }

  // Toggle visible sections
  document.querySelectorAll('.view-section').forEach(el => {
    const views = el.getAttribute('data-view') || '';
    if (views.split(' ').includes(viewName)) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Trigger data fetches
  if (viewName === 'analytics') loadAnalytics();
  if (viewName === 'projects' || viewName === 'dashboard') loadTasks();
}
