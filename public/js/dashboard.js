// ─────────────────────────────────────────────────────────────
// Vortex Dashboard — Frontend Logic
// ─────────────────────────────────────────────────────────────

const API_BASE = '/api/v1';

// ── Load Dashboard Data ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadTasks();
  setupEventListeners();
});

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/tasks/stats`);
    const { data } = await res.json();
    document.getElementById('stat-active').textContent = data.activeTasks;
    document.getElementById('stat-velocity').textContent = data.teamVelocity + '%';
    document.getElementById('stat-ai').textContent = data.aiInsights.score;
  } catch (e) { console.error('Failed to load stats:', e); }
}

async function loadTasks(filters = {}) {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/tasks${params ? '?' + params : ''}`);
    const { data } = await res.json();
    renderTasks(data);
  } catch (e) { console.error('Failed to load tasks:', e); }
}

function renderTasks(tasks) {
  const tbody = document.getElementById('task-table-body');
  tbody.innerHTML = tasks.map(t => {
    const statusClass = t.status === 'active' ? 'badge-active' : 'badge-pending';
    const prioClass = t.priority === 'high' ? 'badge-high' : t.priority === 'medium' ? 'badge-medium' : 'badge-low';
    const due = new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tags = t.tags.map(tag => `<span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">${tag}</span>`).join(' ');
    return `<tr class="table-row border-b border-slate-50">
      <td class="px-6 py-4"><p class="text-sm font-medium text-slate-700">${t.title}</p><p class="text-xs text-slate-400 mt-0.5 max-w-xs truncate">${t.description}</p></td>
      <td class="px-6 py-4"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white text-[10px] font-bold">${t.assignee.split(' ').map(n=>n[0]).join('')}</div><span class="text-sm text-slate-600">${t.assignee}</span></div></td>
      <td class="px-6 py-4"><span class="badge ${prioClass}">${t.priority}</span></td>
      <td class="px-6 py-4"><span class="badge ${statusClass}">${t.status}</span></td>
      <td class="px-6 py-4 text-sm text-slate-500">${due}</td>
      <td class="px-6 py-4"><div class="flex gap-1 flex-wrap">${tags}</div></td>
    </tr>`;
  }).join('');
}

function setupEventListeners() {
  // Status filter
  document.getElementById('filter-status').addEventListener('change', (e) => {
    const status = e.target.value;
    loadTasks(status ? { status } : {});
  });

  // New task button
  document.getElementById('btn-new-task').addEventListener('click', async () => {
    const title = prompt('Enter task title:');
    if (!title) return;
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, assignee: 'Ayush', priority: 'medium' })
      });
      loadTasks();
      loadStats();
    } catch (e) { console.error('Failed to create task:', e); }
  });

  // AI Analyze button
  document.getElementById('btn-analyze').addEventListener('click', async () => {
    const text = document.getElementById('ai-input').value;
    if (!text.trim()) return;
    const btn = document.getElementById('btn-analyze');
    btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Analyzing...';
    try {
      const result = await analyzeText(text);
      const el = document.getElementById('ai-result');
      el.classList.remove('hidden');
      document.getElementById('ai-sentiment').textContent = result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1);
      document.getElementById('ai-score').textContent = `(Score: ${result.sentimentScore})`;
      document.getElementById('ai-summary').textContent = result.summary;
    } catch (e) { alert('Analysis failed: ' + e.message); }
    btn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Analyze';
  });

  // Ctrl+K search focus
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });

  // TODO: Implement live-search filtering logic for the search bar
  // Contributors: Add event listener on #search-input to filter
  // tasks in real-time as the user types.
}
