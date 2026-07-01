import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from './index';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

// A button that opens an emoji picker popover and inserts the chosen emoji
// via onSelect(emojiChar). Positions above or below depending on `placement`.
export default function EmojiPickerButton({ onSelect, className = '', iconSize = 20, placement = 'top' }) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={className || 'p-2 rounded-xl text-text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors'}
      >
        <Smile size={iconSize} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0`}
          >
            <Suspense fallback={
              <div className="w-[300px] h-[360px] rounded-2xl glass-strong flex items-center justify-center">
                <Spinner />
              </div>
            }>
              <EmojiPicker
                onEmojiClick={(emojiData) => { onSelect(emojiData.emoji); setOpen(false); }}
                theme={isDark ? 'dark' : 'light'}
                lazyLoadEmojis
                skinTonesDisabled
                searchDisabled={false}
                width={300}
                height={360}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
