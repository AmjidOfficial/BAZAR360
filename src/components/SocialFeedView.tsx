import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, MessageSquare, Search, Eye, Filter, Store, User, Compass } from 'lucide-react';
import { SocialPost } from '../types';
import { fetchCommunityFeed } from '../services/api';
import PostUploadForm from './PostUploadForm';
import SocialFeedCard from './SocialFeedCard';
import { toast } from 'sonner';

interface SocialFeedViewProps {
  currentUser: any;
  idToken: string | null;
  onSelectShowroom: (showroomId: string) => void;
  onLoginClick: () => void;
  lang?: 'en' | 'ur';
}

export default function SocialFeedView({
  currentUser,
  idToken,
  onSelectShowroom,
  onLoginClick,
  lang = 'en'
}: SocialFeedViewProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SHOWROOMS' | 'MINE'>('ALL');

  useEffect(() => {
    let active = true;
    const loadFeed = async () => {
      setLoading(true);
      try {
        const res = await fetchCommunityFeed();
        if (res.success && res.posts && active) {
          setPosts(res.posts);
          setError(null);
        } else if (active) {
          setError(res.error || 'Failed to retrieve community feed.');
        }
      } catch (err: any) {
        console.error('[Community Feed] Fetch error:', err);
        if (active) setError('Could not connect to the BAZAR360 community server.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFeed();
    return () => {
      active = false;
    };
  }, []);

  const handlePostCreated = (newPost: SocialPost) => {
    // Add newly created post to the top of the feed immediately
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  // Filter & search computation
  const filteredPosts = posts.filter((post) => {
    // 1. Text search
    const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.userName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!contentMatch) return false;

    // 2. Segmented filter
    if (activeFilter === 'SHOWROOMS') {
      return !!post.showroomId;
    }
    if (activeFilter === 'MINE') {
      return post.userId === currentUser?.uid;
    }

    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28 text-left" id="community-hub-view">
      {/* 1. HERO HEADER DISPLAY BANNER */}
      <div
        className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-to-br from-[#1E293B] via-slate-900 to-slate-950 border border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        id="community-hero-banner"
      >
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-500 font-mono text-[9px] font-black uppercase tracking-widest border border-orange-500/25">
              Live Feed
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {posts.length} Posts Active
            </span>
          </div>

          <h1 className="text-xl md:text-3xl font-black text-white tracking-tight font-display">
            BAZAR360 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE805D] to-orange-500">COMMUNITY</span> HUB
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
            Connect directly with verified automotive dealerships, elite showroom owners, and thousands of petrolheads across Pakistan. Discuss, announce, and engage instantly.
          </p>
        </div>

        {/* Quick info circle */}
        <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-full border border-white/5 bg-slate-900/40 shrink-0">
          <Compass size={32} className="text-[#FF6B00] animate-spin-slow" />
        </div>
      </div>

      {/* 2. POST CREATION PANEL OR GUEST CONVERT BANNER */}
      {idToken ? (
        <PostUploadForm
          currentUser={currentUser}
          idToken={idToken}
          onPostCreated={handlePostCreated}
          onLoginClick={onLoginClick}
        />
      ) : (
        <div
          id="guest-community-auth-prompt"
          className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs md:text-sm font-black uppercase text-white tracking-wider">
              Join the Bazar360 Community Discussion
            </h4>
            <p className="text-[11px] text-slate-400">
              Sign in to share vehicle updates, announce dealership inventory, leave comments, and love posts.
            </p>
          </div>
          <button
            id="guest-login-btn"
            onClick={onLoginClick}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 font-mono font-black text-xs uppercase tracking-wider duration-150 shrink-0 cursor-pointer"
            title="Sign in to post"
          >
            Sign In Instantly
          </button>
        </div>
      )}

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div
        className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-[var(--color-bg-secondary)] border border-white/5"
        id="community-feed-filter-bar"
      >
        {/* Search input field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="community-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts or users..."
            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] duration-150"
          />
        </div>

        {/* Segmented Filter Buttons */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 w-full sm:w-auto" id="community-filter-segments">
          <button
            id="filter-all-btn"
            onClick={() => setActiveFilter('ALL')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show all posts"
          >
            <Compass size={11} />
            <span>All</span>
          </button>

          <button
            id="filter-showrooms-btn"
            onClick={() => setActiveFilter('SHOWROOMS')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
              activeFilter === 'SHOWROOMS'
                ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show showrooms floor announcements"
          >
            <Store size={11} />
            <span>Dealers</span>
          </button>

          {currentUser && (
            <button
              id="filter-mine-btn"
              onClick={() => setActiveFilter('MINE')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                activeFilter === 'MINE'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show my posts only"
            >
              <User size={11} />
              <span>My Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. POST CARD FEED GRID */}
      <div className="space-y-5" id="community-post-feed-list">
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-4" id="community-skeleton-loaders">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-3xl p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-800 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-800 rounded w-1/4" />
                    <div className="h-2.5 bg-slate-800 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
                <div className="h-44 bg-slate-800 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-500/5 border border-red-500/10 rounded-3xl space-y-3" id="community-error-banner">
            <p className="text-red-400 font-bold text-xs md:text-sm">{error}</p>
            <button
              id="retry-feed-btn"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Retry Server Handshake
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/30 rounded-3xl border border-white/5 space-y-2 flex flex-col items-center justify-center" id="community-empty-state">
            <MessageSquare size={32} className="text-slate-600" />
            <h4 className="text-sm font-black text-slate-300 uppercase tracking-wider">No community posts match your criteria</h4>
            <p className="text-xs text-slate-500 font-sans max-w-sm">
              Be the first to create a post! Or change your filter segment / search term to view other announcements.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <SocialFeedCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                idToken={idToken}
                onDeletePost={handlePostDeleted}
                onSelectShowroom={onSelectShowroom}
                onLoginClick={onLoginClick}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
