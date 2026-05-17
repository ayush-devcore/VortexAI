import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Zap,
  Calendar,
  FolderKanban,
  Map,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai', label: 'AI Studio', icon: Sparkles },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ active, onNavigate, mobileOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={{ x: -120, opacity: 0.8 }}
        animate={{
          x: mobileOpen || window.innerWidth >= 1024 ? 0 : -120,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 28,
        }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-strong flex flex-col
     lg:translate-x-0
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">Vortex</h1>
            <p className="text-xs text-slate-500">Workspace v4</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((item, i) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? 'bg-teal-500/15 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <motion.div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-slate-900">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <motion.button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </motion.button>
        </motion.div>
      </motion.aside>
    </>
  );
}
