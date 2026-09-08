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
    const accentColor = themeConfig.primaryColor || '#1E5B8C';
    root.style.setProperty('--dynamic-accent', accentColor);
    root.style.setProperty('--dynamic-accent-hover', accentColor);
    
    return () => {
      // Revert to global defaults on unmount
      root.style.removeProperty('--dynamic-accent');
      root.style.removeProperty('--dynamic-accent-hover');
    };
  }, [themeConfig]);

  const bgStyleClass = 
    themeConfig.bgStyle === 'light' ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-main)]' :
    'bg-[var(--color-bg-primary)] text-[var(--color-text-header)]';

  return (
    <div className={`min-h-screen ${bgStyleClass} transition-colors duration-300 pb-16`}>
      {children}
    </div>
  );
}
