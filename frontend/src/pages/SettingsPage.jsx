import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Shield, Mail, Moon, Sun,
  LogOut, Trash2, Check, AlertTriangle, ChevronRight,
  Globe, Eye, EyeOff, UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EditProfileModal from '../components/profile/EditProfileModal';
import { usersApi } from '../api';

const SECTIONS = [
  { key: 'account', icon: User, label: 'Account', color: 'from-violet-500 to-indigo-500' },
  { key: 'privacy', icon: Shield, label: 'Privacy & Safety', color: 'from-blue-500 to-cyan-500' },
  { key: 'appearance', icon: Palette, label: 'Appearance', color: 'from-rose-500 to-pink-500' },
  { key: 'notifications', icon: Bell, label: 'Notifications', color: 'from-amber-500 to-orange-500' },
];

function NeuToggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 disabled:opacity-50 focus:outline-none
        ${checked ? 'neu-inset' : 'neu-inset'}`}
      style={{ background: checked ? 'linear-gradient(135deg, #6c63ff, #818cf8)' : undefined }}
    >
      <motion.div
        className="bg-white rounded-full absolute shadow-sm"
        animate={{ left: checked ? '24px' : '3px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18, top: 3 }}
      />
    </button>
  );
}

function SettingGroup({ title, children }) {
  return (
    <div className="mb-6">
      {title && <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 px-1">{title}</p>}
      <div className="neu-raised-sm rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, iconColor, title, subtitle, action, onClick, last }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors
        ${onClick ? 'hover:bg-surface-3/60 active:bg-surface-3' : ''}
        ${!last ? 'border-b border-border-base' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${iconColor || 'from-violet-500 to-indigo-500'}`}>
            <Icon size={15} className="text-white" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          {subtitle && <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        {action || (onClick && <ChevronRight size={16} className="text-text-muted" />)}
      </div>
    </Wrapper>
  );
}

const DEFAULT_PREFS = {
  privateAccount: false, showActivityStatus: true, allowTagging: true, allowMessages: true,
  reduceMotion: false, notifyLikes: true, notifyComments: true, notifyFollows: true,
  notifyMentions: true, emailNotifications: false, pushNotifications: true,
};

