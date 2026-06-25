import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: 'dark';
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: ThemeType = 'dark';
  const resolvedTheme = 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    
    // Maintain single premium style class overrides
    root.classList.remove('theme-luxury-light', 'theme-obsidian-gold', 'theme-mint-emerald');
    root.classList.add('theme-cosmic-dark');
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    // No-op to lock dark theme
  };

  const toggleTheme = () => {
    // No-op to lock dark theme
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

