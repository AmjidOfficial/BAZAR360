import React from 'react';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({ 
  children, 
  className = '', 
  padding = 'md', 
  interactive = false,
  ...props 
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={`bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] shadow-[var(--shadow-bento)] overflow-hidden transition-all duration-300 ${interactive ? 'hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-accent-main)]' : ''} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