export default function SettingsPage() {
  const [active, setActive] = useState('account');
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { logout, user, updateUser } = useAuth();
  const { theme, setLight, setDark } = useTheme();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savingPref, setSavingPref] = useState(null);

  useEffect(() => {
    if (user?.preferences) {
      setPrefs(p => ({ ...p, ...user.preferences }));
    }
  }, [user?.preferences]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const updatePref = async (key, value) => {
    setPrefs(p => ({ ...p, [key]: value }));
    setSavingPref(key);
    try {
      const { preferences } = await usersApi.updatePreferences({ [key]: value });
      updateUser({ preferences });
    } catch {
      setPrefs(p => ({ ...p, [key]: !value }));
    } finally {
      setSavingPref(null);
    }
  };

  if (!user) return null;

  // Mobile: show a category list page then the section; desktop: sidebar + content
  const renderContent = () => {
    switch (active) {
      case 'account': return (
        <motion.div key="account" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          {/* Profile card */}
          <SettingGroup>
            <div className="px-4 py-4 flex items-center gap-3">
              <Avatar src={user.avatar} alt={user.name} size="lg" ring />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{user.name}</p>
                <p className="text-xs text-text-muted">@{user.username}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
            </div>
          </SettingGroup>

          <SettingGroup title="Security">
            <SettingRow icon={Lock} iconColor="from-violet-500 to-purple-500"
              title="Change password" subtitle="Update your account password"
              onClick={() => setPasswordOpen(true)} />
            <SettingRow icon={Mail} iconColor="from-blue-500 to-cyan-500"
              title="Email address" subtitle={user.email}
              action={<span className="text-xs text-green-400 font-medium">Verified</span>} last />
          </SettingGroup>

          <SettingGroup title="Danger zone">
            <div className="px-4 py-3 flex items-center justify-between border border-red-500/20 rounded-2xl bg-red-500/5">
              <div>
                <p className="text-sm font-medium text-text-primary">Delete account</p>
                <p className="text-xs text-text-muted mt-0.5">Permanently delete all your data</p>
              </div>
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setDeleteOpen(true)}>Delete</Button>
            </div>
          </SettingGroup>

          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors text-sm font-medium mt-2">
            <LogOut size={16} /> Sign out
          </button>
        </motion.div>
      );

      case 'privacy': return (
        <motion.div key="privacy" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          {/* Private account — prominently featured */}
          <div className="mb-5 p-4 neu-raised-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                {prefs.privateAccount ? <EyeOff size={18} className="text-white" /> : <Globe size={18} className="text-white" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">
                  {prefs.privateAccount ? 'Private account' : 'Public account'}
                </p>
                <p className="text-xs text-text-muted">
                  {prefs.privateAccount
                    ? 'Only approved followers can see your posts'
                    : 'Anyone can see your posts and follow you'}
                </p>
              </div>
              <NeuToggle checked={prefs.privateAccount} disabled={savingPref === 'privateAccount'} onChange={v => updatePref('privateAccount', v)} />
            </div>
            <AnimatePresence>
              {prefs.privateAccount && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="mt-1 pt-3 border-t border-border-base flex items-center gap-2">
                    <UserCheck size={13} className="text-brand flex-shrink-0" />
                    <p className="text-xs text-text-muted">New followers need your approval. Existing followers are not affected.</p>
                  </div>
                  <Link to="/profile" className="mt-2 flex items-center gap-1.5 text-xs text-brand hover:underline">
                    <UserCheck size={12} /> Manage pending follow requests →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SettingGroup title="Interactions">
            <SettingRow icon={Eye} iconColor="from-slate-400 to-slate-500"
              title="Show activity status" subtitle="Let others see when you were last active"
              action={<NeuToggle checked={prefs.showActivityStatus} disabled={savingPref === 'showActivityStatus'} onChange={v => updatePref('showActivityStatus', v)} />} />
            <SettingRow title="Allow tagging" subtitle="Let others tag you in posts"
              action={<NeuToggle checked={prefs.allowTagging} disabled={savingPref === 'allowTagging'} onChange={v => updatePref('allowTagging', v)} />} />
            <SettingRow title="Allow direct messages" subtitle="Anyone can send you a message"
              action={<NeuToggle checked={prefs.allowMessages} disabled={savingPref === 'allowMessages'} onChange={v => updatePref('allowMessages', v)} />} last />
          </SettingGroup>
        </motion.div>
      );

      case 'appearance': return (
        <motion.div key="appearance" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 px-1">Theme</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { id: 'dark', label: 'Dark', Icon: Moon, preview: '#000', iconColor: 'text-violet-400', action: setDark },
              { id: 'light', label: 'Light', Icon: Sun, preview: '#f0f0f3', iconColor: 'text-amber-400', action: setLight },
            ].map(opt => (
              <button key={opt.id} onClick={opt.action}
                className={`relative p-4 rounded-2xl transition-all text-left ${theme === opt.id ? 'neu-inset ring-2 ring-brand/40' : 'neu-raised-sm hover:scale-[1.02]'}`}>
                {theme === opt.id && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
                <div className="w-full aspect-video rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: opt.preview, border: '1px solid rgba(128,128,128,0.15)' }}>
                  <opt.Icon size={22} className={opt.iconColor} />
                </div>
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
              </button>
            ))}
          </div>

          <SettingGroup title="Motion">
            <SettingRow title="Reduce motion" subtitle="Minimize animations and transitions"
              action={<NeuToggle checked={prefs.reduceMotion} disabled={savingPref === 'reduceMotion'} onChange={v => updatePref('reduceMotion', v)} />} last />
          </SettingGroup>
        </motion.div>
      );

      case 'notifications': return (
        <motion.div key="notifications" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <SettingGroup title="Activity">
            <SettingRow icon={Bell} iconColor="from-rose-500 to-pink-500"
              title="Likes" subtitle="When someone likes your post"
              action={<NeuToggle checked={prefs.notifyLikes} disabled={savingPref === 'notifyLikes'} onChange={v => updatePref('notifyLikes', v)} />} />
            <SettingRow title="Comments" subtitle="When someone comments on your post"
              action={<NeuToggle checked={prefs.notifyComments} disabled={savingPref === 'notifyComments'} onChange={v => updatePref('notifyComments', v)} />} />
            <SettingRow title="New followers" subtitle="When someone follows you"
              action={<NeuToggle checked={prefs.notifyFollows} disabled={savingPref === 'notifyFollows'} onChange={v => updatePref('notifyFollows', v)} />} />
            <SettingRow title="Mentions" subtitle="When someone mentions you"
              action={<NeuToggle checked={prefs.notifyMentions} disabled={savingPref === 'notifyMentions'} onChange={v => updatePref('notifyMentions', v)} />} last />
          </SettingGroup>

          <SettingGroup title="Delivery">
            <SettingRow title="Push notifications" subtitle="Notify on this device"
              action={<NeuToggle checked={prefs.pushNotifications} disabled={savingPref === 'pushNotifications'} onChange={v => updatePref('pushNotifications', v)} />} />
            <SettingRow title="Email digest" subtitle="Weekly summary to your inbox"
              action={<NeuToggle checked={prefs.emailNotifications} disabled={savingPref === 'emailNotifications'} onChange={v => updatePref('emailNotifications', v)} />} last />
          </SettingGroup>
        </motion.div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block w-64 flex-shrink-0 border-r border-border-base p-5 sticky top-0 h-screen">
        <h1 className="text-lg font-semibold text-text-primary mb-6">Settings</h1>
        <nav className="space-y-1">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all
                ${active === s.key ? 'neu-pill-active' : 'text-text-secondary hover:text-text-primary neu-pressable'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.color}`}>
                <s.icon size={14} className="text-white" />
              </div>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-border-base absolute bottom-5 left-5 right-5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      {/* Mobile: show category cards first, then content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile tabs */}
        <div className="sm:hidden sticky top-0 z-20 glass border-b border-border-base overflow-x-auto">
          <div className="flex px-2 py-1 gap-1">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setActive(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                  ${active === s.key ? 'neu-pill-active' : 'text-text-muted'}`}>
                <s.icon size={13} /> {s.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-5 sm:p-8 max-w-xl">
          <div className="hidden sm:block mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {SECTIONS.find(s => s.key === active)?.label}
            </h2>
          </div>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} onUpdated={updateUser} />
      <ChangePasswordModal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <DeleteAccountModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}

function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (isOpen) { setForm({ currentPassword: '', newPassword: '', confirm: '' }); setError(''); setSuccess(false); } }, [isOpen]);

  const submit = async () => {
    if (form.newPassword !== form.confirm) { setError("New passwords don't match"); return; }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await usersApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change password" size="sm">
      {success
        ? <p className="text-center text-green-400 py-4">Password updated ✓</p>
        : <div className="space-y-3">
            {[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirm', 'Confirm new password']].map(([key, ph]) => (
              <input key={key} type="password" placeholder={ph} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full neu-inset rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none" />
            ))}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>Cancel</Button>
              <Button fullWidth onClick={submit} disabled={loading || !form.currentPassword || !form.newPassword}>
                {loading ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </div>
      }
    </Modal>
  );
}

function DeleteAccountModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (isOpen) { setPassword(''); setError(''); } }, [isOpen]);

  const handleDelete = async () => {
    if (!password) { setError('Please enter your password to confirm'); return; }
    setLoading(true); setError('');
    try {
      await usersApi.deleteAccount(password);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete account" size="sm">
      <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-300">This permanently deletes your account, posts, comments and messages. This cannot be undone.</p>
      </div>
      <input type="password" placeholder="Enter your password to confirm" value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full neu-inset rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none mb-3" />
      {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" fullWidth onClick={handleDelete} disabled={loading || !password}>
          {loading ? 'Deleting...' : 'Delete forever'}
        </Button>
      </div>
    </Modal>
  );
}
