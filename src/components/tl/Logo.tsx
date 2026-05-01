export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 32 32" className="text-primary">
        <defs>
          <linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="100%" stopColor="var(--glow)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="url(#lg-logo)" strokeWidth="1.5" />
        <path d="M8 11h16M16 11v13" stroke="url(#lg-logo)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="11" r="2" fill="var(--glow)" />
      </svg>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        Tensor<span className="text-glow">Labs</span>
      </span>
    </div>
  );
}
