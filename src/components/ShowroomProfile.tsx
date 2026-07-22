import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Heart, 
  Facebook, 
  Instagram, 
  Globe, 
  Video, 
  Edit, 
  Save, 
  Plus, 
  Trash, 
  Camera, 
  UserCheck, 
  Compass, 
  PhoneCall, 
  Images,
  RefreshCw
} from 'lucide-react';
import { Dealer, CarListing } from '../types';
import { useCurrencyMode } from '../lib/currency';
import VehicleListingCard from './VehicleListingCard';
import { InventoryGrid } from './InventoryGrid';
import { dbToggleShowroomLike, dbUpdateShowroomProfile } from '../lib/showroomService';
import { useAuth } from './AuthContext';
import { toast, Toaster } from 'sonner';
import ShowroomFABMenu from './ShowroomFABMenu';
import { ShowroomMap } from './ShowroomMap';
import { useTheme } from './ThemeContext';
import { ShowroomAnalyticsDashboard } from './ShowroomAnalyticsDashboard';

function VirtualizedImageCard({ img, idx, name }: { img: string; idx: number; name: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '300px 0px',
        threshold: 0,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="h-36 rounded-2xl overflow-hidden border border-[var(--color-border-main)] shadow-md hover:scale-102 transition-all duration-300 relative bg-[var(--color-bg-secondary)]/40 min-h-[144px]">
      {isVisible ? (
        <img 
          src={img} 
          alt={`${name} gallery view ${idx + 1}`} 
          className="w-full h-full object-cover" 
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-[var(--color-bg-secondary)]/30 animate-pulse rounded-2xl" />
      )}
    </div>
  );
}

interface ShowroomProfileProps {
  showroom: Dealer;
  inventory: CarListing[];
}

