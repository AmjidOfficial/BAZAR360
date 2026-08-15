import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../lib/dbService';
import { UserActivityLog, dbFetchUserActivityLogs } from '../../lib/userProfileService';
import { EmptyState } from './EmptyState';
import { History, Shield, Car, Heart, Settings, Key, Clock, Loader2 } from 'lucide-react';

interface ActivityTimelineProps {
  user: UserProfile;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  user
}) => {
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbFetchUserActivityLogs(user.uid)
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, [user.uid]);

  const getActionIcon = (action: string) => {
    if (action.includes('VEHICLE')) return Car;
    if (action.includes('FAVORITE')) return Heart;
    if (action.includes('SECURITY') || action.includes('LOGIN')) return Shield;
    if (action.includes('PROFILE') || action.includes('SETTINGS')) return Settings;
    return Clock;
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center text-sky-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <span className="text-xs font-mono font-bold">Loading activity history...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No recent activity recorded yet"
        description="Actions taken on your account (logins, vehicle postings, profile edits) will be logged here for audit and security tracking."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <History className="w-4 h-4 text-sky-400" />
          Real-time Activity Log ({logs.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Audit history of security events, profile updates, and vehicle actions.
        </p>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[var(--color-border)]">
        {logs.map((log) => {
          const Icon = getActionIcon(log.action);
          return (
            <div
              key={log.id}
              className="relative flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0 z-10">
                <Icon className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs font-mono uppercase tracking-wider text-sky-400">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-main)] font-sans leading-relaxed">
                  {log.description}
                </p>
                {log.device && (
                  <div className="text-[10px] text-[var(--color-text-muted)] font-mono truncate pt-0.5">
                    Device: {log.device}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
