import { motion } from 'framer-motion';
import { cn } from '../../utils';

const variants = {
  primary: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/25',
  secondary: 'neu-raised-sm text-text-secondary hover:text-text-primary',
  ghost: 'text-text-muted hover:text-text-primary hover:bg-surface-3',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
  follow: 'bg-text-primary text-app-bg hover:opacity-90 font-semibold',
  following: 'neu-raised-sm text-text-secondary hover:text-red-400',
};
const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, type = 'button', icon, fullWidth = false }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={disabled ? {} : { y: -1 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
