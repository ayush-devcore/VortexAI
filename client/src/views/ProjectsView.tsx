import { motion } from 'framer-motion';
import { FolderKanban, Users, CheckSquare } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function ProjectsView() {
  const { workspaces } = useWorkspace();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Projects</h2>
        <p className="text-slate-500 text-sm mt-1">Your workspaces as projects</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workspaces.map((ws, i) => (
          <motion.div
            key={ws.id}
            className="glass rounded-2xl p-6 hover:border-teal-500/20 border border-transparent transition-colors"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-start gap-3">
              <motion.div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-teal-400" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-white">{ws.name}</h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                  {ws.description || 'No description'}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {ws._count?.members ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" /> {ws._count?.tasks ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
