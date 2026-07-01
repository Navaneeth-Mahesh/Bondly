import { cn } from '../../utils';

const sizes = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

const PALETTE = [
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
];

const colorFor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

const initialsFor = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Avatar({ src, alt, size = 'md', ring = false, className = '' }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt || 'user avatar'}
        className={cn(
          sizes[size],
          'rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white bg-gradient-to-br',
          colorFor(alt),
          ring && 'avatar-ring',
          className
        )}
      >
        {initialsFor(alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'avatar'}
      className={cn(
        sizes[size],
        'rounded-full object-cover bg-surface-3 flex-shrink-0',
        ring && 'avatar-ring',
        className
      )}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}
