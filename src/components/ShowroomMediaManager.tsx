import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  Save, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  Eye, 
  ShieldCheck, 
  Link as LinkIcon, 
  Trash2,
  Sliders,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Dealer } from '../types';
import { dbUpdateDealer } from '../lib/dbService';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../lib/cloudinaryService';
import { toast } from 'sonner';

interface ShowroomMediaManagerProps {
  dealer: Dealer;
  onUpdateDealer: (updatedDealer: Dealer) => void;
  onClose?: () => void;
}

// Preset Luxury Background Pictures for Showrooms
const PRESET_BACKGROUNDS = [
  {
    id: 'bab-e-khyber',
    name: 'Bab-e-Khyber Sunset Peshawar',
    url: '/src/assets/images/bab_e_khyber_sunset_1783593379683.jpg',
    tag: 'Peshawar Landmark'
  },
  {
    id: 'auto-choice-floor',
    name: 'Auto Choice Showroom Floor',
    url: '/src/assets/images/auto_choice_showroom_1783593399914.jpg',
    tag: 'Flagship Showroom'
  },
  {
    id: 'luxury-hall',
    name: 'Luxury Supercar Exhibition Hall',
    url: 'https://images.unsplash.com/photo-1562575214-da9fcf59b907?auto=format&fit=crop&w=1600&q=80',
    tag: 'Modern Interior'
  },
  {
    id: 'obsidian-fleet',
    name: 'Obsidian Night Sports Fleet',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80',
    tag: 'Exotic Night'
  },
  {
    id: 'german-motors',
    name: 'German Import Vehicles Lineup',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80',
    tag: 'Luxury German'
  },
  {
    id: 'sunset-coast',
    name: 'Golden Sunset Car Village',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    tag: 'Golden Hour'
  }
];

// Preset Logo Badges / Icons for Showrooms
const PRESET_LOGOS = [
  {
    id: 'auto-choice-badge',
    name: 'Auto Choice Corporate Shield',
    url: '/auto_choice_logo_dark.jpg',
    tag: 'Official'
  },
  {
    id: 'gold-crown',
    name: 'Gold Crown Motors',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    tag: 'Luxury'
  },
  {
    id: 'hyper-cyan',
    name: 'Hyper Velocity Badge',
    url: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=300&q=80',
    tag: 'Sport'
  },
  {
    id: 'emerald-seal',
    name: 'Emerald Certified Seal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    tag: 'Verified'
  }
];