export function ShowroomProfile({ showroom, inventory }: ShowroomProfileProps) {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'about' | 'inventory' | 'contact' | 'analytics'>('about');
  
  // Real-time Firestore transaction state for likes
  const [likes, setLikes] = useState(showroom.likes_count || 0);
  const [isLiked, setIsLiked] = useState(() => {
    try {
      return localStorage.getItem(`bazar360_showroom_liked_${showroom.id}`) === 'true';
    } catch {
      return false;
    }
  });

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for profile edit
  const [name, setName] = useState(showroom.name || '');
  const [subtitle, setSubtitle] = useState(showroom.subtitle || '');
  const [description, setDescription] = useState(showroom.description || '');
  const [contactPerson, setContactPerson] = useState(showroom.contactPerson || 'Malak Mazhar');
  const [phone, setPhone] = useState(showroom.phone || '');
  const [landline, setLandline] = useState(showroom.landline || '');
  const [whatsapp, setWhatsapp] = useState(showroom.whatsapp || '');
  const [coverImage, setCoverImage] = useState(showroom.coverImage || 'https://images.unsplash.com/photo-1562141983-f32fdfa2bcfa?auto=format&fit=crop&q=80&w=1200');
  const [logoUrl, setLogoUrl] = useState(showroom.avatarUrl || showroom.logo || '');
  
  // General media gallery list of images
  const [gallery, setGallery] = useState<string[]>(showroom.gallery || [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=90&w=1600',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=90&w=1600',
    'https://images.unsplash.com/photo-1562591176-80db80e3039d?auto=format&fit=crop&q=90&w=1600',
  ]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Social media links
  const [facebookUrl, setFacebookUrl] = useState(showroom.socials?.facebook || '');
  const [instagramUrl, setInstagramUrl] = useState(showroom.socials?.instagram || '');
  const [tiktokUrl, setTiktokUrl] = useState(showroom.socials?.tiktok || '');

  // Is current logged in user the verified owner?
  const isOwner = currentUser && (
    currentUser.uid === showroom.ownerUid || 
    currentUser.uid === showroom.id || 
    showroom.ownerUid === currentUser.uid ||
    currentUser.role === 'Admin' ||
    currentUser.role === 'Super Admin'
  );

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    try {
      localStorage.setItem(`bazar360_showroom_liked_${showroom.id}`, String(newLikedState));
      await dbToggleShowroomLike(showroom.id, newLikedState);
      toast.success(newLikedState ? 'Added showroom to your liked list!' : 'Removed showroom from likes.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedData: Partial<Dealer> = {
        name,
        subtitle,
        description,
        contactPerson,
        phone,
        landline,
        whatsapp,
        coverImage,
        avatarUrl: logoUrl,
        logo: logoUrl,
        gallery,
        socials: {
          facebook: facebookUrl,
          instagram: instagramUrl,
          tiktok: tiktokUrl,
          website: showroom.socials?.website || '',
        },
        updatedAt: new Date().toISOString()
      };

      // Call secure database service
      await dbUpdateShowroomProfile(showroom.id, updatedData);
      
      // Update local storage / parent state where applicable
      toast.success('Showroom profile has been securely synchronized with BAZAR360 cloud!');
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update showroom profile: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setGallery(prev => [...prev, newGalleryUrl.trim()]);
    setNewGalleryUrl('');
    toast.success('Added new image to showroom gallery.');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
    toast.success('Removed image from gallery.');
  };

  // Safe formatting of whatsapp link
  const formattedWhatsappNumber = whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] relative select-none showroom-portal">
      <Toaster position="top-center" theme="dark" />
      
      {/* 1. Immersive Cover Photo Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
        <img 
          src={coverImage} 
          alt={`${name} Cover`} 
          className="w-full h-full object-cover opacity-85 transition-opacity" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-black/30 pointer-events-none" />
        
        {/* Verification Status badges */}
        <div className="absolute top-6 left-6 z-10 flex gap-2">
          {showroom.verified && (
            <span className="bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] px-3.5 py-1.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest shrink-0 shadow-lg backdrop-blur-md">
              ✓ Verified Showroom
            </span>
          )}
        </div>

        {/* Owner Dashboard edit triggers */}
        {isOwner && (
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="absolute top-6 right-6 z-10 bg-orange-600/95 hover:bg-orange-700 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xl backdrop-blur-sm border border-orange-500/20 active:scale-95 transition-all"
          >
            <Edit size={13} />
            <span>{isEditing ? 'Cancel Management' : 'Manage Showroom'}</span>
          </button>
        )}
      </div>

      {/* 2. Core Showroom Metadata and Avatar header */}
      <div className="max-w-7xl mx-auto px-6 pb-6 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl md:rounded-3xl border-4 border-[var(--color-bg-primary)] overflow-hidden bg-[var(--color-bg-secondary)] shadow-2xl flex items-center justify-center p-1 shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={name} 
                  className="w-full h-full object-contain" 
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-slate-950 font-black text-4xl uppercase">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div className="mb-2 space-y-1">
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-[var(--color-text-main)]">
                {name}
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm font-sans flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-500" />
                <span>{showroom.location || 'Peshawar, Pakistan'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Showroom likes counter with transaction hook */}
            <button 
              onClick={handleLike} 
              className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:bg-[var(--color-bg-primary)] text-[var(--color-text-main)] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Heart size={14} className={isLiked ? "fill-orange-500 text-orange-500 animate-pulse" : "text-slate-400"} />
              <span>{likes} Patrons Like</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC MANAGEMENT DASHBOARD OR STANDARD VIEW TABS */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="max-w-4xl mx-auto px-6 py-6 space-y-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl shadow-xl mb-12">
          <div className="border-b border-[var(--color-border-main)] pb-4">
            <h2 className="text-lg font-black tracking-wider text-orange-500 uppercase font-mono flex items-center gap-2">
              <Edit size={16} /> Showroom Profile Customizer
            </h2>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase mt-1">Authorized access to change credentials</p>
          </div>

          {/* Form Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Showroom Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Showroom Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Subtitle / Slogan */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Slogan / Subtitle</label>
              <input 
                type="text" 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Premium Auto Collection Peshawar"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Contact / Advisory Person</label>
              <input 
                type="text" 
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Malak Mazhar"
                required
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-bold"
              />
              <span className="text-[8px] font-mono text-orange-400">Specifically: Malak Mazhar for advisory, sales, and purchase inquiries.</span>
            </div>

            {/* Mobile Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Mobile Hotline</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0315-9085086"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* Landline */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Landline Phone</label>
              <input 
                type="text" 
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                placeholder="e.g. 091-5843109"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">WhatsApp Hotline Number</label>
              <input 
                type="text" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 923159085086"
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
              />
            </div>

            {/* Cover image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Cover Image URL</label>
              <input 
                type="text" 
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
              />
            </div>

            {/* Logo image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Logo Image URL</label>
              <input 
                type="text" 
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
              />
            </div>
          </div>

          {/* Socials Block */}
          <div className="space-y-4 pt-4 border-t border-[var(--color-border-main)]">
            <h3 className="text-xs font-black tracking-widest text-[var(--color-text-main)] uppercase font-sans">Contact & Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Facebook Link</label>
                <div className="relative flex items-center">
                  <Facebook size={12} className="absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl pl-9 pr-4 py-2 text-[11px] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Instagram Link</label>
                <div className="relative flex items-center">
                  <Instagram size={12} className="absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl pl-9 pr-4 py-2 text-[11px] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">TikTok Link</label>
                <div className="relative flex items-center">
                  <Video size={12} className="absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl pl-9 pr-4 py-2 text-[11px] text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 border-t border-[var(--color-border-main)] pt-4">
            <label className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Showroom About Description</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell clients about your showroom service and verified stock collection..."
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          {/* Media Gallery Manager */}
          <div className="space-y-4 border-t border-[var(--color-border-main)] pt-4">
            <div>
              <h3 className="text-xs font-black tracking-widest text-[var(--color-text-main)] uppercase font-sans">Showroom Photo Gallery Controls</h3>
              <p className="text-[9px] text-[var(--color-text-muted)] font-mono mt-0.5">Manage landscape walkaround snapshots displayed on your about view</p>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste landscape image URL (e.g., https://unsplash.com/...)"
                className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-xl px-4 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-orange-500/50 font-mono"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={14} /> Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {gallery.map((imgUrl, idx) => (
                <div key={`${imgUrl}-${idx}`} className="relative h-24 rounded-xl border border-[var(--color-border-main)] overflow-hidden bg-slate-900 group">
                  <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove Image"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border-main)]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-xl text-xs font-black uppercase tracking-wider border border-[var(--color-border-main)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={13} />}
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Navigation Tab bar */}
          <div className="flex border-b border-[var(--color-border-main)] px-6 max-w-7xl mx-auto">
            {['about', 'inventory', 'contact', ...(isOwner ? ['analytics'] : [])].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`capitalize px-6 py-3 font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'text-orange-500 border-b-2 border-orange-500 font-black' 
                    : 'text-slate-500 hover:text-[var(--color-text-main)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* About details & Contact Person */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4 shadow-sm">
                    <h2 className="text-xl font-display font-black tracking-tight text-[var(--color-text-main)]">
                      About Showroom Collection
                    </h2>
                    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed font-sans font-normal">
                      {description || "Welcome to our premier automotive showroom. We specialize in providing pristine-condition, fully audited vehicles ranging from locally assembled family SUVs to imported high-end sports models. All stock units undergo vigorous diagnostic sweeps."}
                    </p>
                  </div>

                  {/* General Photo Gallery */}
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-base font-black text-[var(--color-text-main)] font-display uppercase tracking-widest flex items-center gap-2">
                      <Images size={16} className="text-orange-500" /> Showroom Floor Snapshot Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {gallery.map((img, idx) => (
                        <VirtualizedImageCard key={`${img}-${idx}`} img={img} idx={idx} name={name} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                  
                  {/* Advisory Person / Contact Person Card */}
                  <div className="bg-gradient-to-br from-orange-600/10 to-slate-900/40 border border-orange-500/15 rounded-3xl p-6 space-y-4 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center font-black">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono text-orange-400 font-bold uppercase tracking-widest">Showroom Advisor</h4>
                        <p className="text-base font-black text-[var(--color-text-main)]">{contactPerson}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-normal">
                      Contact <span className="text-orange-400 font-bold">{contactPerson}</span> directly for custom vehicle advisory, sales inquiries, documentation processing, and purchase requests.
                    </p>
                    <a 
                      href={`tel:${phone}`}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-mono font-black text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-97 transition-all cursor-pointer"
                    >
                      <PhoneCall size={12} />
                      <span>Direct Advisory Phone</span>
                    </a>
                  </div>

                  {/* Blueprint specs */}
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Ecosystem Blueprint</h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[var(--color-border-main)] font-sans">
                        <span className="text-slate-400">Total Available Stock</span>
                        <span className="text-[var(--color-text-main)] font-bold">{inventory.length} Verified Units</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[var(--color-border-main)] font-sans">
                        <span className="text-slate-400">Showroom Rating</span>
                        <span className="text-[var(--color-text-main)] font-bold">★ {showroom.rating || '4.9'} / 5.0</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[var(--color-border-main)] font-sans">
                        <span className="text-slate-400">Opening Hours</span>
                        <span className="text-[var(--color-text-main)] font-bold">09:00 AM - 09:00 PM</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-3">
                  <div>
                    <h2 className="text-lg font-black text-[var(--color-text-main)] font-display uppercase tracking-widest">Showroom Showcase Fleet</h2>
                    <p className="text-xs text-[var(--color-text-muted)] font-sans">Strictly verified physical stock listings ready for purchase</p>
                  </div>
                  <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest">
                    {inventory.length} VEHICLES
                  </span>
                </div>

                <InventoryGrid 
                  listings={inventory}
                  dealer={showroom}
                  onSelectListing={(id) => {
                    if (window.dispatchEvent) {
                      const event = new CustomEvent('navigate-listing', { detail: id });
                      window.dispatchEvent(event);
                    }
                  }}
                />
              </div>
            )}

            {/* CONTACT TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Hotlines bento card */}
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6 shadow-sm">
                    <h2 className="text-lg font-black tracking-widest uppercase font-display text-[var(--color-text-main)]">Hotlines & Direct Calls</h2>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Reach our sales floor desks directly for fast transactions, sitemaps, and coordinate locations.</p>
                    
                    <div className="space-y-4">
                      {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 hover:bg-[var(--color-bg-secondary)] transition-all">
                          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                            <Phone size={18} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">Advisor Mobile</h4>
                            <p className="text-sm font-bold text-[var(--color-text-main)] font-mono">{phone}</p>
                          </div>
                        </a>
                      )}

                      {landline && (
                        <a href={`tel:${landline}`} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-orange-500/20 hover:bg-[var(--color-bg-secondary)] transition-all">
                          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                            <PhoneCall size={18} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">Showroom Landline</h4>
                            <p className="text-sm font-bold text-[var(--color-text-main)] font-mono">{landline}</p>
                          </div>
                        </a>
                      )}

                      {whatsapp && (
                        <a href={`https://wa.me/${formattedWhatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] hover:border-emerald-500/20 hover:bg-[var(--color-bg-secondary)] transition-all">
                          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <MessageCircle size={18} />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[10px] font-mono uppercase text-[var(--color-text-muted)]">Direct WhatsApp Channel</h4>
                            <p className="text-sm font-bold text-[var(--color-text-main)] font-mono">{whatsapp}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Social media connections */}
                  <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <h2 className="text-lg font-black tracking-widest uppercase font-display text-[var(--color-text-main)]">Social Broadcast Media</h2>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Follow our channels and broadcast pages to stay updated on incoming luxury stock and custom shipments.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {facebookUrl && (
                        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/15 text-blue-400 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                          <span className="flex items-center gap-2"><Facebook size={16} /> Facebook Page</span>
                          <span>Visit</span>
                        </a>
                      )}

                      {instagramUrl && (
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/15 text-pink-400 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                          <span className="flex items-center gap-2"><Instagram size={16} /> Instagram Feed</span>
                          <span>Visit</span>
                        </a>
                      )}

                      {tiktokUrl && (
                        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                          <span className="flex items-center gap-2"><Video size={16} /> TikTok Walkarounds</span>
                          <span>Visit</span>
                        </a>
                      )}

                      {!facebookUrl && !instagramUrl && !tiktokUrl && (
                        <p className="text-xs text-slate-500 italic text-center p-8">No official social channels configured for this dealership.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Showroom Map Pin Section */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl p-6 space-y-4 shadow-sm text-left">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight font-display text-[var(--color-text-main)]">Showroom Location</h3>
                      <p className="text-xs text-[var(--color-text-muted)] font-sans">Our premium physical floor coordinates on Ring Road, Peshawar</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=33.9972,71.4862`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-102 active:scale-98"
                    >
                      <MapPin size={14} className="animate-bounce" />
                      Get Directions
                    </a>
                  </div>

                  <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-[var(--color-border-main)] relative z-10">
                    <ShowroomMap 
                      lat={33.9972} 
                      lng={71.4862} 
                      showroomName={name} 
                      isDark={theme === 'dark'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && isOwner && (
              <ShowroomAnalyticsDashboard showroom={showroom} inventory={inventory} />
            )}

          </div>
        </>
      )}

      {/* Showroom Interactive Action Menu (FAB) */}
      <ShowroomFABMenu whatsappNumber={whatsapp || '03159085086'} />

    </div>
  );
}
