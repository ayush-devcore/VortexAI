import { motion } from 'framer-motion';
import type { Task } from '../lib/api';

const columns = [
  { id: 'PENDING', label: 'Backlog', color: 'border-slate-500/30' },
  { id: 'ACTIVE', label: 'In Progress', color: 'border-amber-500/30' },
  { id: 'COMPLETED', label: 'Done', color: 'border-teal-500/30' },
];

export function RoadmapView({ tasks }: { tasks: Task[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Roadmap</h2>
        <p className="text-slate-500 text-sm mt-1">Kanban board by status</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, ci) => (
          <motion.div
            key={col.id}
            className={`glass rounded-2xl p-4 border-t-2 ${col.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
          >
            <h3 className="text-sm font-medium text-slate-300 mb-4">
              {col.label}{' '}
              <span className="text-slate-600">({tasks.filter((t) => t.status === col.id).length})</span>
            </h3>
            <div className="space-y-2 min-h-[120px]">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t, i) => (
                  <motion.div
                    key={t.id}
                    className="p-3 rounded-xl bg-white/5 text-sm text-slate-200"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {t.title}
                    <span className="block text-[10px] text-slate-600 mt-1">{t.priority}</span>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
