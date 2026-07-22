import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full border border-[var(--color-border-main)] bg-[var(--color-bg-secondary)] text-[var(--color-text-header)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shadow-bento flex items-center justify-center cursor-pointer relative overflow-hidden group"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      id="theme-switcher-btn"
    >
      <span className="sr-only">Toggle Theme</span>
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun size={16} className="text-amber-400 shrink-0 transform group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={16} className="text-slate-800 shrink-0 transform group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
}
