import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun size={20} className="text-[var(--color-text-main)]" />
      ) : (
        <Moon size={20} className="text-[var(--color-text-main)]" />
      )}
    </button>
  );
}
