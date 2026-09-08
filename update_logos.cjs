const fs = require('fs');
const code = `
import React from 'react';
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
  themeMode,
  sector = 'default'
}: LogoProps) {
  const { theme } = useTheme();
  const activeMode = themeMode || (theme === 'light' ? 'light' : 'dark');
  const isLight = activeMode === 'light';

  // If sector is auto-choice, render the Auto Choice logo
  if (sector === 'auto-choice') {
    return <AutoChoiceLogo className={className} themeMode={activeMode} />;
  }

  const logoSrc = isLight ? '/bazar360_logo_light.jpg' : '/bazar360_logo_dark.jpg';

  return (
    <div className={\`flex items-center justify-center select-none bg-transparent p-0 m-0 \${className}\`} id="bazar360-logo">
      <img 
        src={logoSrc} 
        alt="Bazar360.online Logo" 
        className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-sm rounded-lg"
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export function AutoChoiceLogo({ 
  className = '', 
  themeMode,
}: { 
  className?: string; 
  themeMode?: 'light' | 'dark';
  showText?: boolean;
}) {
  const { theme } = useTheme();
  const activeMode = themeMode || (theme === 'light' ? 'light' : 'dark');
  const isLight = activeMode === 'light';
  
  const logoSrc = isLight ? '/auto_choice_logo_light.jpg' : '/auto_choice_logo_dark.jpg';

  return (
    <div className={\`flex items-center justify-center select-none \${className}\`} id="auto-choice-logo">
      <img 
        src={logoSrc} 
        alt="Auto Choice Logo" 
        className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-sm rounded-lg"
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
`;

fs.writeFileSync('src/components/Bazar360Logo.tsx', code);
