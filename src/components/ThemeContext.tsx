import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Determine initial theme: localStorage preference or OS system preference
  const getInitialTheme = (): ThemeType => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bazar360_theme') as ThemeType;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'light';
  };

  const [theme, setThemeState] = useState<ThemeType>(getInitialTheme);

  const applyTheme = (newTheme: ThemeType) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
  };

  useEffect(() => {
    applyTheme(theme);

    // Listen to OS theme changes if user hasn't explicitly locked in localStorage
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleOSThemeChange = (e: MediaQueryListEvent) => {
      const hasManualOverride = localStorage.getItem('bazar360_theme');
      if (!hasManualOverride) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleOSThemeChange);
      return () => mediaQuery.removeEventListener('change', handleOSThemeChange);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('bazar360_theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme, toggleTheme }}>
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

