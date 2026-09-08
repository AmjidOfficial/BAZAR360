import React from 'react';
import { motion } from 'motion/react';

export interface Bazar360LogoProps {
  variant?: 'full' | 'header' | 'icon' | 'badge' | 'footer';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

// 1. High-fidelity Vector SVG representing the brand new metallic 3D infinity loop logo
export function Bazar360InfinityIcon({ 
  className = "w-8 h-8", 
  lightMode = false 
}: { 
  className?: string; 
  lightMode?: boolean 
}) {
  return (
    <svg 
      viewBox="0 0 100 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {/* Steel Blue Metallic Gradient */}
        <linearGradient id="metallicBlue" x1="15" y1="13" x2="55" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E5B8C" />
          <stop offset="50%" stopColor="#2E79B5" />
          <stop offset="100%" stopColor="#0B1C2E" />
        </linearGradient>
        {/* Rose Gold / Bronze Metallic Gradient */}
        <linearGradient id="metallicRose" x1="55" y1="13" x2="75" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E4B192" />
          <stop offset="50%" stopColor="#C58B65" />
          <stop offset="100%" stopColor="#6C4124" />
        </linearGradient>
        {/* Soft Drop Shadow for Depth */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity={lightMode ? "0.15" : "0.45"} />
        </filter>
      </defs>
      <g filter="url(#logoGlow)">
        {/* Infinite ribbon loop representing 3, 6, 0 */}
        {/* Left Loop: Steel Blue (representing '3') */}
        <path 
          d="M35 25 C35 14, 15 14, 15 25 C15 36, 35 36, 35 25" 
          stroke="url(#metallicBlue)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Middle Connection (representing '6') */}
        <path 
          d="M35 25 C35 14, 55 14, 55 25 C55 36, 35 36, 35 25" 
          stroke="url(#metallicBlue)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Right Loop: Rose Gold (representing '0' / infinity ribbon) */}
        <path 
          d="M55 25 C55 14, 75 14, 75 25 C75 36, 55 36, 55 25" 
          stroke="url(#metallicRose)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Overlapping weaving accents for 3D realism */}
        <path 
          d="M35 25 C35 19, 41 15, 47 15" 
          stroke="url(#metallicBlue)" 
          strokeWidth="7" 
          strokeLinecap="round" 
        />
        <path 
          d="M55 25 C55 19, 61 15, 67 15" 
          stroke="url(#metallicRose)" 
          strokeWidth="7" 
          strokeLinecap="round" 
        />
        {/* Soft highlights */}
        <circle cx="35" cy="25" r="1.2" fill="#FFFFFF" opacity="0.7" />
        <circle cx="55" cy="25" r="1.2" fill="#FFFFFF" opacity="0.7" />
      </g>
    </svg>
  );
}

export default function Bazar360Logo({
  variant = 'header',
  theme = 'dark',
  className = '',
  showTagline = true,
  size = 'md',
  onClick,
}: Bazar360LogoProps) {
  // Size mappings
  const sizeClasses = {
    sm: {
      height: 'h-8',
      iconSize: 'w-7 h-7',
      textSize: 'text-sm sm:text-base',
      taglineSize: 'text-[8px]',
    },
    md: {
      height: 'h-10 sm:h-12',
      iconSize: 'w-10 h-10',
      textSize: 'text-base sm:text-lg',
      taglineSize: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      height: 'h-14 sm:h-16',
      iconSize: 'w-14 h-14',
      textSize: 'text-xl sm:text-2xl',
      taglineSize: 'text-[10px] sm:text-[11px]',
    },
    xl: {
      height: 'h-20 sm:h-24',
      iconSize: 'w-20 h-20',
      textSize: 'text-2xl sm:text-4xl',
      taglineSize: 'text-[11px] sm:text-[12px]',
    },
  }[size];

  const isDark = theme === 'dark' || theme === 'auto';
  const textColor = isDark ? 'text-white' : 'text-[#0B132B]';

  // 1. Icon Only Variant (Emblem 3D Infinity Loop)
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden p-1 bg-[var(--color-bg-secondary)] border border-white/10 shadow-lg group cursor-pointer transition-transform active:scale-95 ${sizeClasses.iconSize} ${className}`}
        title="Bazar360.online Official Mark"
      >
        <Bazar360InfinityIcon className="w-full h-full transform group-hover:scale-105 transition-transform duration-300" lightMode={!isDark} />
      </div>
    );
  }

  // 2. Badge Variant (Compact Pill for Cards/Badges)
  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/90 border border-[var(--color-accent-secondary)]/30 backdrop-blur-md shadow-lg cursor-pointer ${className}`}
      >
        <Bazar360InfinityIcon className="w-5 h-5" lightMode={!isDark} />
        <div className="flex items-center gap-1 font-extrabold text-xs text-white">
          <span>BAZAR360</span>
          <span className="text-[var(--color-accent-secondary)] font-mono font-bold">.online</span>
        </div>
      </div>
    );
  }

  // 3. Header / Navbar Variant (Optimized for sticky app bar)
  if (variant === 'header') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 cursor-pointer group select-none ${className}`}
      >
        {/* Emblem */}
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] border border-white/10 shadow-md p-1 group-hover:border-[var(--color-accent-main)]/50 transition-colors">
          <Bazar360InfinityIcon className="w-full h-full transform group-hover:scale-105 transition-transform duration-300" lightMode={!isDark} />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-black tracking-tight leading-none text-base sm:text-lg">
            <span className={textColor}>BAZAR360</span>
            <span className="text-[var(--color-accent-secondary)] font-mono font-bold text-xs sm:text-sm bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/20 px-1.5 py-0.2 rounded-md">
              .online
            </span>
          </div>

          {showTagline && (
            <span className="text-[9px] font-mono font-bold tracking-widest text-[var(--color-accent-secondary)] uppercase mt-0.5 flex items-center gap-1">
              <span>CONNECT</span>
              <span className="text-slate-400 opacity-60">•</span>
              <span>BUY</span>
              <span className="text-slate-400 opacity-60">•</span>
              <span>SELL</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Full / Footer / Splash Master Logo Variant
  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-start gap-2 select-none ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-secondary)] border border-white/10 p-1.5 shadow-lg">
            <Bazar360InfinityIcon className="w-full h-full" lightMode={!isDark} />
          </div>

          <div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textColor} flex items-center gap-1.5`}>
              <span>BAZAR360</span>
              <span className="text-[var(--color-accent-secondary)] font-mono font-extrabold text-lg sm:text-xl">
                .online
              </span>
            </div>
            <p className="text-xs font-bold text-[var(--color-accent-secondary)] tracking-widest uppercase">
              Connect | Buy | Sell
            </p>
          </div>
        </div>

        {showTagline && (
          <p className="text-xs font-mono font-semibold text-slate-400 tracking-widest uppercase pt-2">
            EVERYTHING YOU NEED
          </p>
        )}
      </div>
    </div>
  );
}
