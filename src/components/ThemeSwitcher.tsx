import React from 'react';
import { useTheme, ThemeClassType } from './ThemeContext';
import { Palette, Sun, Moon, Leaf, Flame } from 'lucide-react';

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'theme-luxury-light' as ThemeClassType,
      label: 'Luxury Light',
      icon: Sun,
      colorClass: 'bg-white border-slate-300 text-slate-800',
      dotClass: 'bg-[#F97316]',
    },
    {
      id: 'theme-cosmic-dark' as ThemeClassType,
      label: 'Cosmic Dark',
      icon: Moon,
      colorClass: 'bg-[#0F172A] border-slate-700 text-amber-400',
      dotClass: 'bg-[#F97316]',
    },
    {
      id: 'theme-emerald' as ThemeClassType,
      label: 'Teal Emerald',
      icon: Leaf,
      colorClass: 'bg-[#022C22] border-[#10B981]/40 text-[#10B981]',
      dotClass: 'bg-[#10B981]',
    },
    {
      id: 'theme-gold' as ThemeClassType,
      label: 'Royal Gold',
      icon: Flame,
      colorClass: 'bg-[#18181B] border-[#D4A373]/40 text-[#D4A373]',
      dotClass: 'bg-[#D4A373]',
    }
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-900/10 dark:bg-white/5 border border-slate-200/20 rounded-2xl shrink-0" id="bazar360-theme-switcher">
      <div className="flex items-center gap-1">
        {themeOptions.map((opt) => {
          const isSelected = currentTheme === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all relative cursor-pointer active:scale-95 ${opt.colorClass} ${
                isSelected 
                  ? 'ring-2 ring-amber-500 scale-105 shadow-md border-transparent z-10' 
                  : 'opacity-70 hover:opacity-100 border-transparent hover:scale-102'
              }`}
              title={opt.label}
              aria-label={`Switch to ${opt.label} theme`}
            >
              <Icon size={14} className="shrink-0" />
              {isSelected && (
                <span className={`absolute -bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${opt.dotClass}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
