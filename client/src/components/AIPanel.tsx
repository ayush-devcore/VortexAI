import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import { api } from '../lib/api';

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIPanel({ open, onClose }: AIPanelProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.summarize(text);
      setResult(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-strong z-50 flex flex-col shadow-2xl shadow-teal-500/5"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <motion.div
              className="flex items-center justify-between p-6 border-b border-white/5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="font-display font-semibold text-white">AI Studio</h2>
                  <p className="text-xs text-slate-500">Powered by Gemini</p>
                </div>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste meeting notes, feedback, or any text to analyze sentiment and risk..."
                className="w-full h-36 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
              />
              <motion.button
                onClick={analyze}
                disabled={loading || !text.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </motion.button>

              {error && (
                <motion.p
                  className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <AnimatePresence>
                {result && (
                  <motion.div
                    className="markdown-body glass rounded-xl p-5"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    dangerouslySetInnerHTML={{ __html: marked.parse(result) as string }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
