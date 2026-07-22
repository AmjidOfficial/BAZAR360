import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
  showTagline?: boolean;
  themeMode?: 'light' | 'dark';
  sector?: 'default' | 'auto-choice';
}

export function Bazar360Logo({ 
  className = '', 
  showIcon = true,
  showText = true, 
  showTagline = true,
  themeMode,
  sector = 'default'
}: LogoProps) {
  const { theme } = useTheme();
  const activeMode = themeMode || (theme === 'light' ? 'light' : 'dark');
  const isLight = activeMode === 'light';

  // If sector is auto-choice, render the Auto Choice logo
  if (sector === 'auto-choice') {
    return <AutoChoiceLogo className={className} showText={showText} themeMode={activeMode} />;
  }

  // Styling properties matching the uploaded pictures
  // Light Mode (Image 2): BAZAR360 in dark navy, .online in orange/copper, tagline in dark navy
  // Dark Mode (Image 1): BAZAR360 in white, . in orange/copper, online in white, tagline in white
  const logoTextColor = isLight ? 'text-[#0F172A]' : 'text-[#FFFFFF]';
  const dotColor = 'text-[#FF6B00]';
  const onlineTextColor = isLight ? 'text-[#FF6B00]' : 'text-[#FFFFFF]';
  const everythingColor = isLight ? 'text-[#0F172A]' : 'text-[#FFFFFF]';

  // Both modes use the same premium full-color loops (blue on the left, orange/copper on the right) as uploaded
  const leftLoopStroke = 'url(#leftBlueLoop)';
  const rightLoopStroke = 'url(#rightOrangeLoop)';
  const intersectionStroke = 'url(#intersectionGlow)';
  const arrowheadFill = '#FF6B00';
  const arrowheadStroke = '#FFB300';

  return (
    <div className={`flex items-center gap-3 ${className}`} id="bazar360-logo">
      {/* 1. Logo Asset Image (Using the official uploaded bazar360_icon.jpg for perfect branding fidelity) */}
      {showIcon && (
        <div className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center">
          <img 
            src="/bazar360_icon.jpg?v=2026_cache" 
            alt="Bazar360 Official Icon" 
            className="w-10 h-10 rounded-xl object-cover border border-[#FF6B00]/30 shadow-lg" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 2. Brand Typography Block */}
      {showText && (
        <div className="flex flex-col text-left font-sans select-none leading-none">
          {/* Main Title Row: BAZAR360.online */}
          <div className="flex items-baseline leading-none">
            <span className={`text-[21px] font-black tracking-tight ${logoTextColor} uppercase`}>
              BAZAR360
            </span>
            <span className={`text-[15px] font-black ${dotColor} leading-none mx-0.5`}>.</span>
            <span className={`text-[15px] font-black ${onlineTextColor} lowercase leading-none`}>online</span>
          </div>

          {showTagline && (
            <div className="flex flex-col mt-1">
              {/* Dynamic Promise Row: AUTO CHOICE | THE RIGHT CHOICE */}
              <div className="flex items-center gap-1 text-[7px] font-black tracking-[0.22em] uppercase leading-none py-0.5 font-sans">
                <span className={`text-[7px] ${everythingColor} font-black`}>
                  AUTO CHOICE | THE RIGHT CHOICE
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AutoChoiceLogo({ 
  className = '', 
  showText = true, 
  themeMode 
}: { 
  className?: string; 
  showText?: boolean; 
  themeMode?: 'light' | 'dark' 
}) {
  const { theme } = useTheme();
  const activeMode = themeMode || (theme === 'light' ? 'light' : 'dark');
  const isLight = activeMode === 'light';
  const headingColor = isLight ? 'text-[#161D6F]' : 'text-white';
  const subtitleColor = isLight ? 'text-[#475569]' : 'text-slate-400';

  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`} id="auto-choice-logo">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#38bdf8] bg-[#0F172A] p-0.5 shadow-2xl mb-3 flex items-center justify-center">
        <img 
          src="/auto_choice_logo_1781509565476.png?v=2026_cache" 
          alt="Auto Choice Showroom Logo" 
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <div className="space-y-1">
          <h2 className={`font-sans font-black text-xl md:text-2xl tracking-widest uppercase ${headingColor}`}>
            AUTO CHOICE
          </h2>
          <p className={`text-xs font-semibold tracking-wide ${subtitleColor}`}>
            The Right Choice
          </p>
        </div>
      )}
    </div>
  );
}
