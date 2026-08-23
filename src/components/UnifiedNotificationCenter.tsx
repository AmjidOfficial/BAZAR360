import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  MessageSquare,
  Users,
  Wrench,
  Calendar,
  CreditCard,
  Star,
  Info,
  CheckCircle,
  Clock,
  ExternalLink,
  CheckCheck,
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { UserNotification, UserProfile } from '../types';
import {
  dbFetchNotifications,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead
} from '../lib/dbService';
import { toast } from 'react-hot-toast';

interface UnifiedNotificationCenterProps {
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
  onNavigateToTab?: (tab: string, meta?: any) => void;
  onOpenMessaging?: (conversationId?: string) => void;
}

export default function UnifiedNotificationCenter({
  currentUser,
  lang,
  onNavigateToTab,
  onOpenMessaging
}: UnifiedNotificationCenterProps) {
  const isUrdu = lang === 'ur';
  const effectiveUid = currentUser?.uid || currentUser?.phoneNumber || 'guest-user';

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'messages' | 'leads' | 'services' | 'appointments' | 'payments' | 'reviews' | 'system'
  >('all');
  const [loading, setLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    async function loadNotifs() {
      setLoading(true);
      try {
        const notifs = await dbFetchNotifications(effectiveUid);
        setNotifications(notifs);
      } catch (err) {
        console.error('[NotificationCenter] Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifs();
    const interval = setInterval(loadNotifs, 8000);
    return () => clearInterval(interval);
  }, [effectiveUid]);

  const handleMarkRead = async (notifId: string) => {
    try {
      await dbMarkNotificationRead(notifId, effectiveUid);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('[NotificationCenter] Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dbMarkAllNotificationsRead(effectiveUid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success(isUrdu ? 'تمام الرٹس پڑھے گئے' : 'All notifications marked as read');
    } catch (err) {
      console.error('[NotificationCenter] Mark all read error:', err);
    }
  };

  const handleNotificationClick = async (notif: UserNotification) => {
    if (!notif.read) {
      await handleMarkRead(notif.id);
    }

    if (notif.link?.startsWith('conversation:')) {
      const convId = notif.link.split(':')[1];
      if (onOpenMessaging) onOpenMessaging(convId);
    } else if (notif.link === 'dashboard' || notif.type === 'leads') {
      if (onNavigateToTab) onNavigateToTab('admin-crm');
    } else if (notif.type === 'services' || notif.type === 'appointments') {
      if (onNavigateToTab) onNavigateToTab('my-services');
    } else if (notif.type === 'reviews') {
      if (onNavigateToTab) onNavigateToTab('showrooms');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.type === activeCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const categoryIcons = {
    all: Bell,
    messages: MessageSquare,
    leads: Users,
    services: Wrench,
    appointments: Calendar,
    payments: CreditCard,
    reviews: Star,
    system: Info
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-red-600 p-0.5 shadow-lg shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-bg-primary rounded-[14px] flex items-center justify-center">
              <Bell className="w-6 h-6 text-[var(--color-text-header)] animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tight flex items-center gap-2">
              {isUrdu ? 'سینٹرل الرٹس اینڈ نوٹیفکیشنز' : 'Notification & Alerts Hub'}
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-[var(--color-text-header)]">
                  {unreadCount} {isUrdu ? 'نئے' : 'New'}
                </span>
              )}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Real-time transactional updates for Messages, Service Bookings, Leads, and System Logs
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] text-xs font-bold text-[var(--color-text-main)] transition-all flex items-center gap-2 self-start md:self-auto shrink-0 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[var(--color-accent-main)]" />
            {isUrdu ? 'تمام پڑھ لیے گئے نشان زد کریں' : 'Mark All Read'}
          </button>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs font-mono">
        {(['all', 'messages', 'leads', 'services', 'appointments', 'reviews', 'system'] as const).map((cat) => {
          const IconComponent = categoryIcons[cat];
          const count = notifications.filter(n => cat === 'all' ? !n.read : n.type === cat && !n.read).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl capitalize font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] border-transparent shadow-md'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border-main)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{cat}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeCategory === cat ? 'bg-white text-black font-black' : 'bg-red-600 text-[var(--color-text-header)]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications Cards Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)] font-mono animate-pulse">
            Synchronizing live alerts...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-[var(--color-text-muted)] mx-auto opacity-40" />
            <h4 className="text-sm font-bold text-[var(--color-text-main)]">
              {isUrdu ? 'کوئی نوٹیفکیشن موجود نہیں ہے' : 'No notifications found in this category'}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
              When you receive messages, service updates, lead assignments, or status alerts, they will appear right here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const IconComponent = categoryIcons[notif.type] || Bell;

            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative ${
                  notif.read
                    ? 'bg-[var(--color-bg-secondary)]/50 border-[var(--color-border-main)] opacity-85'
                    : 'bg-[var(--color-bg-secondary)] border-[var(--color-accent-main)] shadow-md ring-1 ring-[var(--color-accent-main)]/20'
                }`}
              >
                {/* Category Icon Badge */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  notif.read
                    ? 'bg-[var(--color-bg-primary)] border-[var(--color-border-main)] text-[var(--color-text-muted)]'
                    : 'bg-[var(--color-accent-main)]/10 border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)]'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-black text-[var(--color-text-main)] flex items-center gap-2 truncate">
                      {notif.title}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-main)] shrink-0 animate-ping" />
                      )}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {notif.body}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-accent-main)] flex items-center gap-1">
                      Click to inspect details <ChevronRight className="w-3 h-3" />
                    </span>

                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                        }}
                        className="text-[10px] font-mono font-bold text-[var(--color-accent-main)] hover:underline"
                      >
                        {isUrdu ? 'پڑھا نشان زد کریں' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
