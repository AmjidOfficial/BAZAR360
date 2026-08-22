import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, X, Upload, Phone, MapPin, Sparkles, ShieldCheck, Link2, UserCheck, Palette } from 'lucide-react';
import { Dealer } from '../../types';
import { dbRegisterDealership } from '../../lib/dbService';
import { toast } from 'react-hot-toast';

interface AdminCreateShowroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowroomCreated: () => void;
}

export const AdminCreateShowroomModal: React.FC<AdminCreateShowroomModalProps> = ({
  isOpen,
  onClose,
  onShowroomCreated
}) => {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [location, setLocation] = useState('Ring Road Peshawar, Near Charsadda Interchange');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ownerUid, setOwnerUid] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [themeChoice, setThemeChoice] = useState<'Cosmic' | 'Bone' | 'Emerald' | 'Gold'>('Cosmic');
  const [logoBase64, setLogoBase64] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Auto-generate slug when typing name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo image must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setLogoBase64(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error('Cover image must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCoverBase64(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Showroom Name is required');
      return;
    }

    const showroomId = (slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)/g, '');
    if (!showroomId) {
      toast.error('Invalid Showroom URL slug');
      return;
    }

    setLoading(true);

    try {
      const defaultLogo = logoBase64 || '';
      const defaultCover = coverBase64 || '/src/assets/images/bab_e_khyber_sunset_1783593379683.jpg';

      const newDealer: Omit<Dealer, 'activityFeed'> = {
        id: showroomId,
        slug: showroomId,
        ownerUid: ownerUid.trim() || undefined,
        name: name.trim(),
        subtitle: subtitle.trim() || 'Premier Verified Showroom on The Bazar360',
        location: location.trim() || 'Peshawar, KP',
        phone: phone.trim() || '+92 314 9198403',
        whatsapp: whatsapp.trim() || phone.trim() || '+92 314 9198403',
        rating: 4.9,
        vehiclesCount: 0,
        followersCount: '1',
        coverImage: defaultCover,
        logo: defaultLogo,
        logoUrl: defaultLogo,
        avatarUrl: defaultLogo,
        avatarLetter: name.substring(0, 2).toUpperCase(),
        description: description.trim() || `${name} Digital Showroom on Bazar360.online | The Bazar360. Fully verified vehicle inventory.`,
        flagshipVerified: true,
        verified: true,
        socials: {
          facebook: 'https://facebook.com/bazar360.online',
          instagram: 'https://instagram.com/bazar360.online'
        },
        theme_choice: themeChoice
      };

      await dbRegisterDealership(newDealer);
      toast.success(`Digital Showroom "${name}" registered successfully! URL: /?tab=showroom&id=${showroomId}`);
      onShowroomCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating showroom:', err);
      toast.error(err?.message || 'Failed to create Digital Showroom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[var(--color-bg-secondary)] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-[var(--color-text-header)] font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>Create Digital Showroom</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-orange-500/20 text-orange-300 border border-orange-500/30">Admin Authorized</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Register a new showroom website on Bazar360.online | The Bazar360
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-[var(--color-text-header)] rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Showroom Name & URL Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1">
                  Showroom Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bazar360 Peshawar"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Link2 size={12} /> Showroom URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. auto-choice-peshawar"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-mono text-orange-400 focus:outline-none focus:border-orange-500 transition"
                />
                <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                  URL: bazar360.online/?tab=showroom&id={slug || 'showroom-slug'}
                </span>
              </div>
            </div>

            {/* Subtitle & Assigned Owner User ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premier Luxury & Import Showroom"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-400" /> Assign Owner User ID / UID
                </label>
                <input
                  type="text"
                  placeholder="Optional Firebase Auth User UID"
                  value={ownerUid}
                  onChange={(e) => setOwnerUid(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Location & Contact Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Physical Location / Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almas Car Village, Ring Road Peshawar"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Phone size={12} /> Contact Phone & WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="+92 314 9198403"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (!whatsapp) setWhatsapp(e.target.value);
                  }}
                  className="w-full bg-bg-primary border border-border-main rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Theme Choice */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                <Palette size={12} /> Digital Showroom Branding Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Cosmic', 'Bone', 'Emerald', 'Gold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThemeChoice(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                      themeChoice === t
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow'
                        : 'bg-bg-primary text-text-muted border-border-main hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1">
                Showroom Bio / About Description
              </label>
              <textarea
                rows={3}
                placeholder="Peshawar's leading trusted automotive showroom specializing in verified Japanese imports..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-bg-primary border border-border-main rounded-xl p-3 text-xs font-bold text-[var(--color-text-header)] focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Logo & Cover Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Upload size={12} /> Showroom Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"
                />
                {logoBase64 && (
                  <div className="mt-2 w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                    <img src={logoBase64} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-text-muted uppercase mb-1 flex items-center gap-1">
                  <Upload size={12} /> Showroom Cover Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"
                />
                {coverBase64 && (
                  <div className="mt-2 h-12 rounded-xl overflow-hidden border border-white/20">
                    <img src={coverBase64} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-muted rounded-xl text-xs font-mono font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs font-mono uppercase rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Register Showroom'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
