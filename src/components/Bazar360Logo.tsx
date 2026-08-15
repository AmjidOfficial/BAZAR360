import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface Bazar360LogoProps {
  variant?: 'full' | 'header' | 'icon' | 'badge' | 'footer';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export default function Bazar360Logo({
  variant = 'header',
  theme = 'dark',
  className = '',
  showTagline = true,
  size = 'md',
  onClick,
}: Bazar360LogoProps) {
  const [imageError, setImageError] = useState(false);

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
      iconSize: 'w-9 h-9 sm:w-10 sm:h-10',
      textSize: 'text-base sm:text-lg',
      taglineSize: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      height: 'h-14 sm:h-16',
      iconSize: 'w-12 h-12 sm:w-14 sm:h-14',
      textSize: 'text-xl sm:text-2xl',
      taglineSize: 'text-[10px] sm:text-[11px]',
    },
    xl: {
      height: 'h-20 sm:h-24',
      iconSize: 'w-16 h-16 sm:w-20 sm:h-20',
      textSize: 'text-2xl sm:text-4xl',
      taglineSize: 'text-[11px] sm:text-[12px]',
    },
  }[size];

  // Colors based on theme
  const isDark = theme === 'dark' || theme === 'auto';
  const textColor = isDark ? 'text-white' : 'text-[#0F172A]';
  const taglineColor = isDark ? 'text-slate-300' : 'text-slate-600';

  // 1. Icon Only Variant (Emblem 3D Infinity Loop)
  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden p-1 bg-[#0F172A] border border-white/15 shadow-lg group cursor-pointer transition-transform active:scale-95 ${sizeClasses.iconSize} ${className}`}
        title="Bazar360.online Official Mark"
      >
        {!imageError ? (
          <img
            src="/bazar360_icon.jpg"
            alt="Bazar360 Logo Mark"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#0284C7] via-[#0F172A] to-[#F97316] rounded-xl flex items-center justify-center font-black text-white text-xs font-mono">
            360
          </div>
        )}
      </div>
    );
  }

  // 2. Badge Variant (Compact Pill for Cards/Badges)
  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0F172A]/90 border border-[#F97316]/40 backdrop-blur-md shadow-lg ${className}`}
      >
        <img
          src="/bazar360_icon.jpg"
          alt="Bazar360 Mark"
          className="w-5 h-5 rounded-lg object-contain"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center gap-1 font-extrabold text-xs text-white">
          <span>BAZAR360</span>
          <span className="text-[#F97316] font-mono">.online</span>
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
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-[#0F172A] border border-white/15 shadow-md p-0.5 group-hover:border-[#F97316]/60 transition-colors">
          <img
            src="/bazar360_icon.jpg"
            alt="Bazar360.online"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-black tracking-tight leading-none text-base sm:text-lg">
            <span className={textColor}>BAZAR360</span>
            <span className="text-[#F97316] font-mono font-bold text-xs sm:text-sm bg-[#F97316]/10 border border-[#F97316]/30 px-1.5 py-0.2 rounded-md">
              .online
            </span>
          </div>

          {showTagline && (
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#F97316] uppercase mt-0.5 flex items-center gap-1">
              <span>CONNECT</span>
              <span className="text-slate-400">•</span>
              <span>BUY</span>
              <span className="text-slate-400">•</span>
              <span>SELL</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Full / Footer Master Logo Variant
  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-start gap-2.5 select-none ${className}`}
    >
      {/* Official Image Banner if available */}
      {!imageError ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#0F172A] shadow-xl p-2 group max-w-sm">
          <img
            src="/bazar360_official_logo.jpg"
            alt="Bazar360.online Official Logo - Connect | Buy | Sell - Everything You Need"
            onError={() => setImageError(true)}
            className="w-full h-auto object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Vector SVG Fallback with Exact Official Colors */
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-white/15 p-1 shadow-lg">
              <img
                src="/bazar360_icon.jpg"
                alt="Bazar360 Icon"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>BAZAR360</span>
                <span className="text-[#F97316] font-mono font-extrabold text-lg sm:text-xl">
                  .online
                </span>
              </div>
              <p className="text-xs font-bold text-[#F97316] tracking-widest uppercase">
                Connect | Buy | Sell
              </p>
            </div>
          </div>

          {showTagline && (
            <p className="text-xs font-mono font-bold text-slate-300 tracking-widest uppercase pt-1">
              EVERYTHING YOU NEED
            </p>
          )}
        </div>
      )}
    </div>
  );
}