export const ShowroomMediaManager: React.FC<ShowroomMediaManagerProps> = ({
  dealer,
  onUpdateDealer,
  onClose
}) => {
  // State for Logo and Cover image
  const [logoUrl, setLogoUrl] = useState<string>(dealer.logoUrl || dealer.logo || dealer.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState<string>(dealer.coverImage || PRESET_BACKGROUNDS[0].url);
  const [subtitle, setSubtitle] = useState<string>(dealer.subtitle || 'To buy and Sell New and Used Cars, Jeeps and SUVs');

  const [customLogoInput, setCustomLogoInput] = useState<string>('');
  const [customCoverInput, setCustomCoverInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // File input refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Logo File Upload handler (uploads to Cloudinary, returns HTTPS URL)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const toastId = toast.loading('Compressing and uploading logo to Cloudinary...');
    try {
      const result = await uploadToCloudinary(file, {
        folder: 'bazar360_showroom_logos',
        maxDim: 1920,
        quality: 0.9,
        maxSizeKB: 5120
      });
      if (result.secure_url) {
        setLogoUrl(result.secure_url);
        toast.success('Custom logo uploaded & applied!', { id: toastId });
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      toast.error(err.message || 'Failed to upload logo to Cloudinary', { id: toastId });
    }
  };

  // Cover Image File Upload handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const toastId = toast.loading('Compressing and uploading background image to Cloudinary...');
    try {
      const result = await uploadToCloudinary(file, {
        folder: 'bazar360_showroom_covers',
        maxDim: 1920,
        quality: 0.9,
        maxSizeKB: 5120
      });
      if (result.secure_url) {
        setCoverUrl(result.secure_url);
        toast.success('Custom background picture uploaded & applied!', { id: toastId });
      }
    } catch (err: any) {
      console.error('Cover upload error:', err);
      toast.error(err.message || 'Failed to upload background image to Cloudinary', { id: toastId });
    }
  };

  // Apply custom URL inputs
  const handleApplyLogoUrl = () => {
    if (!customLogoInput.trim()) return;
    setLogoUrl(customLogoInput.trim());
    setCustomLogoInput('');
    toast.success('Logo URL applied!');
  };

  const handleApplyCoverUrl = () => {
    if (!customCoverInput.trim()) return;
    setCoverUrl(customCoverInput.trim());
    setCustomCoverInput('');
    toast.success('Background image URL applied!');
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      let finalLogoUrl = logoUrl;
      let finalCoverUrl = coverUrl;

      if (finalLogoUrl && finalLogoUrl.startsWith('data:')) {
        toast.info('Uploading logo to Cloudinary...', { id: 'media-upload-logo' });
        finalLogoUrl = await uploadBase64ToCloudinary(finalLogoUrl, 'bazar360_logos');
        setLogoUrl(finalLogoUrl);
      }

      if (finalCoverUrl && finalCoverUrl.startsWith('data:')) {
        toast.info('Uploading background image to Cloudinary...', { id: 'media-upload-cover' });
        finalCoverUrl = await uploadBase64ToCloudinary(finalCoverUrl, 'bazar360_covers');
        setCoverUrl(finalCoverUrl);
      }

      const updatedData: Partial<Dealer> = {
        logoUrl: finalLogoUrl,
        logo: finalLogoUrl,
        avatarUrl: finalLogoUrl,
        coverImage: finalCoverUrl,
        subtitle: subtitle,
        updatedAt: new Date().toISOString()
      };

      await dbUpdateDealer(dealer.id, updatedData);

      const updatedDealer: Dealer = {
        ...dealer,
        ...updatedData
      };

      onUpdateDealer(updatedDealer);
      toast.success('Showroom logo & background pictures saved successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving showroom media:', error);
      toast.error('Failed to save showroom media to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">

      {/* HEADER BAR */}
      <div className="bg-bg-secondary border border-border-main p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-md">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-[var(--color-text-header)] tracking-wider flex items-center gap-2">
              Showroom Media & Branding Upload Manager
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Upload custom showroom logos, set cover background pictures, and inspect real-time mobile previews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-bg-primary p-1 rounded-xl border border-border-main">
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-orange-500 text-slate-950 font-black' : 'text-text-muted hover:text-[var(--color-text-header)]'
              }`}
            >
              <Smartphone size={13} /> Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-orange-500 text-slate-950 font-black' : 'text-text-muted hover:text-[var(--color-text-header)]'
              }`}
            >
              <Monitor size={13} /> Desktop
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase transition shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            <span>Save Branding Media</span>
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW CANVAS STAGE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Eye size={14} className="text-orange-400" /> Live Interactive Preview ({previewDevice.toUpperCase()})
          </span>
          <span className="text-[10px] font-mono text-[var(--color-accent-main)] font-bold uppercase">
            ● Real-Time Render
          </span>
        </div>

        <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
          <div className="relative rounded-3xl overflow-hidden border border-border-main shadow-2xl bg-bg-primary group">
            {/* Background Cover Image */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden bg-bg-secondary">
              <img
                src={coverUrl}
                alt="Showroom Background"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
            </div>

            {/* Header Content Overlay */}
            <div className="relative p-6 -mt-16 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                {/* Showroom Logo */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-bg-secondary/90 border-2 border-border-main p-2 shrink-0 flex items-center justify-center shadow-2xl shadow-black/80 backdrop-blur-md">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={dealer.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-orange-500" />
                  )}
                </div>

                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[var(--color-accent-main)]/10 text-[var(--color-accent-main)] border border-[var(--color-accent-main)]/20 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={10} /> Verified Showroom
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-[var(--color-text-header)] tracking-tight leading-none">
                    {dealer.name}
                  </h3>
                  <p className="text-xs text-orange-400 font-bold tracking-wider uppercase font-sans line-clamp-1">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="shrink-0 font-mono text-[10px] text-text-muted bg-bg-secondary/80 px-3 py-1.5 rounded-xl border border-border-main">
                {dealer.location || 'Peshawar, KP'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA EDITING CONTROLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: SHOWROOM LOGO UPLOADER */}
        <div className="bg-bg-secondary border border-border-main p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)] flex items-center gap-2">
              <Building2 className="text-orange-500" size={18} /> 
              1. Showroom Logo & Avatar
            </h3>
            <span className="text-[10px] text-text-muted font-mono">PNG / JPG / WebP</span>
          </div>

          {/* Current Logo Box */}
          <div className="flex items-center gap-4 bg-bg-primary p-4 rounded-2xl border border-border-main">
            <div className="w-16 h-16 rounded-xl bg-bg-secondary border border-border-main p-2 flex items-center justify-center shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Building2 className="w-8 h-8 text-text-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-extrabold text-[var(--color-text-header)] block truncate">Active Logo Asset</span>
              <p className="text-[10px] text-text-muted font-mono truncate">{logoUrl || 'No logo assigned'}</p>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => logoFileInputRef.current?.click()}
            className="border-2 border-dashed border-border-main hover:border-orange-500/80 bg-bg-primary/60 hover:bg-bg-primary p-6 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
          >
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 flex items-center justify-center transition-transform">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[var(--color-text-header)] uppercase tracking-wider">
                Click or Drag Custom Logo File
              </p>
              <p className="text-[10px] text-text-muted mt-1">
                Supports transparent PNG files or high-resolution brand vectors.
              </p>
            </div>
          </div>

          {/* Preset Logo Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
              Or Choose Official Badge Presets
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_LOGOS.map((preset) => {
                const isSelected = logoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setLogoUrl(preset.url)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 text-left transition cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                        : 'bg-bg-primary border-border-main hover:border-border-main text-text-muted'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain rounded-md shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold block truncate">{preset.name}</span>
                      <span className="text-[9px] font-mono text-text-muted">{preset.tag}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* External URL Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
              Direct Logo Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://domain.com/logo.png"
                value={customLogoInput}
                onChange={(e) => setCustomLogoInput(e.target.value)}
                className="flex-1 bg-bg-primary border border-border-main rounded-xl px-3 py-2 text-xs text-[var(--color-text-header)] font-mono focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleApplyLogoUrl}
                className="px-4 py-2 bg-bg-tertiary hover:bg-slate-700 text-[var(--color-text-header)] text-xs font-bold uppercase rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHOWROOM BACKGROUND COVER PICTURE UPLOADER */}
        <div className="bg-bg-secondary border border-border-main p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)] flex items-center gap-2">
              <ImageIcon className="text-orange-500" size={18} /> 
              2. Showroom Background Cover Picture
            </h3>
            <span className="text-[10px] text-text-muted font-mono">16:9 HD Banner</span>
          </div>

          {/* Current Cover Box */}
          <div className="relative h-24 rounded-2xl overflow-hidden border border-border-main bg-bg-primary">
            <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-4">
              <span className="text-xs font-extrabold text-[var(--color-text-header)] drop-shadow">Active Background</span>
              <span className="text-[9px] font-mono text-text-muted bg-black/60 px-2 py-1 rounded-md">
                Applied
              </span>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => coverFileInputRef.current?.click()}
            className="border-2 border-dashed border-border-main hover:border-orange-500/80 bg-bg-primary/60 hover:bg-bg-primary p-6 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
          >
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 flex items-center justify-center transition-transform">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[var(--color-text-header)] uppercase tracking-wider">
                Upload Custom Showroom Cover Image
              </p>
              <p className="text-[10px] text-text-muted mt-1">
                Recommended 1920x1080 resolution. PNG, JPG or WebP images.
              </p>
            </div>
          </div>

          {/* Preset Background Gallery Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
              Or Select HD Preset Showroom Backgrounds
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_BACKGROUNDS.map((preset) => {
                const isSelected = coverUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setCoverUrl(preset.url)}
                    className={`relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all group ${
                      isSelected ? 'ring-2 ring-orange-500 scale-[1.02]' : 'border-border-main opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-[var(--color-text-header)] truncate">{preset.name}</span>
                      <span className="text-[8px] font-mono text-orange-400">{preset.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External Cover URL Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
              Direct Cover Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://domain.com/background.jpg"
                value={customCoverInput}
                onChange={(e) => setCustomCoverInput(e.target.value)}
                className="flex-1 bg-bg-primary border border-border-main rounded-xl px-3 py-2 text-xs text-[var(--color-text-header)] font-mono focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleApplyCoverUrl}
                className="px-4 py-2 bg-bg-tertiary hover:bg-slate-700 text-[var(--color-text-header)] text-xs font-bold uppercase rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBTITLE & TAGLINE ENGINE EDITING */}
      <div className="bg-bg-secondary border border-border-main p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-header)] flex items-center gap-2">
          <Sparkles className="text-orange-500" size={16} /> 
          3. Showroom Subtitle & Tagline
        </h3>
        <div>
          <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider block mb-1">
            Showroom Header Slogan / Tagline
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. To buy and Sell New and Used Cars, Jeeps and SUVs"
            className="w-full bg-bg-primary border border-border-main rounded-2xl px-4 py-3 text-xs text-[var(--color-text-header)] font-bold focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

    </div>
  );
};
