import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import { api, type Notification } from '../lib/api';
import { io } from 'socket.io-client';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await api.notifications.list();
    setItems(res.data);
    setUnread(res.unreadCount);
  }, []);

  useEffect(() => {
    load();
    const socket = io({ withCredentials: true });
    socket.on('notification:new', () => load());
    return () => {
      socket.disconnect();
    };
  }, [load]);

  const markRead = async (id: string) => {
    await api.notifications.markRead(id);
    load();
  };

  const markAll = async () => {
    await api.notifications.markAllRead();
    load();
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl hover:bg-white/5 text-slate-400"
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <motion.span
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
            >
              <motion.div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-semibold text-white text-sm">Notifications</h3>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs text-teal-400 hover:text-teal-300">
                    Mark all read
                  </button>
                )}
              </motion.div>
              <motion.div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="p-6 text-center text-slate-500 text-sm">No notifications</p>
                ) : (
                  items.map((n) => (
                    <motion.button
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-teal-500/5' : ''}`}
                    >
                      <div className="flex gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
