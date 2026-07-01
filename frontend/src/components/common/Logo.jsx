// Bondly logo mark: two interlocking rounded links forming an abstract "b" —
// representing a "bond" between two people/nodes. Unique geometric mark,
// not a stock icon or generic infinity/speech-bubble shape.
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Bondly logo"
    >
      <defs>
        <linearGradient id="bondly-grad-a" x1="4" y1="6" x2="30" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="bondly-grad-b" x1="14" y1="10" x2="38" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* Back link — lower-left ring, open on the upper-right to interlock */}
      <path
        d="M16.5 10C10.7 10 6 14.7 6 20.5C6 26.3 10.7 31 16.5 31C20.4 31 23.8 28.85 25.6 25.7"
        stroke="url(#bondly-grad-a)"
        strokeWidth="6.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Front link — upper-right ring, open on the lower-left to interlock */}
      <path
        d="M23.5 30C29.3 30 34 25.3 34 19.5C34 13.7 29.3 9 23.5 9C19.6 9 16.2 11.15 14.4 14.3"
        stroke="url(#bondly-grad-b)"
        strokeWidth="6.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
