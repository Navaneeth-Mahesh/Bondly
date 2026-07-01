import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', noPadding = false }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full mx-4' };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14, rotateX: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10, rotateX: 2 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            style={{ transformPerspective: 1000 }}
            className={`relative w-full ${sizes[size]} bg-surface neu-raised rounded-[28px] z-10 max-h-[90vh] flex flex-col`}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-border-base">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}
            {!title && (
              <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            )}
            <div className={`overflow-y-auto flex-1 ${noPadding ? '' : 'p-5'}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
