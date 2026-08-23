import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Sparkles, 
  Tag, 
  Calendar, 
  Clock, 
  Plus, 
  Share2, 
  MessageCircle, 
  Trash2, 
  Edit3, 
  Pin, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  Car, 
  Flame, 
  Gift, 
  Bell, 
  ExternalLink,
  ShieldCheck,
  Heart,
  Zap,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Dealer, CarListing, ActivityPost } from '../types';
import { toast } from 'sonner';
import { dbUpdateDealer } from '../lib/dbService';

interface ShowroomAnnouncementsFeedProps {
  dealer: Dealer;
  listings: CarListing[];
  isOwner?: boolean;
  onPublishActivity?: (dealerId: string, post: ActivityPost) => Promise<void>;
  onSelectListing?: (car: CarListing) => void;
  lang?: 'en' | 'ur';
}

/**
 * Mobile Horizontal Swipeable Content Slider
 * Splits long announcement text and details into compact swipeable slides to conserve vertical screen space.
 */
function MobileAnnouncementSlider({
  post,
  linkedCar,
  dealer,
  onSelectListing,
  isUrdu
}: {
  post: ActivityPost;
  linkedCar?: CarListing | null;
  dealer: Dealer;
  onSelectListing?: (car: CarListing) => void;
  isUrdu?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Divide description into digestible chunks/sentences
  const textChunks = useMemo(() => {
    if (!post.description) return [];
    // Split by newlines first
    const lines = post.description.split(/\n+/).filter(p => p.trim().length > 0);
    if (lines.length > 1) return lines;

    // Split long single paragraph by sentences
    const sentences = post.description.match(/[^.!?]+[.!?]+/g) || [post.description];
    if (sentences.length <= 2) return [post.description];

    const half = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, half).join(' ').trim(),
      sentences.slice(half).join(' ').trim()
    ];
  }, [post.description]);

  // Construct structured slides
  const slides = useMemo(() => {
    const list: Array<{ id: string; badge: string; title: string; content?: string; type: 'summary' | 'details' | 'car' | 'image' }> = [];

    // Slide 1: Primary Overview
    list.push({
      id: 'overview',
      badge: post.badge || 'Summary',
      title: post.title,
      content: textChunks[0] || post.description,
      type: 'summary'
    });

    // Slide 2: Detailed Text (If long)
    if (textChunks.length > 1) {
      list.push({
        id: 'details',
        badge: 'Terms & Conditions',
        title: isUrdu ? 'مکمل تفصیلات' : 'Detailed Offer Terms',
        content: textChunks.slice(1).join('\n\n'),
        type: 'details'
      });
    }

    // Slide 3: Linked vehicle if available
    if (linkedCar) {
      list.push({
        id: 'car',
        badge: 'Featured Stock',
        title: linkedCar.title,
        type: 'car'
      });
    }

    // Slide 4: Image Banner if available
    if (post.imageUrl) {
      list.push({
        id: 'image',
        badge: 'Banner Photo',
        title: post.title,
        type: 'image'
      });
    }

    return list;
  }, [textChunks, post, linkedCar, isUrdu]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollPosition = container.scrollLeft;
    const slideWidth = container.clientWidth * 0.85;
    const newIdx = Math.min(slides.length - 1, Math.max(0, Math.round(scrollPosition / slideWidth)));
    setActiveSlide(newIdx);
  };

  const scrollToSlide = (idx: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const slideWidth = container.clientWidth * 0.85;
    container.scrollTo({
      left: idx * slideWidth,
      behavior: 'smooth'
    });
    setActiveSlide(idx);
  };

  return (
    <div className="block sm:hidden my-4 space-y-2">
      {/* Slider Header bar */}
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-orange-400 px-1">
        <span className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
          <Sparkles size={12} className="animate-pulse" />
          <span>{isUrdu ? 'تفصیلات دیکھنے کے لیے سلائیڈ کریں 👈' : 'Swipe for details 👈 👉'}</span>
        </span>

        {/* Slide Counter Dots */}
        <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 px-2.5 py-1 rounded-full">
          <span className="text-[10px] text-gray-400">{activeSlide + 1}/{slides.length}</span>
          <div className="flex items-center gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-4 bg-orange-500' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Swipeable Horizontally Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-2 pt-1 -mx-2 px-2"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="snap-center shrink-0 w-[88%] bg-[var(--color-bg-primary)] border border-orange-500/30 rounded-2xl p-4 flex flex-col justify-between min-h-[150px] shadow-md relative overflow-hidden"
          >
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-md border border-orange-500/20">
                  {slide.badge}
                </span>
                <span className="text-[9px] font-mono text-gray-400 font-bold">Slide {idx + 1} of {slides.length}</span>
              </div>

              {/* Title & Body by type */}
              {slide.type === 'summary' && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black font-display text-[var(--color-text-header)] line-clamp-1">{slide.title}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans leading-relaxed line-clamp-3 whitespace-pre-line">
                    {slide.content}
                  </p>
                </div>
              )}

              {slide.type === 'details' && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black font-display text-orange-400 uppercase">{slide.title}</h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans leading-relaxed line-clamp-4 whitespace-pre-line">
                    {slide.content}
                  </p>
                </div>
              )}

              {slide.type === 'car' && linkedCar && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-orange-400 uppercase">Featured Vehicle Stock</h4>
                  <div className="p-2.5 rounded-xl bg-bg-secondary border border-white/10 flex items-center gap-3">
                    <img
                      src={linkedCar.imageUrl || linkedCar.images?.[0]}
                      alt={linkedCar.title}
                      className="w-14 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-[var(--color-text-header)] truncate uppercase">{linkedCar.title}</h5>
                      <span className="text-xs font-mono font-extrabold text-[var(--color-accent-main)]">Rs. {linkedCar.price.toLocaleString()}</span>
                    </div>
                  </div>
                  {onSelectListing && (
                    <button
                      onClick={() => onSelectListing(linkedCar)}
                      className="w-full py-1.5 rounded-lg bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      Inspect Vehicle Details
                    </button>
                  )}
                </div>
              )}

              {slide.type === 'image' && post.imageUrl && (
                <div className="rounded-xl overflow-hidden h-28 border border-white/10 relative">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Slide Footer hint */}
            <div className="pt-2 border-t border-[var(--color-border-main)]/50 mt-2 flex items-center justify-between text-[9px] font-mono text-gray-400">
              <span>{idx < slides.length - 1 ? 'Swipe left for more ➔' : 'End of announcement'}</span>
              <div className="flex items-center gap-1">
                {idx > 0 && (
                  <button onClick={() => scrollToSlide(idx - 1)} className="p-0.5 rounded bg-white/10 text-[var(--color-text-header)]">
                    <ChevronLeft size={12} />
                  </button>
                )}
                {idx < slides.length - 1 && (
                  <button onClick={() => scrollToSlide(idx + 1)} className="p-0.5 rounded bg-white/10 text-[var(--color-text-header)]">
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_STYLES: Record<string, { label: string; labelUr: string; color: string; icon: any }> = {
  Event: {
    label: 'Promotional Event',
    labelUr: 'پروموشنل ایونٹ',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Calendar
  },
  Offer: {
    label: 'Seasonal Offer',
    labelUr: 'خصوصی ڈسکاؤنٹ آفر',
    color: 'bg-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] border-[var(--color-accent-main)]/30',
    icon: Gift
  },
  Update: {
    label: 'Showroom Update',
    labelUr: 'شو روم نیوز و اپڈیٹ',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Bell
  },
  Inventory: {
    label: 'New Fleet Arrival',
    labelUr: 'نئی گاڑی کی آمد',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Flame
  }
};

const SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
];

export function ShowroomAnnouncementsFeed({
  dealer,
  listings,
  isOwner = false,
  onPublishActivity,
  onSelectListing,
  lang = 'en'
}: ShowroomAnnouncementsFeedProps) {
  const isUrdu = lang === 'ur';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, number>>({});

  // Form states for posting new announcement
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Event' | 'Offer' | 'Update' | 'Inventory'>('Offer');
  const [newBadge, setNewBadge] = useState('Limited Time Deal');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active posts list from dealer.activityFeed
  const activityFeed = useMemo(() => {
    return dealer.activityFeed || [];
  }, [dealer.activityFeed]);

  // Filtered feed items
  const filteredFeed = useMemo(() => {
    return activityFeed.filter(post => {
      // Category filter
      if (activeCategory !== 'all') {
        const catLower = (post.badge || '').toLowerCase();
        if (activeCategory === 'Event' && !catLower.includes('event') && !catLower.includes('fair') && !catLower.includes('special')) return false;
        if (activeCategory === 'Offer' && !catLower.includes('offer') && !catLower.includes('deal') && !catLower.includes('discount')) return false;
        if (activeCategory === 'Update' && !catLower.includes('update') && !catLower.includes('news') && !catLower.includes('notice')) return false;
        if (activeCategory === 'Inventory' && !catLower.includes('arrival') && !catLower.includes('stock') && !catLower.includes('suv')) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${post.title} ${post.description} ${post.badge} ${post.price || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [activityFeed, activeCategory, searchQuery]);

  // Handle Like/Reaction
  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
    toast.success('Liked announcement!', { id: `like-${postId}` });
  };

  // Handle Share Announcement
  const handleSharePost = async (post: ActivityPost) => {
    const shareUrl = `${window.location.origin}/dealers/${dealer.id}?announcement=${post.id}`;
    const shareText = `📢 ${dealer.name.toUpperCase()} ANNOUNCEMENT:\n✨ ${post.title}\n🏷️ ${post.badge} ${post.price ? `(${post.price})` : ''}\n\n${post.description}\n\n📍 Showroom: ${dealer.location}\n🌐 View online: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: shareText, url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          toast.success('Announcement details copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Announcement details copied to clipboard!');
    }
  };

  // Handle Delete Announcement
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    const updatedFeed = activityFeed.filter(p => p.id !== postId);
    try {
      await dbUpdateDealer(dealer.id, { activityFeed: updatedFeed });
      toast.success('Announcement removed from storefront!');
    } catch (err) {
      toast.error('Failed to delete announcement.');
    }
  };

  // Handle Submit New Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error('Please enter a title and description.');
      return;
    }

    setIsSubmitting(true);
    const newPost: ActivityPost = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      badge: newBadge.trim() || (newCategory === 'Offer' ? 'Special Deal' : newCategory === 'Event' ? 'Promotional Event' : 'Showroom News'),
      title: newTitle.trim(),
      description: newDescription.trim(),
      price: newPrice.trim() || undefined,
      imageUrl: newImageUrl.trim() || undefined,
      carId: selectedCarId || undefined,
      status: 'approved'
    };

    const updatedFeed = isPinned ? [newPost, ...activityFeed] : [...activityFeed, newPost];

    try {
      if (onPublishActivity) {
        await onPublishActivity(dealer.id, newPost);
      } else {
        await dbUpdateDealer(dealer.id, { activityFeed: updatedFeed });
      }

      toast.success('📢 Announcement posted live to Storefront!');
      setIsPostModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPrice('');
      setNewImageUrl('');
      setSelectedCarId('');
      setIsPinned(false);
    } catch (err) {
      toast.error('Failed to post announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* 1. SECTION HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-[var(--color-border-main)] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <Megaphone size={14} className="text-orange-400 animate-bounce" />
              <span>{isUrdu ? 'سرکاری اعلانات اور آفرز' : 'Official Showroom Live Broadcast'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--color-text-header)] uppercase tracking-tight">
              {isUrdu ? 'شو روم نیوز و ڈسکاؤنٹ آفرز' : `${dealer.name} Announcements & Offers`}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              {isUrdu
                ? 'شو روم کے تازہ ترین ایونٹس، عید آفرز، ڈسکاؤنٹ ڈیلز اور نئی گاڑیوں کی آمد کی باضابطہ لائیو نشریات۔'
                : 'Stay updated with exclusive promotional events, seasonal price drops, showroom notices, and newly arrived inventory.'}
            </p>
          </div>

          {/* Action Button: Post Announcement (For Dealers/Owners & Managers) */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>{isUrdu ? 'نیا اعلان شائع کریں' : 'Post New Announcement'}</span>
            </button>
          </div>
        </div>

        {/* Quick Filter & Search Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: isUrdu ? 'تمام اعلانات' : 'All Updates' },
              { id: 'Event', label: isUrdu ? 'ایونٹس' : 'Events' },
              { id: 'Offer', label: isUrdu ? 'آفرز و سیل' : 'Seasonal Offers' },
              { id: 'Update', label: isUrdu ? 'خبریں' : 'Showroom News' },
              { id: 'Inventory', label: isUrdu ? 'نئی آمد' : 'Fleet Arrivals' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeCategory === tab.id
                    ? 'bg-orange-500 text-slate-950 border-orange-400 font-extrabold shadow-md shadow-orange-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-orange-500/40 hover:text-[var(--color-text-header)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? 'اعلانات تلاش کریں...' : 'Search announcements...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[var(--color-text-header)] placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. ANNOUNCEMENTS FEED LIST */}
      {filteredFeed.length === 0 ? (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 mx-auto flex items-center justify-center">
            <Megaphone size={28} />
          </div>
          <h3 className="text-lg font-black font-display uppercase text-[var(--color-text-main)]">
            {isUrdu ? 'کوئی اعلان نہیں ملا' : 'No Announcements Found'}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto font-sans">
            {isUrdu
              ? 'اس کیٹیگری میں ابھی کوئی نیا اعلان شائع نہیں کیا گیا ہے۔ اپنے شو روم کے لیے نیا اعلان پوسٹ کریں۔'
              : 'There are no announcements posted in this category yet. Click "Post New Announcement" to publish updates or promotional deals.'}
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-orange-600 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={14} />
            <span>{isUrdu ? 'پہلا اعلان شائع کریں' : 'Post First Announcement'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFeed.map((post, idx) => {
            const linkedCar = post.carId ? listings.find(l => l.id === post.carId) : null;
            const likes = (likedPosts[post.id] || 0) + 12; // Base reactions

            return (
              <motion.article
                key={post.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                {/* Glowing Top Subtle Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[var(--color-border-main)]/50 pb-4">
                  <div className="flex items-center gap-3">
                    {/* Dealer Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 font-black text-xs flex items-center justify-center shrink-0">
                      {dealer.logo ? <img src={dealer.logo} alt="Logo" className="w-7 h-7 object-contain" /> : dealer.avatarLetter}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[var(--color-text-main)] font-sans">
                          {dealer.name}
                        </span>
                        <ShieldCheck size={14} className="text-[var(--color-accent-main)]" />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        <span>{post.timestamp || 'Recently'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Badge & Price Tag */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                      {post.badge}
                    </span>

                    {post.price && (
                      <span className="px-3 py-1 rounded-full bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] font-mono font-black text-[10px] uppercase tracking-wider">
                        {post.price}
                      </span>
                    )}

                    {/* Delete Option for Owner */}
                    {isOwner && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* MOBILE VIEW: Horizontal Swipeable Content Slider for long text */}
                <MobileAnnouncementSlider
                  post={post}
                  linkedCar={linkedCar}
                  dealer={dealer}
                  onSelectListing={onSelectListing}
                  isUrdu={isUrdu}
                />

                {/* DESKTOP & TABLET VIEW: Full expanded card layout */}
                <div className="hidden sm:block space-y-5">
                  {/* Title & Body */}
                  <div className="space-y-3 mb-5">
                    <h3 className="text-xl font-black font-display text-[var(--color-text-header)] group-hover:text-orange-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] font-sans leading-relaxed whitespace-pre-line">
                      {post.description}
                    </p>
                  </div>

                  {/* Announcement Image Banner (If present) */}
                  {post.imageUrl && (
                    <div className="mb-5 rounded-2xl overflow-hidden border border-[var(--color-border-main)] max-h-96 relative group/img bg-bg-primary">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Attached Vehicle Preview Card (If linked to car) */}
                  {linkedCar && (
                    <div className="mb-5 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-orange-500/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={linkedCar.imageUrl || linkedCar.images?.[0]}
                          alt={linkedCar.title}
                          className="w-16 h-12 object-cover rounded-xl border border-[var(--color-border-main)]"
                        />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-orange-400 uppercase block">Featured Stock Vehicle</span>
                          <h4 className="text-xs font-black text-[var(--color-text-main)] uppercase truncate max-w-xs">{linkedCar.title}</h4>
                          <span className="text-xs font-mono font-extrabold text-[var(--color-accent-main)]">Rs. {linkedCar.price.toLocaleString()}</span>
                        </div>
                      </div>

                      {onSelectListing && (
                        <button
                          onClick={() => onSelectListing(linkedCar)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        >
                          Inspect Car
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer CTAs */}
                <div className="pt-4 border-t border-[var(--color-border-main)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    {/* Reaction button */}
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Heart size={16} className="text-rose-500 fill-rose-500/20" />
                      <span className="font-bold">{likes}</span>
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Action */}
                  <a
                    href={`https://wa.me/${(dealer.whatsapp || '923159085086').replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${dealer.name}! I am inquiring about your announcement: "${post.title}" on Bazar360.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* 3. POST ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-[var(--color-text-main)] max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/10 hover:bg-black/20 text-[var(--color-text-muted)] hover:text-[var(--color-text-header)] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-[var(--color-border-main)] pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display uppercase text-[var(--color-text-header)]">
                    {isUrdu ? 'نیا اعلان پوسٹ کریں' : 'Publish Storefront Announcement'}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Broadcast updates, promotional sales, and discounts to all showroom visitors.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-mono">
                {/* Announcement Title */}
                <div>
                  <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Independence Day Mega Sale - Save Up to Rs. 300,000!"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                    >
                      <option value="Offer">Seasonal Offer / Discount</option>
                      <option value="Event">Promotional Event</option>
                      <option value="Update">Showroom News & Notice</option>
                      <option value="Inventory">New Fleet Arrival</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                      Badge Text / Pill
                    </label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      placeholder="e.g. Limited Time, 10% OFF, VIP Deal"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Description & Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Write detailed information about the event, discount terms, or announcement news..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500 font-sans"
                  />
                </div>

                {/* Price / Offer Highlight */}
                <div>
                  <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Offer Price / Discount Value (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. Rs. 18,200,000 or Save Rs. 200,000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Image Banner URL */}
                <div>
                  <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                  />
                  {/* Sample presets */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Presets:</span>
                    {SAMPLE_BANNERS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewImageUrl(url)}
                        className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <img src={url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link Stock Car */}
                {listings.length > 0 && (
                  <div>
                    <label className="block font-bold uppercase text-[var(--color-text-muted)] mb-1">
                      Link Stock Vehicle (Optional)
                    </label>
                    <select
                      value={selectedCarId}
                      onChange={(e) => setSelectedCarId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500"
                    >
                      <option value="">-- No Linked Car --</option>
                      {listings.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.title} (Rs. {car.price.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pin to Top */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 bg-[var(--color-bg-primary)] border-[var(--color-border-main)] focus:ring-0"
                  />
                  <label htmlFor="pinCheckbox" className="text-xs text-[var(--color-text-main)] font-bold cursor-pointer flex items-center gap-1">
                    <Pin size={12} className="text-orange-400" />
                    <span>Pin Announcement to Top of Feed</span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 cursor-pointer mt-4"
                >
                  {isSubmitting ? 'Publishing Announcement...' : 'Publish Announcement Live'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
