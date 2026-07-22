import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Trash2, Calendar, Store, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SocialPost, SocialComment } from '../types';
import { toggleLikeSocialPost, deleteSocialPost } from '../services/api';
import CommentSection from './CommentSection';
import { toast } from 'sonner';

interface SocialFeedCardProps {
  post: SocialPost;
  currentUser: any;
  idToken: string | null;
  onDeletePost: (postId: string) => void;
  onSelectShowroom?: (showroomId: string) => void;
  onLoginClick?: () => void;
}

export default function SocialFeedCard({
  post,
  currentUser,
  idToken,
  onDeletePost,
  onSelectShowroom,
  onLoginClick
}: SocialFeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  // Optimistic Likes State
  const currentUserId = currentUser?.uid;
  const initialLiked = post.likes ? post.likes.includes(currentUserId) : false;
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync state if post prop changes
  React.useEffect(() => {
    if (post.likes) {
      setLiked(post.likes.includes(currentUserId));
      setLikesCount(post.likes.length);
    }
  }, [post.likes, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please sign in to love community posts.');
      if (onLoginClick) onLoginClick();
      return;
    }
    if (!idToken || likeLoading) return;

    // Optimistic Update
    const previousLiked = liked;
    const previousLikesCount = likesCount;

    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    setLikeLoading(true);

    try {
      const res = await toggleLikeSocialPost(post.id, idToken);
      if (res.success) {
        // Sync with exact server count
        setLikesCount(res.likesCount ?? 0);
        setLiked(res.liked ?? false);
      } else {
        // Rollback
        setLiked(previousLiked);
        setLikesCount(previousLikesCount);
        toast.error('Could not save love state.');
      }
    } catch (err) {
      // Rollback
      setLiked(previousLiked);
      setLikesCount(previousLikesCount);
      console.error('Error toggling like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!idToken || deleting) return;

    if (!window.confirm('Are you sure you want to permanently delete this community post?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteSocialPost(post.id, idToken);
      if (res.success) {
        toast.success('Community post deleted successfully.');
        onDeletePost(post.id);
      } else {
        toast.error(res.error || 'Failed to delete post.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting post.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    const shareTitle = `Post by ${post.userName} on Bazar360 Community`;
    const shareText = post.content.substring(0, 100);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Could not copy link to clipboard.');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'Super Admin':
        return 'bg-red-500/15 text-red-500 border border-red-500/35';
      case 'Showroom Owner':
      case 'Dealer':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/35';
      case 'Sales Rep':
      case 'Sales Representative':
        return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/35';
      case 'Private Seller':
        return 'bg-amber-500/15 text-amber-500 border border-amber-500/35';
      default:
        return 'bg-black/5 dark:bg-slate-700/50 text-[var(--color-text-main)] border border-[var(--color-border-main)]';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recently';
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'recently';
    }
  };

  // Determine permissions
  const isAuthor = post.userId === currentUserId;
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.email === 'amjid.bisconni@gmail.com';
  const canDelete = isAuthor || isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-white/10 duration-200 flex flex-col text-left"
      id={`social-card-${post.id}`}
    >
      {/* CARD HEADER */}
      <div className="p-5 flex items-center justify-between gap-3 border-b border-[var(--color-border-main)]" id={`social-header-${post.id}`}>
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <div className="w-11 h-11 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {post.userAvatar ? (
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-mono font-black text-[var(--color-text-main)]">
                {post.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-[var(--color-text-main)] hover:text-[#FF6B00] duration-150 cursor-pointer">
                {post.userName}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-wider ${getRoleBadgeColor(post.userRole)}`}>
                {post.userRole}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] font-mono">
              <Calendar size={10} className="text-[var(--color-text-muted)]" />
              <span>{formatTime(post.createdAt)}</span>
              {post.approved === false && (
                <span className="ml-2 bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider animate-pulse">
                  Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete Post Trigger (Original Author or Admin) */}
        {canDelete && (
          <button
            id={`delete-post-btn-${post.id}`}
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-main)] hover:border-red-500/30 hover:text-red-400 active:scale-95 duration-100 cursor-pointer text-[var(--color-text-muted)]"
            title="Delete post"
          >
            {deleting ? <Loader2 size={13} className="animate-spin text-red-500" /> : <Trash2 size={13} />}
          </button>
        )}
      </div>

      {/* CARD BODY */}
      <div className="p-5 space-y-4" id={`social-body-${post.id}`}>
        {/* Text Content */}
        <p className="text-[var(--color-text-main)] text-xs md:text-sm leading-relaxed font-sans text-left whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Showroom News Banner (if post represents a Showroom Owner announcement) */}
        {post.showroomId && (
          <div
            id={`showroom-link-${post.id}`}
            onClick={() => onSelectShowroom && onSelectShowroom(post.showroomId!)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#38BDF8]/5 hover:bg-[#38BDF8]/10 border border-[#38BDF8]/20 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-2 text-[#38BDF8]">
              <Store size={14} className="animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                Official Dealership Showcase Announcement
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-[#38BDF8] font-bold group-hover:translate-x-0.5 duration-150">
              <span className="text-[10px] font-mono font-black">View Showroom</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        )}

        {/* Optional Media Container (Responsive 16:9 Aspect Ratio or Multi-Image Gallery Grid) */}
        {post.mediaUrls && Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? (
          <div className="space-y-2 w-full">
            {/* If there is only one file, render it full size, otherwise render a multi-media grid */}
            {post.mediaUrls.length === 1 ? (
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border-main)] bg-black/5 dark:bg-slate-900 aspect-video shrink-0 shadow-inner group/media">
                {post.mediaUrls[0].match(/\.(mp4|webm|ogg|mov)$/i) || post.type === 'VIDEO' ? (
                  <video src={post.mediaUrls[0]} controls playsInline preload="metadata" className="w-full h-full object-cover" />
                ) : (
                  <img src={post.mediaUrls[0]} alt="Post Media attachment" className="w-full h-full object-cover group-hover/media:scale-[1.01] duration-300" referrerPolicy="no-referrer" loading="lazy" />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full" id={`social-gallery-${post.id}`}>
                {post.mediaUrls.map((url: string, index: number) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                  return (
                    <div key={url} className="relative rounded-xl overflow-hidden border border-[var(--color-border-main)] bg-black/5 dark:bg-slate-900 aspect-video shrink-0 shadow-inner group/media">
                      {isVideo ? (
                        <video src={url} controls playsInline preload="metadata" className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} alt={`Post Media ${index + 1}`} className="w-full h-full object-cover hover:scale-[1.02] duration-300 cursor-zoom-in" referrerPolicy="no-referrer" loading="lazy" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : post.mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border-main)] bg-black/5 dark:bg-slate-900 aspect-video shrink-0 shadow-inner group/media" id={`social-media-${post.id}`}>
            {post.type === 'VIDEO' || post.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video
                src={post.mediaUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post Media attachment"
                className="w-full h-full object-cover group-hover/media:scale-[1.01] duration-300"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ) : null}
      </div>

      {/* CARD INTERACTION ACTIONS BAR */}
      <div className="px-5 py-3.5 border-t border-[var(--color-border-main)] bg-black/5 dark:bg-black/5 dark:bg-slate-900/20 flex items-center justify-between gap-2 text-[var(--color-text-muted)] font-mono text-[11px]" id={`social-actions-${post.id}`}>
        <div className="flex items-center gap-4">
          {/* A. Love/Like Button */}
          <button
            id={`like-post-btn-${post.id}`}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none border border-transparent ${
              liked
                ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 font-bold scale-[1.05]'
                : 'hover:text-rose-400 hover:bg-white/5 hover:border-[var(--color-border-main)]'
            }`}
            title="Love this post"
          >
            <Heart size={14} className={liked ? 'fill-rose-500 stroke-rose-500 scale-110' : 'stroke-[2]'} />
            <span>{likesCount}</span>
          </button>

          {/* B. Comment Toggle Button */}
          <button
            id={`comment-toggle-btn-${post.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-sky-400 hover:bg-white/5 border border-transparent hover:border-[var(--color-border-main)] transition-all cursor-pointer select-none ${
              showComments ? 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20 font-bold' : ''
            }`}
            title="Toggle comments drawer"
          >
            <MessageSquare size={14} />
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* C. Share Button */}
        <button
          id={`share-post-btn-${post.id}`}
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-amber-500 hover:bg-white/5 border border-transparent hover:border-[var(--color-border-main)] transition-all cursor-pointer select-none"
          title="Share post"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* COLLAPSIBLE LAZY COMMENTS SECTION */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CommentSection
              postId={post.id}
              idToken={idToken}
              currentUser={currentUser}
              commentsCount={commentsCount}
              onCommentAdded={(newComment) => setCommentsCount((prev) => prev + 1)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
