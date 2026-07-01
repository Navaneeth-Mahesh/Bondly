import { useState, useRef } from 'react';
import { Image, X, Globe } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import EmojiPickerButton from '../common/EmojiPickerButton';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { fileToBase64 } from '../../utils/fileToBase64';

export default function CreatePostModal({ isOpen, onClose }) {
  const { addPost } = useApp();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [previewImg, setPreviewImg] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const textareaRef = useRef();

  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    if (!el) { setContent((c) => c + emoji); return; }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    setError('');
    try {
      await addPost(content.trim(), previewImg);
      setContent('');
      setPreviewImg(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToBase64(file, { maxSizeMB: 4 });
      setPreviewImg(dataUrl);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-start gap-3 mb-4">
        <Avatar src={user?.avatar} alt={user?.name} size="md" ring />
        <div className="flex-1">
          <p className="font-semibold text-text-primary text-sm">{user?.name}</p>
          <button className="flex items-center gap-1 text-xs text-brand mt-0.5 glass px-2 py-0.5 rounded-full">
            <Globe size={10} /> Public
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        autoFocus
        className="w-full bg-transparent text-text-primary placeholder-text-muted text-base resize-none outline-none leading-relaxed mb-4"
      />

      {previewImg && (
        <div className="relative mb-4 rounded-xl overflow-hidden bg-surface-3">
          <img src={previewImg} alt="preview" className="w-full h-auto max-h-[420px] object-contain" />
          <button onClick={() => setPreviewImg(null)}
            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs text-center py-2 mb-3 glass rounded-xl border border-red-500/20">{error}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border-base">
        <div className="flex items-center gap-1">
          <button onClick={() => fileRef.current?.click()}
            className="p-2 rounded-xl text-text-muted hover:text-brand hover:bg-brand/10 transition-colors">
            <Image size={20} />
          </button>
          <EmojiPickerButton onSelect={insertEmoji} placement="top"
            className="p-2 rounded-xl text-text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="flex items-center gap-3">
          {content.length > 0 && (
            <span className={`text-xs ${content.length > 1800 ? 'text-red-400' : 'text-text-muted'}`}>
              {2000 - content.length}
            </span>
          )}
          <Button onClick={handlePost} disabled={!content.trim() || content.length > 2000 || posting} size="sm">
            {posting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
