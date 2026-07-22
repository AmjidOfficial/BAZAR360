import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Shield, Share2, 
  Facebook, Twitter, Instagram, Linkedin, Link as LinkIcon, Sparkles,
  ThumbsUp, MessageSquare, Image, Send, Heart, Eye, Trash2, X, PlusCircle,
  Star, Bookmark, Download, Check, Fingerprint, ShieldCheck
} from 'lucide-react';
import { UserProfile, dbUpdateProfile } from '../lib/dbService';
import { CarListing } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrencyMode } from '../lib/currency';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface UserProfileViewProps {
  user: UserProfile;
  lang: 'en' | 'ur';
  listings?: CarListing[];
  favoritesList?: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onToggleFavorite?: (car: CarListing) => void;
  setTab?: (tab: string) => void;
}

interface UserPost {
  id: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: string;
  content: string;
  image?: string;
  likesCount: number;
  hasLiked: boolean;
  comments: Array<{ author: string; text: string; time: string }>;
}

export default function UserProfileView({ 
  user, 
  lang, 
  listings = [], 
  favoritesList = [],
  onSelectListing,
  onToggleFavorite,
  setTab
}: UserProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDigitalShareCard, setShowDigitalShareCard] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const { renderPrice } = useCurrencyMode();
  const { registerBiometrics, authenticateBiometrics } = useAuth();

  // FB Publisher state
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  
  // Real-time custom posts inside component state
  const [customPosts, setCustomPosts] = useState<UserPost[]>(() => {
    try {
      const saved = localStorage.getItem(`bazar360_user_posts_${user.uid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'p-welcome',
        authorName: user.displayName || 'Bazar360 Member',
        authorPhoto: user.photoURL,
        createdAt: new Date().toISOString(),
        content: "Joined Peshawar's premier automotive network today! Eager to find some elite rides and connect with professional showrooms on Bazar360. 🚗🔥",
        likesCount: 5,
        hasLiked: false,
        comments: [
          { author: "Bazar360 Support", text: "Welcome to the family! Reach out if you need assistance.", time: "10m ago" }
        ]
      }
    ];
  });

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`bazar360_user_posts_${user.uid}`, JSON.stringify(customPosts));
    } catch (e) {}
  }, [customPosts, user.uid]);

  // Filter listings published by this user / showroom
  const myListings = listings.filter(car => 
    car.createdBy === user.uid || 
    (user.role === 'Showroom Owner' && car.dealerId === 'auto-choice-peshawar')
  );

  // If user has no listings, let's fall back to some sample listings for visualization
  const displayListings = myListings.length > 0 ? myListings : listings.slice(0, 2);

  // Collect all photos from custom posts and display listings
  const mediaPhotos = [
    ...(user.photoURL ? [user.photoURL] : []),
    ...customPosts.filter(p => p.image).map(p => p.image!),
    ...displayListings.map(c => c.imageUrl)
  ].filter(Boolean);

  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await dbUpdateProfile(user.uid, {
        displayName: editedUser.displayName,
        phoneNumber: editedUser.phoneNumber,
        address: editedUser.address,
        bio: editedUser.bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.displayName || 'User'}'s Profile | Bazar360`,
        url: window.location.href,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error sharing profile:', err);
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  // Publisher Form Submit
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: UserPost = {
      id: `p-${Date.now()}`,
      authorName: user.displayName || 'Bazar360 Member',
      authorPhoto: user.photoURL,
      createdAt: new Date().toISOString(),
      content: newPostText,
      image: newPostImage.trim() || undefined,
      likesCount: 0,
      hasLiked: false,
      comments: []
    };

    setCustomPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    setNewPostImage('');
    setShowImageInput(false);
  };

  const handleLikePost = (postId: string) => {
    setCustomPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likesCount: p.hasLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));
  };

  const handleDeletePost = (postId: string) => {
    if (postId === 'p-welcome') return;
    setCustomPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Comment submission state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = commentInputs[postId];
    if (!txt || !txt.trim()) return;

    setCustomPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, {
            author: user.displayName || 'Anonymous',
            text: txt.trim(),
            time: 'Just now'
          }]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cover & Profile Header */}
        <div className="relative bg-[var(--color-bg-secondary)] rounded-3xl overflow-hidden border border-[var(--color-border-main)] shadow-xl">
          {/* Cover gradient with beautiful landscape style */}
          <div className="h-56 bg-gradient-to-r from-orange-500/30 via-amber-500/20 to-blue-600/30 relative flex items-end p-6">
            <span className="text-[10px] bg-slate-950/70 text-amber-400 font-mono font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-500/25 backdrop-blur shadow">
              Verified User Node
            </span>
          </div>
          
          <div className="px-6 pb-6 pt-2">
            <div className="relative -mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative group shrink-0">
                <div className="w-40 h-40 rounded-full border-4 border-[var(--color-bg-secondary)] bg-orange-500 text-slate-950 flex items-center justify-center text-5xl font-black shadow-2xl overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2.5 bg-white text-slate-950 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                  <Camera size={18} />
                </button>
              </div>

              <div className="flex-grow mb-2 space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-3xl font-black text-[var(--color-text-main)] tracking-tight uppercase">
                    {user.displayName || 'Bazar360 User'}
                  </h1>
                  {user.role === 'Admin' && (
                    <span className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/25 text-[10px] font-black uppercase tracking-widest leading-none">
                      <Shield size={12} /> Admin
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-text-muted)] font-mono text-xs uppercase tracking-widest">
                  {user.role || 'Individual Buyer'} • Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] italic font-sans max-w-md">
                  "{user.bio || 'Peshawar automotive enthusiast & premium customer.'}"
                </p>
              </div>

              {/* Edit/Share buttons */}
              <div className="flex gap-2.5 mb-2 shrink-0">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg"
                >
                  <Edit2 size={13} />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
                <button 
                  onClick={() => setShowDigitalShareCard(true)}
                  className="p-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] active:scale-95 transition-all cursor-pointer"
                  title="Share profile"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Facebook-style Main Tabs Bar */}
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-main)] p-2 flex items-center justify-between sm:justify-start gap-1 shadow-md overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'posts'
                ? 'bg-orange-500 text-slate-950 font-black shadow'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)]'
            }`}
          >
            <MessageSquare size={15} />
            <span>Timeline Posts</span>
          </button>
          <button
            onClick={() => setActiveSubTab('media')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'media'
                ? 'bg-orange-500 text-slate-950 font-black shadow'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)]'
            }`}
          >
            <Image size={15} />
            <span>Photos & Media</span>
          </button>
          <button
            onClick={() => setActiveSubTab('likes')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'likes'
                ? 'bg-orange-500 text-slate-950 font-black shadow'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)]'
            }`}
          >
            <Heart size={15} />
            <span>Likes & Wishlist ({favoritesList.length})</span>
          </button>
        </div>

        {/* Edit Bio & Profile fields Block */}
        {isEditing && (
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-widest">Update Profile Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] block">Display Name</label>
                <input 
                  type="text" 
                  value={editedUser.displayName || ''}
                  onChange={(e) => setEditedUser({...editedUser, displayName: e.target.value})}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] block">Mobile Number</label>
                <input 
                  type="text" 
                  value={editedUser.phoneNumber || ''}
                  onChange={(e) => setEditedUser({...editedUser, phoneNumber: e.target.value})}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] block">Resident Address / Showroom Coordinates</label>
                <input 
                  type="text" 
                  value={editedUser.address || ''}
                  onChange={(e) => setEditedUser({...editedUser, address: e.target.value})}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] block">Bio Signature Quote</label>
                <textarea 
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl p-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-orange-500 min-h-[80px] resize-none"
                  placeholder="Tell us what you're passionate about..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--color-border-main)]">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-[var(--color-border-main)] hover:bg-[var(--color-bg-primary)] rounded-xl text-xs font-bold uppercase text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE TAB VIEWS CONTAINER */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left sidebar info box (FB styled) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-widest flex items-center gap-2">
                    <User size={14} className="text-orange-500" /> Intro Details
                  </h3>
                  <div className="space-y-3.5 text-xs text-[var(--color-text-main)] font-medium">
                    <div className="flex items-center gap-3">
                      <Mail size={15} className="text-[var(--color-text-muted)] shrink-0" />
                      <span className="truncate">{user.email || 'No linked email'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={15} className="text-[var(--color-text-muted)] shrink-0" />
                      <span>{user.phoneNumber || 'No phone added'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={15} className="text-[var(--color-text-muted)] shrink-0" />
                      <span>{user.address || 'Peshawar, Pakistan'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={15} className="text-[var(--color-text-muted)] shrink-0" />
                      <span>Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}</span>
                    </div>
                  </div>
                </div>

                {/* WebAuthn Biometric Hardware Passkey Registration Box */}
                <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-[var(--color-text-main)] tracking-widest flex items-center gap-2">
                    <Fingerprint size={16} className="text-orange-500 animate-pulse" /> Biometric Security Passkey
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-muted)] font-sans leading-relaxed">
                    Protect your account with WebAuthn Touch ID, Face ID, or Hardware Security Keys for privileged actions and instant sign-in.
                  </p>
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        toast.info('Initializing biometric hardware challenge...');
                        const success = await registerBiometrics();
                        if (success) {
                          toast.success('✓ Biometric Device Registered Successfully!');
                        } else {
                          toast.error('Biometric registration failed or cancelled.');
                        }
                      }}
                      className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Fingerprint size={15} />
                      <span>Register Biometric Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        toast.info('Verifying biometric credentials...');
                        const success = await authenticateBiometrics();
                        if (success) {
                          toast.success('✓ Biometric Hardware Verified!');
                        } else {
                          toast.error('Biometric verification failed.');
                        }
                      }}
                      className="w-full py-2 px-4 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck size={13} className="text-emerald-400" />
                      <span>Test Biometric Hardware</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-orange-500 to-amber-600 text-stone-950 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={15} className="fill-stone-950" /> Trust Telemetry
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 border border-white/20 p-3 rounded-2xl text-center">
                      <span className="text-2xl font-black block">{displayListings.length}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider block opacity-85">Posted Ads</span>
                    </div>
                    <div className="bg-white/10 border border-white/20 p-3 rounded-2xl text-center">
                      <span className="text-2xl font-black block">{customPosts.length}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider block opacity-85">Posts Made</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central feed column */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* FB Post Publisher block */}
                <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-bold font-mono text-sm uppercase shrink-0">
                      {(user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <form onSubmit={handlePublishPost} className="flex-grow">
                      <input
                        type="text"
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder={`What's on your mind, ${user.displayName?.split(' ')[0] || 'User'}?`}
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-full px-5 py-2.5 text-xs text-[var(--color-text-main)] font-semibold placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-orange-500/50"
                      />
                    </form>
                  </div>

                  {showImageInput && (
                    <div className="pt-2">
                      <input
                        type="url"
                        placeholder="Paste image URL here to attach photo..."
                        value={newPostImage}
                        onChange={(e) => setNewPostImage(e.target.value)}
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2 text-xs text-[var(--color-text-main)] font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  <div className="pt-3 border-t border-[var(--color-border-main)] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-orange-500 cursor-pointer font-bold transition-colors"
                    >
                      <Image size={15} className="text-emerald-500" />
                      <span>{showImageInput ? "Remove Photo Link" : "Add Photo URL"}</span>
                    </button>

                    <button
                      type="submit"
                      onClick={handlePublishPost}
                      disabled={!newPostText.trim()}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Send size={11} />
                      <span>Post</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Feed items */}
                <div className="space-y-6">
                  {/* Real-time custom posts */}
                  {customPosts.map((post) => (
                    <div key={post.id} className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 shadow-sm space-y-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-bold text-sm uppercase font-mono">
                            {(post.authorName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-[var(--color-text-main)] uppercase block tracking-tight leading-none">
                              {post.authorName}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono leading-none mt-1 block">
                              {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {post.id !== 'p-welcome' && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[var(--color-text-muted)] hover:text-red-500 p-1.5 hover:bg-[var(--color-bg-primary)] rounded-lg transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-[var(--color-text-main)] leading-relaxed font-sans text-left">
                        {post.content}
                      </p>

                      {/* Post Attachment image */}
                      {post.image && (
                        <div className="rounded-2xl overflow-hidden border border-[var(--color-border-main)] max-h-[340px] bg-slate-950">
                          <img 
                            src={post.image} 
                            alt="Post attachment" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-95" 
                            onClick={() => setActiveLightboxImage(post.image)}
                          />
                        </div>
                      )}

                      {/* Reactions indicators */}
                      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px]">👍</span>
                          <span>{post.likesCount} Likes</span>
                        </div>
                        <div className="font-semibold">{post.comments.length} Comments</div>
                      </div>

                      {/* Interactive Buttons Bar */}
                      <div className="grid grid-cols-2 gap-2 border-t border-b border-[var(--color-border-main)] py-2 text-xs">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`py-2 rounded-lg flex items-center justify-center gap-2 font-bold cursor-pointer transition-colors ${
                            post.hasLiked 
                              ? 'text-orange-500 bg-orange-500/10' 
                              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)]'
                          }`}
                        >
                          <ThumbsUp size={14} />
                          <span>Like</span>
                        </button>
                        <button
                          onClick={() => {
                            const inputElem = document.getElementById(`comment-input-${post.id}`);
                            if (inputElem) inputElem.focus();
                          }}
                          className="py-2 rounded-lg flex items-center justify-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] font-bold cursor-pointer transition-colors"
                        >
                          <MessageSquare size={14} />
                          <span>Comment</span>
                        </button>
                      </div>

                      {/* Comments Feed section */}
                      <div className="space-y-3 pt-2">
                        {post.comments.map((comment, cidx) => (
                          <div key={cidx} className="flex gap-2.5 items-start text-xs text-left bg-[var(--color-bg-primary)] p-3 rounded-2xl border border-[var(--color-border-main)]">
                            <div className="w-7 h-7 rounded-full bg-slate-400 text-slate-950 flex items-center justify-center font-black uppercase tracking-widest text-[9px] shrink-0 font-mono">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[var(--color-text-main)] uppercase tracking-tight block">
                                  {comment.author}
                                </span>
                                <span className="text-[9px] text-[var(--color-text-muted)] font-mono">{comment.time}</span>
                              </div>
                              <p className="text-[var(--color-text-main)] font-sans font-medium">{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Comment publish form */}
                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write an interactive comment..."
                            id={`comment-input-${post.id}`}
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            className="flex-grow bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2 text-xs text-[var(--color-text-main)] font-medium focus:outline-none focus:border-orange-500/50"
                          />
                          <button
                            type="submit"
                            className="p-2 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl active:scale-95 transition-transform cursor-pointer"
                          >
                            <Send size={13} />
                          </button>
                        </form>
                      </div>

                    </div>
                  ))}

                  {/* Visual timeline item representing User's Car Listings */}
                  {displayListings.map((car) => (
                    <div key={`listing-${car.id}`} className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-6 shadow-sm text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-slate-950 flex items-center justify-center font-bold text-sm uppercase font-mono">
                            {(user.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-[var(--color-text-main)] uppercase block tracking-tight leading-none">
                              {user.displayName || 'Showroom Owner'}
                            </span>
                            <span className="text-[10px] text-orange-500 font-mono tracking-widest uppercase mt-1.5 block">
                              ★ Featured Listing Posted
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono font-black uppercase">
                          Auto Choice
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-black text-base text-[var(--color-text-main)] uppercase tracking-tight">
                          {car.year} {car.make} {car.model}
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-sans">
                          Now listed on Bazar360! Excellent condition with certified inspection sheets and live spot coordinates in Peshawar.
                        </p>
                      </div>

                      <div 
                        onClick={() => onSelectListing?.(car)}
                        className="rounded-2xl overflow-hidden border border-[var(--color-border-main)] relative group aspect-16/10 cursor-pointer h-56 bg-slate-950"
                      >
                        <img 
                          src={car.imageUrl} 
                          alt={car.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-5">
                          <div className="flex justify-between items-end w-full">
                            <div>
                              <span className="text-[10px] font-mono tracking-widest text-[#38BDF8] font-bold block uppercase">{car.condition}</span>
                              <span className="text-lg font-black text-white block mt-0.5">{renderPrice(car.price)}</span>
                            </div>
                            <span className="text-[9px] uppercase font-mono tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg backdrop-blur">
                              Inspect Spec →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {activeSubTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-8 shadow-sm text-left space-y-6"
            >
              <div>
                <h3 className="text-lg font-black text-[var(--color-text-main)] uppercase tracking-tight flex items-center gap-2">
                  <Image size={20} className="text-orange-500" /> User Media Vault
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                  High-definition images of showroom vehicles, listings, and timeline photos.
                </p>
              </div>

              {mediaPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaPhotos.map((photo, pidx) => (
                    <div 
                      key={pidx}
                      onClick={() => setActiveLightboxImage(photo)}
                      className="aspect-square rounded-2xl overflow-hidden border border-[var(--color-border-main)] bg-slate-950 cursor-pointer hover:border-orange-500/50 transition-all group relative"
                    >
                      <img 
                        src={photo} 
                        alt="Media upload" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="text-white w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-primary)]">
                  <Image className="w-10 h-10 mx-auto text-orange-500 mb-2 opacity-50" />
                  <p className="text-[var(--color-text-muted)] text-xs">No media files uploaded yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeSubTab === 'likes' && (
            <motion.div
              key="likes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border-main)] p-8 shadow-sm text-left space-y-6"
            >
              <div>
                <h3 className="text-lg font-black text-[var(--color-text-main)] uppercase tracking-tight flex items-center gap-2">
                  <Heart size={20} className="text-rose-500 fill-rose-500" /> Saved Wishlist
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                  Vehicles you have bookmarked across the marketplace feed for side-by-side comparison.
                </p>
              </div>

              {favoritesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoritesList.map((car) => (
                    <div 
                      key={car.id}
                      className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl p-4 flex gap-4 hover:border-orange-500/30 transition-all group relative select-none"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                        <img src={car.imageUrl} alt={car.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-grow flex flex-col justify-between text-left">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono tracking-widest text-[#38bdf8] font-bold block uppercase">{car.make} • {car.year}</span>
                          <h4 
                            onClick={() => onSelectListing?.(car)}
                            className="font-extrabold text-xs text-[var(--color-text-main)] hover:text-orange-500 cursor-pointer uppercase truncate"
                          >
                            {car.title}
                          </h4>
                          <span className="text-[10px] text-orange-500 font-mono font-black block mt-1">{renderPrice(car.price)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectListing?.(car)}
                            className="text-[9px] uppercase font-mono font-black text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            View Specs &rarr;
                          </button>
                          
                          {onToggleFavorite && (
                            <button
                              onClick={() => onToggleFavorite(car)}
                              className="text-[9px] uppercase font-mono font-black text-red-500 hover:underline ml-auto cursor-pointer"
                              title="Remove from favorites"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-[var(--color-border-main)] rounded-2xl bg-[var(--color-bg-primary)]">
                  <Heart className="w-10 h-10 mx-auto text-rose-400 mb-2 opacity-50" />
                  <p className="text-[var(--color-text-main)] font-black text-sm uppercase">Your Wishlist is Empty</p>
                  <p className="text-[var(--color-text-muted)] text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                    Browse vehicles on the main home feed and click the heart icon to save listings here!
                  </p>
                  <button
                    onClick={() => setTab?.('home')}
                    className="mt-4 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest shadow active:scale-95 transition-all"
                  >
                    Browse Feed
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* DIGITAL PROFILE SHARE CARD MODAL (Chloe Harrison style) */}
      <AnimatePresence>
        {showDigitalShareCard && (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowDigitalShareCard(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.15)] border border-white/40 dark:border-slate-800/60 overflow-hidden flex flex-col justify-between"
              onClick={e => e.stopPropagation()}
            >
              {/* Outer soft glowing backlights for organic, modern look */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-400/10 dark:bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-400/10 dark:bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

              {/* Header icons: Close and Share */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <button 
                  onClick={() => setShowDigitalShareCard(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Profile URL copied to clipboard!');
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Copy Profile Link"
                >
                  <Share2 size={15} />
                </button>
              </div>

              {/* Profile Image with subtle blue background aura/glow as per 2nd photo */}
              <div className="flex flex-col items-start mb-6 relative z-10">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-full blur-xl opacity-25 scale-110 pointer-events-none" />
                  <div className="w-20 h-20 rounded-full ring-4 ring-white/80 dark:ring-slate-800 bg-orange-500 text-slate-950 flex items-center justify-center text-3xl font-black overflow-hidden relative z-10 shadow-lg">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Display Name & Role Subtitle */}
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">
                  {user.displayName || 'Bazar360 Member'}
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                  {user.displayName?.includes('Amjid') ? 'Founder' : (user.role || 'Verified Member')}
                </p>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                    {user.city || 'Peshawar'}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                    KPK Core
                  </span>
                  <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950/30 text-[10px] font-bold text-sky-600 dark:text-sky-400 rounded-full border border-sky-100 dark:border-sky-900/30">
                    Verified Seller
                  </span>
                </div>
              </div>

              {/* Stats telemetry row with thin dividers */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-5 pb-6 mb-2 relative z-10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 text-slate-900 dark:text-white font-extrabold text-sm mb-0.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>4.9</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Rating</span>
                </div>
                
                <div className="text-center border-x border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm mb-0.5 block">
                    {displayListings.length || '5+'}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Active Ads</span>
                </div>

                <div className="text-center">
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm mb-0.5 block">
                    {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Since</span>
                </div>
              </div>

              {/* Primary Get in touch & Save Bookmark buttons as per Chloe Harrison */}
              <div className="flex items-center gap-3 relative z-10 pt-2">
                <button 
                  onClick={() => {
                    const phoneNumber = user.phoneNumber || '03149198403';
                    const link = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;
                    window.open(link, '_blank');
                  }}
                  className="flex-1 py-3.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center cursor-pointer shadow-sm border border-sky-100/50 dark:border-sky-900/30"
                >
                  Get in touch
                </button>
                <button 
                  onClick={() => {
                    alert('Profile bookmarked to secure list!');
                  }}
                  className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all border border-slate-200/40 dark:border-slate-700/60 cursor-pointer"
                  title="Bookmark profile"
                >
                  <Bookmark size={16} />
                </button>
              </div>

              <div className="text-center text-[8px] text-slate-400 font-mono tracking-widest uppercase mt-4">
                Bazar360 Digital Passport
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN PHOTO LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {activeLightboxImage && (
          <div 
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setActiveLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 bg-white/10 text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/5 cursor-pointer"
              onClick={() => setActiveLightboxImage(null)}
            >
              <X size={20} />
            </button>
            <div className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <img src={activeLightboxImage} alt="Fullscreen viewing" className="w-full h-full object-contain max-h-[85vh]" />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
