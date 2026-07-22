import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent) => void;
  /** Radius of the card, defaults to '24px' (rounded-[24px]) */
  radius?: '24px' | '20px' | '16px' | 'default';
  /** Forces light or dark glass style. If not specified, adapts to global light/dark class */
  theme?: 'light' | 'dark' | 'auto';
  /** Toggle smooth hover interactions (scaling, reflection shifts) */
  hoverable?: boolean;
  /** Apply GPU acceleration flags: will-change: backdrop-filter, transform */
  gpuAccelerated?: boolean;
}

export function GlassCard({
  children,
  className = '',
  id,
  onClick,
  radius = '24px',
  theme = 'auto',
  hoverable = false,
  gpuAccelerated = true,
}: GlassCardProps) {
  // Map radius settings to Tailwind utility classes
  const radiusClass = {
    '24px': 'rounded-[24px]',
    '20px': 'rounded-[20px]',
    '16px': 'rounded-2xl',
    'default': 'rounded-xl',
  }[radius];

  // Map theme overrides, or fallback to CSS class-dependent styles
  const themeStyles = {
    light: 'bg-white/90 border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] text-slate-900',
    dark: 'bg-slate-950/30 border-white/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] text-white',
    auto: 'bg-white/90 dark:bg-slate-950/30 border-slate-200/80 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] text-slate-900 dark:text-white',
  }[theme];

  // Glass performance attributes
  const performanceClass = gpuAccelerated ? 'will-change-[backdrop-filter,transform] transform-gpu' : '';

  // Hover animations & reflection sweep effect
  const hoverClass = hoverable
    ? 'hover:scale-[1.03] hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out cursor-pointer group'
    : 'transition-all duration-300';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative 
        backdrop-blur-[20px] 
        -webkit-backdrop-blur-[20px] 
        border 
        overflow-hidden
        ${radiusClass} 
        ${themeStyles} 
        ${performanceClass} 
        ${hoverClass} 
        ${className}
      `}
    >
      {/* Interactive hover glass reflection sheet sweep */}
      {hoverable && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden z-10">
          <div className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:translate-x-[300%] transition-transform duration-[1200ms] ease-out" />
        </div>
      )}
      {children}
    </div>
  );
}
