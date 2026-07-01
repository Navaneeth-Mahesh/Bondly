import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p) => /[a-zA-Z]/.test(p) },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.username.trim()) errs.username = 'Required';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username)) errs.username = 'Lowercase letters, numbers, underscores only (3–20 chars)';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.password.length < 8) errs.password = 'At least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type, placeholder, Icon) => (
    <div>
      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type={type === 'password' ? (showPass ? 'text' : 'password') : type}
          value={form[key]} onChange={update(key)} placeholder={placeholder}
          className={`w-full glass rounded-xl pl-9 ${type === 'password' ? 'pr-10' : 'pr-4'} py-3 text-sm text-text-primary placeholder-text-muted outline-none border transition-colors
            ${errors[key] ? 'border-red-500/50' : 'border-border-base focus:border-brand/50'}`}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #6c63ff 0%, transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size={32} />
          <span className="text-xl font-bold text-text-primary">Bondly</span>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-1 text-center">Create account</h1>
        <p className="text-text-muted text-sm mb-8 text-center">Join thousands of creators and thinkers</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Full Name', 'text', 'Jane Doe', User)}
          {field('username', 'Username', 'text', 'janedoe', User)}
          {field('email', 'Email', 'email', 'jane@example.com', Mail)}
          {field('password', 'Password', 'password', '••••••••', Lock)}

          {form.password && (
            <div className="glass rounded-xl p-3 space-y-1.5">
              {requirements.map(req => (
                <div key={req.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${req.test(form.password) ? 'bg-green-500' : 'bg-surface-3'}`}>
                    {req.test(form.password) && <Check size={10} className="text-text-primary" strokeWidth={3} />}
                  </div>
                  <span className={`text-xs transition-colors ${req.test(form.password) ? 'text-green-400' : 'text-text-muted'}`}>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          {errors.form && (
            <p className="text-red-400 text-xs text-center py-2 glass rounded-xl px-3 border border-red-500/20">
              {errors.form}
            </p>
          )}

          <Button type="submit" fullWidth disabled={loading} size="lg" className="mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-text-muted text-xs mt-4">
          By signing up you agree to our{' '}
          <span className="text-brand cursor-pointer hover:underline">Terms</span>{' '}and{' '}
          <span className="text-brand cursor-pointer hover:underline">Privacy Policy</span>
        </p>

        <p className="text-center text-text-muted text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-violet-400 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
