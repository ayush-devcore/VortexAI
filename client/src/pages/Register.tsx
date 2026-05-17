import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifyLink, setVerifyLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const link = await register(name, email, password);
      if (link) setVerifyLink(link);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        className="w-full max-w-md glass-strong rounded-3xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <motion.div>
            <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
            <p className="text-slate-500 text-sm">Join Vortex Workspace</p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Name', icon: User, value: name, onChange: setName, type: 'text', placeholder: 'Your name' },
            { label: 'Email', icon: Mail, value: email, onChange: setEmail, type: 'email', placeholder: 'you@company.com' },
            { label: 'Password', icon: Lock, value: password, onChange: setPassword, type: 'password', placeholder: 'Min 8 chars, upper, lower, number' },
          ].map((field, i) => {
            const Icon = field.icon;
            return (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">{field.label}</label>
                <motion.div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50"
                    placeholder={field.placeholder}
                  />
                </motion.div>
              </motion.div>
            );
          })}

          {error && (
            <motion.p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">{error}</motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-teal-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating...' : 'Create account'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
