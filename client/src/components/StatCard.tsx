import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: 'teal' | 'amber' | 'coral';
  delay?: number;
}

const accents = {
  teal: 'from-teal-500/20 to-cyan-500/5 border-teal-500/20 text-teal-400',
  amber: 'from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-400',
  coral: 'from-orange-500/20 to-red-500/5 border-orange-500/20 text-orange-400',
};

export function StatCard({ label, value, sub, icon: Icon, accent = 'teal', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl p-5 border bg-gradient-to-br ${accents[accent]}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4"
        whileHover={{ rotate: 8, scale: 1.1 }}
      >
        <Icon className={`w-5 h-5 ${accents[accent].split(' ').pop()}`} />
      </motion.div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <motion.p
        className="text-3xl font-display font-bold text-white"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        {value}
      </motion.p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}
