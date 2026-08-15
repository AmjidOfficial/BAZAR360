import React, { useState, useEffect } from 'react';
import { UserProfile, dbFetchUserConversations } from '../../lib/dbService';
import { Conversation } from '../../types';
import { EmptyState } from './EmptyState';
import { MessageSquare, Car, ArrowRight, Loader2 } from 'lucide-react';

interface MessagesPreviewProps {
  user: UserProfile;
  onOpenConversation?: (convId: string) => void;
  onBrowseVehicles?: () => void;
}

export const MessagesPreview: React.FC<MessagesPreviewProps> = ({
  user,
  onOpenConversation,
  onBrowseVehicles
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dbFetchUserConversations(user.uid || user.phoneNumber || '')
      .then(setConversations)
      .finally(() => setIsLoading(false));
  }, [user.uid, user.phoneNumber]);

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center text-sky-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <span className="text-xs font-mono font-bold">Loading your active conversations...</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description="Your direct chats with vehicle buyers, private sellers, and showroom owners will appear here."
        actionLabel="Browse Vehicles"
        onAction={onBrowseVehicles}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          Messages & Inquiries ({conversations.length})
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
          Real direct message threads from verified marketplace leads.
        </p>
      </div>

      <div className="space-y-2.5">
        {conversations.map((conv) => {
          const unreadForMe = (conv.unreadCount && conv.unreadCount[user.uid]) || 0;
          return (
            <div
              key={conv.id}
              onClick={() => onOpenConversation && onOpenConversation(conv.id)}
              className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-mono font-black text-sm shrink-0 border border-sky-500/20">
                  {conv.relatedListingTitle || (conv as any).vehicleTitle ? <Car className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-display text-[var(--color-text-main)] truncate">
                      {conv.relatedListingTitle || (conv as any).vehicleTitle || 'Marketplace Conversation'}
                    </span>
                    {unreadForMe > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                        {unreadForMe} NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans truncate mt-0.5">
                    {conv.lastMessage || 'No messages exchanged yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)] group-hover:text-sky-400 shrink-0">
                <span>{conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
