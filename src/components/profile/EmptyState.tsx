import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-blue)] mb-4">
        <Icon className="w-8 h-8 opacity-80" />
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text-main)] font-display tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] font-sans max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider font-mono shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
