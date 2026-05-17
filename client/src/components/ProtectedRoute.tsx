import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <motion.div
        className="min-h-screen gradient-mesh flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-teal-500/30 border-t-teal-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 text-sm">Loading workspace...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
