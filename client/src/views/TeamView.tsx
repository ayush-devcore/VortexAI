import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { api, type WorkspaceMember } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';

export function TeamView() {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!activeWorkspace) return;
    const res = await api.workspaces.members.list(activeWorkspace.id);
    setMembers(res.data);
  };

  useEffect(() => {
    load();
  }, [activeWorkspace?.id]);

  const invite = async () => {
    if (!activeWorkspace || !email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.workspaces.members.invite(activeWorkspace.id, email.trim());
      setEmail('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (userId: string) => {
    if (!activeWorkspace) return;
    await api.workspaces.members.remove(activeWorkspace.id, userId);
    load();
  };

  if (!activeWorkspace) {
    return <p className="text-slate-500 text-center py-12">Select or create a workspace first.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Team</h2>
        <p className="text-slate-500 text-sm mt-1">{activeWorkspace.name} members</p>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && invite()}
            placeholder="colleague@company.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white"
          />
        </div>
        <motion.button
          onClick={invite}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium"
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </motion.button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="glass rounded-2xl divide-y divide-white/5">
        {members.map((m, i) => (
          <motion.div
            key={m.id}
            className="flex items-center gap-4 p-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-slate-900">
              {m.user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">{m.user.name}</p>
              <p className="text-slate-500 text-sm truncate">{m.user.email}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg bg-teal-500/10 text-teal-300">{m.role}</span>
            {m.user.id !== user?.id && (
              <button
                onClick={() => remove(m.user.id)}
                className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
