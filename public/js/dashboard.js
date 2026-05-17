// public/js/dashboard.js
const API = '/v1/api';
let allTasks = [];
let currentWorkspaceId = null;

// Initialize Dashboard Application
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthed = await checkSession();
    if (!isAuthed) return;

    setupSidebarRouter();
    await loadInitialData();
    setupEventListeners();
});

// ── 1. SESSION MANAGEMENT ─────────────────────────────────
async function checkSession() {
    try {
        const res = await fetch(`${API}/auth/me`);
        if (!res.ok) throw new Error('Unauthorized');
        
        const user = await res.json();
        // Dynamically populate profile card tokens
        document.getElementById('user-name-display').textContent = user.name || 'Ayush';
        document.getElementById('user-role-display').textContent = user.role || 'Admin';
        return true;
    } catch (err) {
        console.warn('Authentication failure. Redirecting to vault portal...');
        window.location.href = '/login.html';
        return false;
    }
}

// ── 2. SINGLE PAGE APPLICATION ROUTING ────────────────────
function setupSidebarRouter() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const views = document.querySelectorAll('[data-view]');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-target');

            // Toggle active visual tokens on nav elements
            sidebarLinks.forEach(l => l.classList.remove('bg-blue-50', 'text-blue-600', 'font-semibold'));
            link.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');

            // Toggle viewport visibility matrix
            views.forEach(view => {
                if (view.getAttribute('data-view') === targetView) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            });

            // Contextual data re-fetching matrix
            if (targetView === 'dashboard' || targetView === 'projects') loadTasks();
            if (targetView === 'analytics') loadAnalytics();
        });
    });
}

// ── 3. DATA PERSISTENCE INTEGRATION ───────────────────────
async function loadInitialData() {
    await loadWorkspaces();
    await loadTasks();
    await loadAnalytics();
}

async function loadWorkspaces() {
    try {
        const res = await fetch(`${API}/workspace`);
        const data = await res.json();
        if (data.success && data.workspaces.length > 0) {
            currentWorkspaceId = data.workspaces[0].id;
        }
    } catch (err) {
        console.error('Failed to parse workspace collections:', err);
    }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API}/tasks`);
        const result = await res.json();
        if (result.success) {
            allTasks = result.data;
            renderTasks(allTasks);
        }
    } catch (err) {
        console.error('Could not stream task arrays:', err);
    }
}

function renderTasks(tasks) {
    const tbody = document.getElementById('task-table-body');
    const emptyState = document.getElementById('empty-state-view');
    if (!tbody) return;

    if (!tasks || tasks.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = tasks.map(task => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition">
            <td class="px-6 py-4 font-medium text-slate-800">${task.title}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${task.assignee?.name || 'Unassigned'}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${
                    task.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }">${task.priority}</span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 font-medium">${task.status}</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-500">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
            <td class="px-6 py-4"><div class="flex gap-1">${(task.tags || []).map(tag => `<span class="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">${tag}</span>`).join('')}</div></td>
        </tr>
    `).join('');
}

async function loadAnalytics() {
    try {
        const res = await fetch(`${API}/analytics`);
        const result = await res.json();
        if (result.success) {
            document.getElementById('stat-active').textContent = result.data.activeTasks;
            document.getElementById('stat-velocity').textContent = result.data.velocity + '%';
        }
    } catch (err) {
        console.warn('Analytics mapping failed. Running offline metrics indicators.');
    }
}

// ── 4. TRANSACTION ENGINE & EVENT CAPTURE ──────────────────
function setupEventListeners() {
    // Optimistic Action Linkage: Add Task
    const newTaskBtn = document.getElementById('btn-new-task');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', async () => {
            const title = prompt('Enter layout title for task token:');
            if (!title) return;

            const tempId = `temp-${Date.now()}`;
            const mockTask = { id: tempId, title, priority: 'MEDIUM', status: 'PENDING', assignee: { name: 'Syncing...' } };
            
            // Trigger Optimistic UI insertion pattern
            allTasks.unshift(mockTask);
            renderTasks(allTasks);

            try {
                const res = await fetch(`${API}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, workspaceId: currentWorkspaceId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error();
                
                // Swap transient object token for server response row entry
                const index = allTasks.findIndex(t => t.id === tempId);
                if (index !== -1) allTasks[index] = data.data;
                renderTasks(allTasks);
                loadAnalytics();
            } catch (err) {
                alert('Database write transaction aborted. Reverting dynamic UI tree components.');
                allTasks = allTasks.filter(t => t.id !== tempId);
                renderTasks(allTasks);
            }
        });
    }

    // AI Context Compilation Pipeline
    const analyzeBtn = document.getElementById('btn-analyze');
    const aiText = document.getElementById('ai-input');
    const slideOver = document.getElementById('ai-slideover');

    if (analyzeBtn && aiText) {
        analyzeBtn.addEventListener('click', async () => {
            const promptValue = aiText.value.trim();
            if (!promptValue) return;

            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Streaming Framework Insights...';

            try {
                const res = await fetch(`${API}/summarize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: promptValue })
                });
                const data = await res.json();
                
                if (slideOver) {
                    document.getElementById('ai-markdown-content').innerHTML = marked.parse(data.summary);
                    slideOver.classList.remove('translate-x-full'); // Trigger animation vector matrix
                }
            } catch (err) {
                alert('Inference payload stream execution failed. Please verify API configurations.');
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze';
            }
        });
    }
}
