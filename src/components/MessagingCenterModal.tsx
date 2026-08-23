import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  Paperclip,
  Check,
  CheckCheck,
  Car,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
  UserCheck,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  Conversation,
  DirectMessage,
  UserProfile
} from '../types';
import {
  dbFetchUserConversations,
  dbFetchConversationMessages,
  dbSendMessage,
  dbCreateOrGetConversation,
  dbMarkConversationRead
} from '../lib/dbService';
import { formatPkrPrice } from '../lib/currency';
import { toast } from 'react-hot-toast';

interface MessagingCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  lang: 'en' | 'ur';
  initialConversationId?: string;
  recipientUser?: {
    uid: string;
    name: string;
    avatar?: string;
    role?: string;
    phone?: string;
  };
  relatedListing?: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
  relatedService?: {
    id: string;
    title: string;
  };
  initialMessage?: string;
}

export default function MessagingCenterModal({
  isOpen,
  onClose,
  currentUser,
  lang,
  initialConversationId,
  recipientUser,
  relatedListing,
  relatedService,
  initialMessage
}: MessagingCenterModalProps) {
  const isUrdu = lang === 'ur';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [activeMessages, setActiveMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'listings' | 'services'>('all');
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const effectiveUid = currentUser?.uid || currentUser?.phoneNumber || 'guest-user';
  const effectiveName = currentUser?.displayName || 'Guest Customer';
  const effectiveAvatar = currentUser?.photoURL || '';

  // Initialize conversations & handle direct recipient target
  useEffect(() => {
    if (!isOpen) return;

    async function initMessaging() {
      setLoading(true);
      try {
        let targetConvId = initialConversationId;

        // If a target recipient is passed, create or get their conversation thread
        if (recipientUser && !targetConvId) {
          targetConvId = await dbCreateOrGetConversation({
            senderUid: effectiveUid,
            senderName: effectiveName,
            senderAvatar: effectiveAvatar,
            senderRole: currentUser?.role || 'Buyer',
            recipientUid: recipientUser.uid,
            recipientName: recipientUser.name,
            recipientAvatar: recipientUser.avatar,
            recipientRole: recipientUser.role || 'Seller',
            relatedListing: relatedListing,
            relatedServiceId: relatedService?.id,
            initialMessage: initialMessage
          });
        }

        const userConvs = await dbFetchUserConversations(effectiveUid);
        setConversations(userConvs);

        if (targetConvId) {
          setActiveConversationId(targetConvId);
        } else if (userConvs.length > 0 && !activeConversationId) {
          setActiveConversationId(userConvs[0].id);
        }
      } catch (err) {
        console.error('[MessagingCenter] Init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initMessaging();
  }, [isOpen, recipientUser?.uid, initialConversationId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId || !isOpen) return;

    let isMounted = true;
    async function loadMessages() {
      try {
        const msgs = await dbFetchConversationMessages(activeConversationId);
        if (isMounted) {
          setActiveMessages(msgs);
          dbMarkConversationRead(activeConversationId, effectiveUid);
        }
      } catch (err) {
        console.error('[MessagingCenter] Load messages error:', err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 4000); // Poll every 4s for real-time updates

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConversationId, isOpen]);

  // Auto-scroll to bottom of messages thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const activeConv = conversations.find(c => c.id === activeConversationId);

  // Derive target participant details
  const otherParticipantUid = activeConv?.participants?.find(p => p !== effectiveUid) || recipientUser?.uid;
  const otherParticipantDetail = activeConv?.participantDetails?.[otherParticipantUid || ''] || {
    name: recipientUser?.name || 'Showroom Representative',
    avatar: recipientUser?.avatar || '',
    role: recipientUser?.role || 'Dealer'
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachmentUrl) || !activeConversationId) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      await dbSendMessage({
        conversationId: activeConversationId,
        senderId: effectiveUid,
        senderName: effectiveName,
        senderAvatar: effectiveAvatar,
        recipientId: otherParticipantUid || 'dealer',
        message: textToSend,
        type: attachmentUrl ? 'image' : 'text',
        attachments: attachmentUrl ? [{ url: attachmentUrl, name: 'Attachment', type: 'image' }] : undefined,
        metadata: relatedListing ? {
          listingId: relatedListing.id,
          listingTitle: relatedListing.title,
          listingImage: relatedListing.image,
          listingPrice: relatedListing.price
        } : undefined
      });

      setAttachmentUrl(null);
      // Refresh messages
      const updatedMsgs = await dbFetchConversationMessages(activeConversationId);
      setActiveMessages(updatedMsgs);

      // Refresh list
      const updatedConvs = await dbFetchUserConversations(effectiveUid);
      setConversations(updatedConvs);
    } catch (err) {
      console.error('[MessagingCenter] Send message error:', err);
      toast.error(isUrdu ? 'پیغام بھیجنے میں ناکامی' : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const generateWhatsAppLink = () => {
    const phone = recipientUser?.phone || '923159085086';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const refCode = `B360-MSG-${activeConversationId?.substring(0, 8).toUpperCase() || 'REF'}`;
    const text = encodeURIComponent(
      `[BAZAR360 Verified Inquiry - Ref: ${refCode}]\nHello ${otherParticipantDetail.name}, I am messaging regarding ${
        relatedListing?.title || activeConv?.relatedListingTitle || 'your marketplace inventory/service'
      } on Bazar360.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(c => {
    const pDetail = Object.values(c.participantDetails || {}).map(p => p.name).join(' ').toLowerCase();
    const matchesSearch = pDetail.includes(searchQuery.toLowerCase()) || (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'listings') return matchesSearch && !!c.relatedListingId;
    if (filterTab === 'services') return matchesSearch && !!c.relatedServiceId;
    return matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-bg-primary/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-5xl h-[88vh] bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        >
          {/* Top Bar Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-[var(--color-border-main)] bg-[var(--color-bg-secondary)]/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-red-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-bg-primary rounded-[10px] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[var(--color-text-header)]" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--color-text-main)] uppercase tracking-tight flex items-center gap-2">
                  {isUrdu ? 'بازار360 لائیو میسجنگ' : 'BAZAR360 Live Messaging'}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20">
                    Encrypted Persistent
                  </span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                  Direct verified communication between Buyers, Showrooms, and Service Technicians
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Split View */}
          <div className="flex-1 flex overflow-hidden divide-x divide-[var(--color-border-main)]">
            {/* Sidebar Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-[var(--color-bg-secondary)]/40 shrink-0 ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
              {/* Search & Filter Header */}
              <div className="p-3.5 space-y-2.5 border-b border-[var(--color-border-main)]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isUrdu ? 'بات چیت تلاش کریں...' : 'Search conversations...'}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-main)]"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
                  {(['all', 'listings', 'services'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                        filterTab === tab
                          ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] font-bold'
                          : 'bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-main)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Cards List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {loading ? (
                  <div className="p-8 text-center text-xs text-[var(--color-text-muted)] animate-pulse">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)] mx-auto opacity-50" />
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {isUrdu ? 'کوئی بات چیت نہیں مل سکی' : 'No active conversations found'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    const otherUid = conv.participants?.find(p => p !== effectiveUid) || '';
                    const pDetail = conv.participantDetails?.[otherUid] || { name: 'Showroom Partner', avatar: '', role: 'Dealer' };
                    const unread = conv.unreadCount?.[effectiveUid] || 0;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left relative border ${
                          isActive
                            ? 'bg-[var(--color-bg-primary)] border-[var(--color-accent-main)] shadow-md'
                            : 'bg-transparent border-transparent hover:bg-[var(--color-bg-primary)]/60'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[var(--color-text-header)] font-bold text-sm flex items-center justify-center overflow-hidden border border-white/10 shadow-sm">
                            {pDetail.avatar ? (
                              <img src={pDetail.avatar} alt={pDetail.name} className="w-full h-full object-cover" />
                            ) : (
                              pDetail.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-accent-main)] rounded-full border-2 border-[var(--color-bg-primary)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-bold text-[var(--color-text-main)] truncate flex items-center gap-1">
                              {pDetail.name}
                              <ShieldCheck className="w-3 h-3 text-[var(--color-accent-main)] shrink-0" />
                            </h4>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono shrink-0">
                              {new Date(conv.lastMessageTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {conv.relatedListingTitle && (
                            <div className="text-[10px] font-mono text-[var(--color-accent-main)] truncate flex items-center gap-1 mb-1">
                              <Car className="w-2.5 h-2.5 shrink-0" />
                              {conv.relatedListingTitle}
                            </div>
                          )}

                          <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {conv.lastMessage || 'Click to view message thread...'}
                          </p>
                        </div>

                        {unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-600 text-[var(--color-text-header)] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation Active Message Thread Pane */}
            <div className={`flex-1 flex flex-col bg-[var(--color-bg-primary)] ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
              {activeConversationId ? (
                <>
                  {/* Chat Active Header */}
                  <div className="p-3 sm:p-4 border-b border-[var(--color-border-main)] bg-[var(--color-bg-secondary)]/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setActiveConversationId(null)}
                        className="md:hidden p-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)]"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>

                      <div className="w-10 h-10 rounded-full bg-blue-600 text-[var(--color-text-header)] font-bold flex items-center justify-center shrink-0 overflow-hidden border border-white/10 shadow-sm">
                        {otherParticipantDetail.avatar ? (
                          <img src={otherParticipantDetail.avatar} alt={otherParticipantDetail.name} className="w-full h-full object-cover" />
                        ) : (
                          otherParticipantDetail.name.substring(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-[var(--color-text-main)] truncate flex items-center gap-1.5">
                          {otherParticipantDetail.name}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20">
                            {otherParticipantDetail.role || 'Verified Partner'}
                          </span>
                        </h4>
                        <p className="text-[11px] text-[var(--color-text-muted)] truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-main)] animate-pulse" />
                          Online • Typical response time &lt; 5 mins
                        </p>
                      </div>
                    </div>

                    {/* Quick Call & WhatsApp Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {recipientUser?.phone && (
                        <a
                          href={`tel:${recipientUser.phone}`}
                          className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs font-bold text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}

                      <a
                        href={generateWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Linked Context Card (Listing or Service) */}
                  {(relatedListing || activeConv?.relatedListingTitle) && (
                    <div className="p-3 bg-[var(--color-bg-secondary)]/90 border-b border-[var(--color-border-main)] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-bg-secondary shrink-0 border border-white/10">
                          <img
                            src={relatedListing?.image || activeConv?.relatedListingImage || '/src/assets/images/bab_e_khyber_sunset_1783593379683.jpg'}
                            alt="Vehicle"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[var(--color-text-main)] truncate">
                            {relatedListing?.title || activeConv?.relatedListingTitle}
                          </div>
                          <div className="font-mono text-[var(--color-accent-main)] font-black text-xs">
                            {formatPkrPrice(relatedListing?.price || activeConv?.relatedListingPrice || 0)}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                        Inquiry Context
                      </span>
                    </div>
                  )}

                  {/* Messages Feed Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-transparent to-black/10">
                    {activeMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] flex items-center justify-center border border-[var(--color-accent-main)]/20">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--color-text-main)]">
                            {isUrdu ? 'گفتگو کا آغاز کریں' : 'Start your conversation'}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">
                            Your message will be safely stored and delivered to {otherParticipantDetail.name} instantly.
                          </p>
                        </div>
                      </div>
                    ) : (
                      activeMessages.map((msg) => {
                        const isMe = msg.senderId === effectiveUid;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                                {isMe ? 'You' : msg.senderName}
                              </span>
                              <span className="text-[9px] font-mono text-[var(--color-text-muted)] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div
                              className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed space-y-2 ${
                                isMe
                                  ? 'bg-[var(--color-accent-main)] text-[var(--color-text-header)] rounded-tr-none'
                                  : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-tl-none'
                              }`}
                            >
                              {/* Metadata card if listing inquiry */}
                              {msg.metadata?.listingTitle && (
                                <div className="p-2 rounded-xl bg-black/20 border border-white/10 text-[11px] mb-2 space-y-1">
                                  <div className="font-bold truncate">{msg.metadata.listingTitle}</div>
                                  <div className="font-mono text-emerald-300 font-bold">
                                    {formatPkrPrice(msg.metadata.listingPrice || 0)}
                                  </div>
                                </div>
                              )}

                              <p className="whitespace-pre-wrap">{msg.message}</p>

                              {/* Attachment preview */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="pt-2">
                                  {msg.attachments.map((att, i) => (
                                    <img
                                      key={i}
                                      src={att.url}
                                      alt={att.name}
                                      className="rounded-xl max-h-48 object-cover border border-white/20"
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Delivery status checkmark */}
                              {isMe && (
                                <div className="flex justify-end pt-0.5">
                                  <CheckCheck className="w-3.5 h-3.5 text-[var(--color-text-header)]/80" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Controls */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-[var(--color-border-main)] bg-[var(--color-bg-secondary)]/80 shrink-0">
                    {attachmentUrl && (
                      <div className="mb-2 p-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] flex items-center justify-between text-xs">
                        <span className="text-[var(--color-text-main)] font-mono truncate">Image attachment ready</span>
                        <button
                          type="button"
                          onClick={() => setAttachmentUrl(null)}
                          className="text-red-500 font-bold px-2 py-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt(isUrdu ? 'تصویر کا یو آر ایل درج کریں:' : 'Enter image URL to attach:');
                          if (url) setAttachmentUrl(url);
                        }}
                        className="p-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors shrink-0"
                        title="Attach Photo"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isUrdu ? 'پیغام لکھیں...' : 'Type your message...'}
                        className="flex-1 px-4 py-2.5 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent-main)]"
                      />

                      <button
                        type="submit"
                        disabled={sending || (!inputText.trim() && !attachmentUrl)}
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-accent-main)] hover:opacity-90 disabled:opacity-50 text-[var(--color-text-header)] font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isUrdu ? 'بھیجیں' : 'Send'}</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <MessageSquare className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[var(--color-text-main)]">
                      {isUrdu ? 'بات چیت منتخب کریں' : 'Select a conversation'}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] max-w-xs mt-1">
                      Choose an existing conversation thread from the left or inquire on a listing to start chatting.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
