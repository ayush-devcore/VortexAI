import { motion } from 'framer-motion';
import { BookOpen, Keyboard, Sparkles, Shield } from 'lucide-react';

const sections = [
  {
    icon: BookOpen,
    title: 'Getting started',
    body: 'Sign in, pick a workspace from the header switcher, and create tasks from the Dashboard or Tasks view.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard shortcuts',
    body: 'Ctrl+K — focus search. Enter — create task from the input field.',
  },
  {
    icon: Sparkles,
    title: 'AI Studio',
    body: 'Paste notes or feedback to get sentiment, risk level, and an executive summary powered by Gemini.',
  },
  {
    icon: Shield,
    title: 'Security',
    body: 'Sessions use short-lived access tokens and rotating refresh tokens stored in HTTP-only cookies.',
  },
];

export function HelpView() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Help & Docs</h2>
        <p className="text-slate-500 text-sm mt-1">Vortex Workspace v4 guide</p>
      </div>
      <div className="space-y-4">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              className="glass rounded-2xl p-5"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex gap-3">
                <Icon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white">{s.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
