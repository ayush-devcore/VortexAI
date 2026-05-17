import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen gradient-mesh flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-teal-500/5 blur-3xl"
            style={{ left: `${10 + i * 15}%`, top: `${5 + (i % 3) * 30}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity }}
          />
        ))}
      </motion.div>

      <motion.div
        className="w-full max-w-md glass-strong rounded-3xl p-8 relative"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 24 }}
      >
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25"
            whileHover={{ rotate: 10, scale: 1.05 }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to Vortex Workspace</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Email</label>
            <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                placeholder="you@company.com"
              />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                placeholder="••••••••"
              />
            </div>
          </motion.div>

          {error && (
            <motion.p
              className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <motion.p
          className="mt-6 text-center text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
            Create one
          </Link>
        </motion.p>

        <motion.p
          className="mt-4 text-center text-xs text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Demo: admin@vortex.io / Password123
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
