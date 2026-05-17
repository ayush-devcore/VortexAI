import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { api } from '../lib/api';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('fail');
      setMessage('Missing verification token');
      return;
    }
    api.auth
      .verifyEmail(token)
      .then(() => {
        setStatus('ok');
        setMessage('Your email has been verified. You can sign in now.');
      })
      .catch((e) => {
        setStatus('fail');
        setMessage(e instanceof Error ? e.message : 'Verification failed');
      });
  }, [params]);

  return (
    <motion.div
      className="min-h-screen gradient-mesh flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
        <Zap className="w-10 h-10 text-teal-400 mx-auto mb-4" />
        {status === 'loading' && <p className="text-slate-400">Verifying your email...</p>}
        {status === 'ok' && (
          <>
            <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <p className="text-white">{message}</p>
          </>
        )}
        {status === 'fail' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">{message}</p>
          </>
        )}
        <Link to="/login" className="inline-block mt-6 text-teal-400 hover:text-teal-300 text-sm">
          Go to sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}
