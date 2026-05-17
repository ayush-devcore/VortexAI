import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalIcon } from 'lucide-react';
import type { Task } from '../lib/api';

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const withDue = useMemo(
    () => tasks.filter((t) => t.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()),
    [tasks]
  );

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {};
    withDue.forEach((t) => {
      const key = new Date(t.dueDate!).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      if (!g[key]) g[key] = [];
      g[key].push(t);
    });
    return g;
  }, [withDue]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <motion.div>
        <h2 className="font-display text-2xl font-semibold text-white flex items-center gap-2">
          <CalIcon className="w-6 h-6 text-teal-400" /> Calendar
        </h2>
        <p className="text-slate-500 text-sm mt-1">Tasks with due dates</p>
      </motion.div>

      {withDue.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-slate-500">
          No scheduled tasks. Add a due date when editing a task.
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayTasks], i) => (
          <motion.div
            key={date}
            className="glass rounded-2xl p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <h3 className="text-teal-300 text-sm font-medium mb-3">{date}</h3>
            <div className="space-y-2">
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5"
                >
                  <span className="text-slate-200 text-sm">{t.title}</span>
                  <span className="text-xs text-slate-500">{t.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
