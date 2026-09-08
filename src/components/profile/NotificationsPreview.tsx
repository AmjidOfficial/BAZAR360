import React, { useState, useEffect } from 'react';
import { 
  UserProfile, dbFetchNotifications, dbMarkNotificationRead, dbMarkAllNotificationsRead 
} from '../../lib/dbService';
import { UserNotification } from '../../types';
import { EmptyState } from './EmptyState';
import { Bell, CheckCheck, Loader2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsPreviewProps {
  user: UserProfile;
}

export const NotificationsPreview: React.FC<NotificationsPreviewProps> = ({
  user
}) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbFetchNotifications(user.uid)
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }, [user.uid]);

  const handleMarkRead = async (notifId: string) => {
    try {
      await dbMarkNotificationRead(notifId, user.uid);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await dbMarkAllNotificationsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center text-sky-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <span className="text-xs font-mono font-bold">Loading your notifications...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="You're all caught up"
        description="Important alerts regarding listing status approvals, price drops, and account security will appear here."
      />
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div>
          <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-400" />
            Notifications ({notifications.length})
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-main)] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-sky-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => !notif.read && handleMarkRead(notif.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 shadow-sm ${
              notif.read
                ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] opacity-80'
                : 'bg-sky-500/10 border-sky-500/30 text-[var(--color-text-main)]'
            }`}
          >
            <div className="p-2 rounded-xl bg-[var(--color-bg-primary)] text-sky-400 border border-[var(--color-border)] shrink-0 mt-0.5">
              {notif.type === 'system' || (notif.type as string) === 'security' ? <ShieldCheck className="w-4 h-4 text-[var(--color-accent-main)]" /> : <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs font-display text-[var(--color-text-main)]">
                  {notif.title}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] font-mono shrink-0">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] font-sans leading-relaxed">
                {notif.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
