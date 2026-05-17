import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { api } from '../lib/api';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, refreshWorkspaces } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const create = async () => {
    if (!name.trim()) return;
    await api.workspaces.create(name.trim());
    setName('');
    setCreating(false);
    await refreshWorkspaces();
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-teal-500/30"
        whileTap={{ scale: 0.98 }}
      >
        <span className="max-w-[120px] truncate">{activeWorkspace?.name || 'Workspace'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute left-0 top-full mt-2 w-56 glass-strong rounded-xl z-50 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 ${
                    ws.id === activeWorkspace?.id ? 'text-teal-300 bg-teal-500/10' : 'text-slate-300'
                  }`}
                >
                  {ws.name}
                </button>
              ))}
              <div className="border-t border-white/5 p-2">
                {creating ? (
                  <div className="flex gap-1">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && create()}
                      placeholder="Workspace name"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                      autoFocus
                    />
                    <button onClick={create} className="px-2 py-1.5 text-xs bg-teal-600 rounded-lg text-white">
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCreating(true)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-400 hover:text-teal-400"
                  >
                    <Plus className="w-3 h-3" /> New workspace
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
