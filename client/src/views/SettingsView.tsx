import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export function SettingsView() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [verifyLink, setVerifyLink] = useState('');

  const saveProfile = async () => {
    setErr('');
    setMsg('');
    try {
      await api.auth.updateProfile({ name });
      await refreshUser();
      setMsg('Profile updated');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const savePassword = async () => {
    setErr('');
    setMsg('');
    try {
      const res = await api.auth.changePassword(currentPassword, newPassword);
      setMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Password change failed');
    }
  };

  const resendVerify = async () => {
    try {
      const res = await api.auth.resendVerification();
      if (res.verification?.devOnly) setVerifyLink(res.verification.devOnly);
      setMsg('Verification link sent (check server logs in dev)');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-white">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your account and security</p>
      </div>

      {!user?.emailVerified && (
        <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-300 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email not verified
          </p>
          <button onClick={resendVerify} className="mt-2 text-xs text-teal-400 hover:text-teal-300">
            Resend verification
          </button>
          {verifyLink && (
            <p className="mt-2 text-xs text-slate-500 break-all">
              Dev link: {verifyLink.replace('/verify-email?', '/verify-email?')}
            </p>
          )}
        </div>
      )}

      <section className="glass rounded-2xl p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-white font-medium">
          <User className="w-4 h-4 text-teal-400" /> Profile
        </h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
        />
        <motion.button
          onClick={saveProfile}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm"
          whileTap={{ scale: 0.98 }}
        >
          Save profile
        </motion.button>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-white font-medium">
          <Shield className="w-4 h-4 text-teal-400" /> Password
        </h3>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (8+ chars, upper, lower, number)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
        />
        <motion.button
          onClick={savePassword}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm"
          whileTap={{ scale: 0.98 }}
        >
          Change password
        </motion.button>
      </section>

      {msg && <p className="text-sm text-teal-400">{msg}</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}
    </motion.div>
  );
}
