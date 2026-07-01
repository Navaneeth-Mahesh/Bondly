import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-app-bg">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, #6c63ff 0%, transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Logo size={32} />
          <span className="text-xl font-bold text-text-primary">Bondly</span>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl font-bold text-text-primary mb-1 text-center">Reset password</h1>
              <p className="text-text-muted text-sm mb-8 text-center">Enter your email and we'll send reset instructions</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full neu-inset rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
                  </div>
                </div>
                <Button type="submit" fullWidth disabled={loading || !email} size="lg">
                  {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span> : 'Send reset link'}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Check your inbox</h2>
              <p className="text-text-muted text-sm mb-6">We sent reset instructions to <span className="text-text-secondary">{email}</span></p>
              <p className="text-text-muted text-xs">Didn't receive it? Check spam or <button onClick={() => setSent(false)} className="text-brand hover:underline">try again</button></p>
            </motion.div>
          )}
        </AnimatePresence>

        <Link to="/login" className="flex items-center justify-center gap-1.5 text-text-muted hover:text-text-secondary text-sm mt-8 transition-colors">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
