import React from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabbedNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabbedNavigation({ tabs, activeTab, onTabChange, className = '' }: TabbedNavigationProps) {
  return (
    <div className={`flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[var(--color-border-main)] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
            activeTab === tab.id 
              ? 'text-[var(--color-text-main)]' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </div>
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-main)]"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
