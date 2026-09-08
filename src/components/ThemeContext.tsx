import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark';
export type ThemeClassType = ThemeType;

interface ThemeContextType {
  theme: ThemeType;
  currentTheme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('bazar360_theme') as ThemeType;
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Default to light premium theme
  });

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('bazar360_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme: theme, isDark, setTheme, toggleTheme }}>
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
