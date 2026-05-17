import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import {
  Menu,
  Plus,
  Search,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Mail,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { TaskTable } from '../components/TaskTable';
import { AIPanel } from '../components/AIPanel';
import { NotificationBell } from '../components/NotificationBell';
import { WorkspaceSwitcher } from '../components/WorkspaceSwitcher';
import { TaskModal } from '../components/TaskModal';
import { TeamView } from '../views/TeamView';
import { SettingsView } from '../views/SettingsView';
import { CalendarView } from '../views/CalendarView';
import { ProjectsView } from '../views/ProjectsView';
import { RoadmapView } from '../views/RoadmapView';
import { HelpView } from '../views/HelpView';
import { api, type Task, type Analytics } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function Dashboard() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [view, setView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const wsId = activeWorkspace?.id;

  const loadTasks = useCallback(async () => {
    const res = await api.tasks.list(wsId);
    setTasks(res.data);
  }, [wsId]);

  const loadAnalytics = useCallback(async () => {
    const res = await api.analytics();
    setAnalytics(res.data);
  }, []);

  useEffect(() => {
    loadTasks();
    loadAnalytics();
  }, [loadTasks, loadAnalytics]);

  useEffect(() => {
    const socket = io({ withCredentials: true });
    socket.emit('user:online', { id: user?.id, name: user?.name, email: user?.email });
    if (wsId) socket.emit('workspace:join', wsId);
    socket.on('collaborators:update', (users: unknown[]) => setOnlineCount(users.length || 1));
    socket.on('task:changed', () => {
      loadTasks();
      loadAnalytics();
    });
    return () => {
      socket.disconnect();
    };
  }, [user, wsId, loadTasks, loadAnalytics]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fuse = useMemo(
    () => new Fuse(tasks, { keys: ['title', 'description', 'status', 'priority'], threshold: 0.35 }),
    [tasks]
  );

  const filtered = search.trim() ? fuse.search(search).map((r) => r.item) : tasks;

  const createTask = async () => {
    if (!newTask.trim() || !wsId) return;
    const title = newTask.trim();
    setNewTask('');
    try {
      await api.tasks.create({ title, workspaceId: wsId });
      loadTasks();
      loadAnalytics();
    } catch {
      /* handled by api */
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.tasks.delete(id);
      loadAnalytics();
    } catch {
      loadTasks();
    }
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    try {
      await api.tasks.update(task.id, { status: next });
      loadAnalytics();
    } catch {
      loadTasks();
    }
  };

  const saveTask = async (id: string, data: Partial<Task>) => {
    await api.tasks.update(id, data);
    loadTasks();
    loadAnalytics();
  };

  const showTasks = ['dashboard', 'tasks'].includes(view);
  const showStats = ['dashboard', 'analytics'].includes(view);

  const renderView = () => {
    switch (view) {
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      case 'calendar':
        return <CalendarView tasks={tasks} />;
      case 'projects':
        return <ProjectsView />;
      case 'roadmap':
        return <RoadmapView tasks={tasks} />;
      case 'help':
        return <HelpView />;
      case 'ai':
        return (
          <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-white mb-2">AI Studio</h2>
            <p className="text-slate-500 text-sm mb-6">Analyze text with Gemini sentiment & risk.</p>
            <button
              onClick={() => setAiOpen(true)}
              className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium text-sm"
            >
              Open panel
            </button>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {showStats && analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Active Tasks" value={analytics.overview.activeTasks} sub={`${analytics.overview.totalTasks} total`} icon={Activity} accent="teal" delay={0} />
                <StatCard label="Pending" value={analytics.overview.pendingTasks} icon={Clock} accent="amber" delay={0.05} />
                <StatCard label="Completion" value={`${analytics.overview.completionRate}%`} icon={CheckCircle2} accent="teal" delay={0.1} />
                <StatCard label="Velocity" value={`${analytics.velocity.current}%`} sub={analytics.velocity.trend} icon={TrendingUp} accent="coral" delay={0.15} />
              </div>
            )}
            {showTasks && (
              <section>
                <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="font-display text-xl font-semibold text-white">Tasks</h2>
                  <div className="flex gap-2">
                    <input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createTask()}
                      placeholder="New task title..."
                      className="flex-1 sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40"
                    />
                    <motion.button
                      onClick={createTask}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium"
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </motion.button>
                  </div>
                </motion.div>
                <TaskTable
                  tasks={filtered}
                  onDelete={deleteTask}
                  onStatusToggle={toggleStatus}
                  onEdit={setEditTask}
                />
              </section>
            )}
            {view === 'analytics' && analytics?.aiInsights && (
              <motion.div className="glass rounded-2xl p-6 border border-teal-500/10">
                <h3 className="font-display font-semibold text-white mb-2">AI Insight</h3>
                <p className="text-slate-400 text-sm">{analytics.aiInsights.suggestion}</p>
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex">
      <Sidebar active={view} onNavigate={(id) => { setView(id); if (id === 'ai') setAiOpen(true); }} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="glass border-b border-white/5 px-4 lg:px-8 py-4 flex items-center gap-3 sticky top-0 z-30 flex-wrap">
          <button className="lg:hidden p-2 rounded-xl hover:bg-white/5" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <WorkspaceSwitcher />
          <div className="flex-1 min-w-[200px] max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks... (Ctrl+K)"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40"
            />
          </div>
          <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {onlineCount} online
          </span>
          <NotificationBell />
          <motion.button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white text-sm font-medium"
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </motion.button>
        </header>

        {!user?.emailVerified && (
          <div className="mx-4 lg:mx-8 mt-4 glass rounded-xl px-4 py-3 flex items-center gap-3 border border-amber-500/20 bg-amber-500/5">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-200 flex-1">Verify your email in Settings for full account security.</p>
            <button onClick={() => setView('settings')} className="text-xs text-teal-400 hover:text-teal-300">Settings</button>
          </div>
        )}

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      <TaskModal task={editTask} open={!!editTask} onClose={() => setEditTask(null)} onSave={saveTask} />
    </div>
  );
}
