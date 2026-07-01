import { BadgeCheck } from 'lucide-react';

export function VerifiedBadge({ size = 14 }) {
  return <BadgeCheck size={size} className="text-brand flex-shrink-0" fill="currentColor" />;
}

export function Divider({ className = '' }) {
  return <div className={`border-t border-border-base ${className}`} />;
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-border-base border-t-brand rounded-full animate-spin`} />
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4"><Icon size={28} className="text-text-muted" /></div>}
      <p className="text-text-secondary font-medium text-lg mb-1">{title}</p>
      {subtitle && <p className="text-text-muted text-sm mb-6">{subtitle}</p>}
      {action}
    </div>
  );
}
