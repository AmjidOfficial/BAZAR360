import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { dbFetchServiceBookings } from '../../lib/dbService';
import { toast } from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'message' | 'alert';
}

export function CentralNotificationService() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previousCount, setPreviousCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkUpdates() {
      try {
        const bookings = await dbFetchServiceBookings();
        if (!isMounted) return;

        // Generate dynamic alerts based on status, chat activity, and reviews
        const items: NotificationItem[] = [];

        bookings.forEach((b: any) => {
          // 1. Core booking request
          items.push({
            id: `booking-${b.id}`,
            title: `Job ${b.id.slice(0, 5)}: ${b.status}`,
            message: `${b.userName} - ${b.serviceTitle} is currently ${b.status}`,
            timestamp: b.updatedAt || b.createdAt || new Date().toISOString(),
            read: false,
            type: 'booking'
          });

          // 2. Chat activity alert
          if (b.chatMessages && b.chatMessages.length > 0) {
            const lastMsg = b.chatMessages[b.chatMessages.length - 1];
            if (lastMsg.sender !== 'admin') {
              items.push({
                id: `chat-${b.id}-${lastMsg.id}`,
                title: `Chat Alert from ${b.userName}`,
                message: `"${lastMsg.message}"`,
                timestamp: lastMsg.timestamp,
                read: false,
                type: 'message'
              });
            }
          }

          // 3. Review sub-notification
          if (b.review) {
            items.push({
              id: `review-${b.id}`,
              title: `Customer Review ⭐ ${b.review.rating}/5`,
              message: `${b.userName}: "${b.review.comment}"`,
              timestamp: b.review.date,
              read: false,
              type: 'alert'
            });
          }
        });

        // Sort items by descending timestamp so newest are at the top
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const activeNotifications = items.slice(0, 15);

        // Toast trigger for any new notifications
        if (previousCount !== null && activeNotifications.length > previousCount) {
          const latest = activeNotifications[0];
          const icon = latest.type === 'message' ? '💬' : latest.type === 'alert' ? '⭐' : '🔔';
          toast.success(`${latest.title}: ${latest.message}`, {
            icon,
            duration: 4000
          });
        }

        setPreviousCount(activeNotifications.length);
        setNotifications(activeNotifications);
        setUnreadCount(activeNotifications.filter(i => !i.read).length);
      } catch (err) {
        console.warn('CentralNotificationService poll error:', err);
      }
    }

    checkUpdates();
    const interval = setInterval(checkUpdates, 15000); // Poll every 15s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [previousCount]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-bg-secondary border border-border-main hover:border-orange-500 text-text-muted hover:text-[var(--color-text-header)] transition-all cursor-pointer"
        title="Central CRM Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-primary border border-border-main rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-left">
          <div className="p-4 bg-bg-secondary border-b border-border-main flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-orange-500" size={16} />
              <span className="text-xs font-black font-display uppercase tracking-wider text-[var(--color-text-header)]">
                CRM Notifications & Alerts
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-[var(--color-text-header)] cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-900">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-text-muted">
                No new CRM notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-bg-secondary/60 transition-all space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-orange-400">{n.title}</span>
                    <span className="text-text-muted">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-text-muted font-sans">{n.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-bg-secondary border-t border-border-main flex justify-between items-center">
            <span className="text-[10px] font-mono text-text-muted">Real-time listener active</span>
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-mono text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
            >
              Mark all read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
