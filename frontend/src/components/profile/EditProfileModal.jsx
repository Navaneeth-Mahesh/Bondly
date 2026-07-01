import { useState, useEffect, useRef } from 'react';
import { Camera, X, User as UserIcon } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api';
import { fileToBase64 } from '../../utils/fileToBase64';

export default function EditProfileModal({ isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', location: '', website: '', avatar: '', cover: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef();
  const coverInputRef = useRef();

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
        cover: user.cover || '',
      });
      setError('');
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const { user: updated } = await usersApi.updateProfile(form);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError('');
    try {
      const dataUrl = await fileToBase64(file, { maxSizeMB: 4 });
      setForm((p) => ({ ...p, avatar: dataUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError('');
    try {
      const dataUrl = await fileToBase64(file, { maxSizeMB: 4 });
      setForm((p) => ({ ...p, cover: dataUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full neu-inset rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all"
      />
    </div>
  );

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit profile" size="md">
      {/* Cover */}
      <div className="relative h-28 rounded-xl overflow-hidden mb-14 -mx-5 -mt-5 group bg-surface-3">
        {form.cover ? (
          <img src={form.cover} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30" />
        )}
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadingCover}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <div className="p-2.5 rounded-full bg-black/60 text-white">
            <Camera size={18} />
          </div>
        </button>
        {form.cover && (
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, cover: '' }))}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
      </div>

      {/* Avatar */}
      <div className="absolute top-[calc(4rem+52px)] left-1/2 -translate-x-1/2 group cursor-pointer">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative block w-24 h-24 rounded-full overflow-hidden avatar-ring bg-surface-3"
        >
          {form.avatar ? (
            <img src={form.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/40 to-indigo-500/40">
              <UserIcon size={32} className="text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
        </button>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
      </div>

      <div className="space-y-4 mt-2">
        {field('Display name', 'name', 'text', 'Your name')}
        <div>
          <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1.5 block">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell your story..."
            rows={3}
            maxLength={160}
            className="w-full neu-inset rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-brand/30 transition-all resize-none"
          />
          <p className="text-xs text-text-muted text-right mt-1">{form.bio.length}/160</p>
        </div>
        {field('Location', 'location', 'text', 'City, Country')}
        {field('Website', 'website', 'text', 'yoursite.com')}

        {(uploadingAvatar || uploadingCover) && (
          <p className="text-xs text-brand text-center">Processing image...</p>
        )}
        {error && (
          <p className="text-red-400 text-xs text-center py-2 glass rounded-xl border border-red-500/20">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={saving}>Cancel</Button>
          <Button fullWidth onClick={handleSave} disabled={saving || uploadingAvatar || uploadingCover}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
