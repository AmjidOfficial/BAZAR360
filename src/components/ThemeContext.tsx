import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeClassType = 'theme-cosmic-dark' | 'theme-luxury-light' | 'theme-emerald' | 'theme-gold';
/** Bazar360 production uses one consistent visual design system. */
export type ThemeClassType = 'theme-luxury-light';
type ThemeSelection = ThemeClassType | 'light' | 'dark';

interface ThemeContextType {
  theme: 'light';
  currentTheme: ThemeClassType;
  setTheme: (theme: ThemeSelection) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeClassType>(() => {
    const saved = localStorage.getItem('bazar360_theme');
    if (saved === 'light') return 'theme-luxury-light';
    if (saved === 'dark') return 'theme-cosmic-dark';
    return (saved as ThemeClassType) || 'theme-luxury-light';
  });

  const setTheme = (selection: ThemeSelection) => {
    if (selection === 'light') {
      setCurrentThemeState('theme-luxury-light');
    } else if (selection === 'dark') {
      setCurrentThemeState('theme-cosmic-dark');
    } else {
      setCurrentThemeState(selection);
    }
  const [currentTheme] = useState<ThemeClassType>('theme-luxury-light');

  const setTheme = (_selection: ThemeSelection) => {
    // Production deliberately uses one theme. Ignore legacy theme-switch requests.
  };

  const toggleTheme = () => {
    // Deliberately disabled so every page uses the same design system.
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cosmic-dark', 'theme-luxury-light', 'theme-emerald', 'theme-gold', 'dark', 'light');
    root.classList.add(currentTheme);
    if (currentTheme === 'theme-cosmic-dark' || currentTheme === 'theme-gold') root.classList.add('dark');
    else root.classList.add('light');
    localStorage.setItem('bazar360_theme', currentTheme);
  }, [currentTheme]);

  const isDark = currentTheme === 'theme-cosmic-dark' || currentTheme === 'theme-gold';
    root.classList.add('theme-luxury-light', 'light');
    localStorage.setItem('bazar360_theme', 'theme-luxury-light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', currentTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
