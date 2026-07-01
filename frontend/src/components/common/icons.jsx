// Custom icon set for Bondly's navigation, designed to match a consistent
// filled/outline duo style (filled when active, outline when inactive),
// matching the pill-nav reference. Each icon accepts `filled` and `size` props.

export function HomeIcon({ size = 20, filled = false, className = '' }) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5 2.5 11h3v9.5h5.5V14h2v6.5H18.5V11h3z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.5 2.5 11h3v9.5h5.5V14h2v6.5H18.5V11h3z" />
    </svg>
  );
}

export function CompassIcon({ size = 20, filled = false, className = '' }) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" fill="var(--color-app-bg, #fff)" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

export function ChatBubbleIcon({ size = 20, filled = false, className = '' }) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c-5.25 0-9.5 3.86-9.5 8.62 0 2.62 1.3 4.96 3.36 6.55-.1 1.2-.5 2.46-1.18 3.58a.5.5 0 0 0 .58.73c1.84-.55 3.32-1.34 4.4-2.07.74.16 1.52.25 2.34.25 5.25 0 9.5-3.86 9.5-8.62S17.25 2.5 12 2.5z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.5c-5.25 0-9.5 3.86-9.5 8.62 0 2.62 1.3 4.96 3.36 6.55-.1 1.2-.5 2.46-1.18 3.58a.5.5 0 0 0 .58.73c1.84-.55 3.32-1.34 4.4-2.07.74.16 1.52.25 2.34.25 5.25 0 9.5-3.86 9.5-8.62S17.25 2.5 12 2.5z" />
    </svg>
  );
}

export function HeartIcon({ size = 20, filled = false, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20.5s-7.5-4.6-9.78-9.45C.9 7.65 2.3 4 5.9 3.2c2.1-.47 4.1.5 6.1 2.6 2-2.1 4-3.07 6.1-2.6 3.6.8 5 4.45 3.68 7.85C19.5 15.9 12 20.5 12 20.5z" />
    </svg>
  );
}

export function UserPersonIcon({ size = 20, filled = false, className = '' }) {
  return filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="8" r="4.25" />
      <path d="M3.5 21c0-4.42 3.8-7.5 8.5-7.5s8.5 3.08 8.5 7.5z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4.25" />
      <path d="M3.5 21c0-4.42 3.8-7.5 8.5-7.5s8.5 3.08 8.5 7.5z" />
    </svg>
  );
}

export function PlusSquareIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function GearIcon({ size = 20, filled = false, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13.5a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6.1 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V2.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8.6a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" fill="none" />
    </svg>
  );
}
