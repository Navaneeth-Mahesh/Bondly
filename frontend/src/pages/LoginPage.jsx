import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — always dark, brand showcase */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6c63ff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #22d3ee 0%, transparent 50%)' }} />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-2xl font-bold text-white tracking-tight">Bondly</span>
          </div>
        </div>

        <div className="relative">
          <blockquote className="text-4xl font-light text-white leading-snug mb-6">
            "Real <span className="font-semibold gradient-text">connection</span> starts with a single bond."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              HM
            </div>
            <div>
              <p className="text-white font-medium text-sm">Hannah Moore</p>
              <p className="text-white/40 text-xs">3x Founder · @hannahmoore</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-8 text-white/40 text-sm">
          <span>© 2026 Bondly</span>
          <span>·</span>
          <span>Privacy</span>
          <span>·</span>
          <span>Terms</span>
        </div>
      </div>

      {/* Right Panel — theme aware */}
      <div className="flex-1 flex items-center justify-center p-6 relative bg-app-bg">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6c63ff 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <Logo size={32} />
            <span className="text-xl font-bold text-text-primary">Bondly</span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
          <p className="text-text-muted text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full neu-inset rounded-xl pl-9 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand hover:text-violet-400 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full neu-inset rounded-xl pl-9 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center py-2 glass rounded-xl px-3 border border-red-500/20">
                {error}
              </motion.p>
            )}

            <Button type="submit" fullWidth disabled={loading} size="lg" className="mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand hover:text-violet-400 font-medium transition-colors">Sign up</Link>
          </p>

          <p className="text-center text-text-muted text-xs mt-3">
            Tip: after seeding the backend, try <span className="text-text-secondary">alexrivera@example.com</span> / <span className="text-text-secondary">password123</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
