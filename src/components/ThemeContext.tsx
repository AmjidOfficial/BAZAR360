import React, { createContext, useContext, useEffect, useState } from 'react';

/** Bazar360 uses one stable marketplace theme. Theme changes are versioned so the UI can be rolled back safely. */
export type ThemeClassType = 'theme-luxury-light';
type ThemeSelection = ThemeClassType | 'light' | 'dark';

export const BAZAR360_THEME_VERSION = '2026-07-restored';
export const BAZAR360_THEME_BACKUP_KEY = 'bazar360_theme_backup_version';

interface ThemeContextType {
  theme: 'light';
  currentTheme: ThemeClassType;
  themeVersion: string;
  setTheme: (theme: ThemeSelection) => void;
  toggleTheme: () => void;
  restoreStableTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme] = useState<ThemeClassType>('theme-luxury-light');
  const [themeVersion] = useState(BAZAR360_THEME_VERSION);

  const applyStableTheme = () => {
    const root = document.documentElement;
    root.classList.remove('theme-cosmic-dark', 'theme-luxury-light', 'theme-emerald', 'theme-gold', 'dark', 'light');
    root.classList.add('theme-luxury-light', 'light');
    localStorage.setItem('bazar360_theme', 'theme-luxury-light');
    localStorage.setItem('bazar360_theme_version', BAZAR360_THEME_VERSION);
  };

  const setTheme = (_selection: ThemeSelection) => applyStableTheme();
  const toggleTheme = () => applyStableTheme();
  const restoreStableTheme = () => applyStableTheme();

  useEffect(() => {
    const previousVersion = localStorage.getItem('bazar360_theme_version');
    if (previousVersion && previousVersion !== BAZAR360_THEME_VERSION) localStorage.setItem(BAZAR360_THEME_BACKUP_KEY, previousVersion);
    applyStableTheme();
  }, []);

  return <ThemeContext.Provider value={{ theme: 'light', currentTheme, themeVersion, setTheme, toggleTheme, restoreStableTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
