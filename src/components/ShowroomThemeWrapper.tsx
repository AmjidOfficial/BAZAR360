import React, { useEffect } from 'react';

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  bgStyle?: 'dark' | 'light' | 'emerald' | 'gold';
}

interface ShowroomThemeWrapperProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

export function ShowroomThemeWrapper({ themeConfig, children }: ShowroomThemeWrapperProps) {
  useEffect(() => {
    const root = document.documentElement;
    // Set dynamic custom properties for components inside the wrapper to consume
    const accentColor = themeConfig.primaryColor || '#38BDF8';
    root.style.setProperty('--dynamic-accent', accentColor);
    root.style.setProperty('--dynamic-accent-hover', accentColor);
    
    return () => {
      // Revert to global defaults on unmount
      root.style.removeProperty('--dynamic-accent');
      root.style.removeProperty('--dynamic-accent-hover');
    };
  }, [themeConfig]);

  const bgStyleClass = 
    themeConfig.bgStyle === 'light' ? 'bg-slate-50 text-slate-900' :
    themeConfig.bgStyle === 'emerald' ? 'bg-[#03140f] text-emerald-100' :
    themeConfig.bgStyle === 'gold' ? 'bg-[#050505] text-zinc-100' :
    'bg-[#030712] text-white'; // default to Space Cyber Dark background

  return (
    <div className={`min-h-screen ${bgStyleClass} transition-colors duration-300 pb-16`}>
      {children}
    </div>
  );
}
