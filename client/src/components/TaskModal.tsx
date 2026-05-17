import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Task } from '../lib/api';

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Task>) => Promise<void>;
}

export function TaskModal({ task, open, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    }
  }, [task]);

  const save = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && task && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass-strong rounded-2xl z-50 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-semibold text-white">Edit task</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <motion.div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none"
                />
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    {['PENDING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm"
              >
                Cancel
              </button>
              <motion.button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
