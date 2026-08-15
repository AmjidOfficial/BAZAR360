import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface CRMRequestStatusProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CRMRequestStatus({ status, size = 'md' }: CRMRequestStatusProps) {
  const normalized = status ? status.toLowerCase() : 'new';

  let config = {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: Clock,
    label: status || 'New'
  };

  if (normalized.includes('progress') || normalized.includes('confirmed') || normalized.includes('contacted')) {
    config = {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: RefreshCw,
      label: status || 'In-Progress'
    };
  } else if (normalized.includes('complet') || normalized.includes('convert') || normalized.includes('approved')) {
    config = {
      bg: 'bg-[var(--color-accent-main)]/10',
      border: 'border-[var(--color-accent-main)]/30',
      text: 'text-[var(--color-accent-main)]',
      icon: CheckCircle2,
      label: status || 'Completed'
    };
  } else if (normalized.includes('cancel') || normalized.includes('closed') || normalized.includes('lost') || normalized.includes('reject')) {
    config = {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: XCircle,
      label: status || 'Closed'
    };
  } else if (normalized.includes('urgent') || normalized.includes('pending')) {
    config = {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: AlertCircle,
      label: status || 'Pending'
    };
  }

  const IconComponent = config.icon;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-wider border ${config.bg} ${config.border} ${config.text} ${paddingClass}`}>
      <IconComponent size={size === 'sm' ? 10 : 13} className={normalized.includes('progress') ? 'animate-spin' : ''} />
      <span>{config.label}</span>
    </span>
  );
}
