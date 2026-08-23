import React, { createContext, useContext, useEffect, useState } from 'react';

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
