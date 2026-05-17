import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Task } from '../lib/api';

const statusConfig: Record<string, { icon: typeof Circle; color: string }> = {
  ACTIVE: { icon: Clock, color: 'text-amber-400 bg-amber-400/10' },
  PENDING: { icon: Circle, color: 'text-slate-400 bg-slate-400/10' },
  COMPLETED: { icon: CheckCircle2, color: 'text-teal-400 bg-teal-400/10' },
  ARCHIVED: { icon: Circle, color: 'text-slate-600 bg-slate-600/10' },
};

const priorityColors: Record<string, string> = {
  HIGH: 'text-orange-400 border-orange-400/30',
  MEDIUM: 'text-amber-400 border-amber-400/30',
  LOW: 'text-slate-400 border-slate-400/30',
};

interface TaskTableProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onStatusToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
}

export function TaskTable({ tasks, onDelete, onStatusToggle, onEdit }: TaskTableProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-slate-500">
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-4 py-4 font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-4 font-medium hidden md:table-cell">Priority</th>
              <th className="px-4 py-4 font-medium hidden lg:table-cell">Assignee</th>
              <th className="px-6 py-4 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    No tasks yet. Create your first task above.
                  </td>
                </motion.tr>
              ) : (
                tasks.map((task, i) => {
                  const cfg = statusConfig[task.status] || statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.tr
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] group"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onStatusToggle(task)}
                          className="flex items-center gap-3 text-left w-full"
                        >
                          <motion.span
                            className={`p-1.5 rounded-lg ${cfg.color}`}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <StatusIcon className="w-4 h-4" />
                          </motion.span>
                          <span
                            className="text-slate-200 group-hover:text-white transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(task);
                            }}
                          >
                            {task.title}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.color}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs border ${priorityColors[task.priority] || priorityColors.MEDIUM}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-slate-400">
                        {task.assignee?.name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          onClick={() => onDelete(task.id)}
                          className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}


