import React, { useState } from 'react';
import { Facebook, Instagram, MessageCircle, Globe, Link, Check, AlertCircle } from 'lucide-react';
import { updateSocialLinks } from '../lib/dbService';
import { SocialMedia } from '../types';

interface SocialMediaFormProps {
  userId: string;
  initialLinks?: SocialMedia;
  onSaveSuccess?: (updatedLinks: SocialMedia) => void;
}

export default function SocialMediaForm({ userId, initialLinks, onSaveSuccess }: SocialMediaFormProps) {
  const [links, setLinks] = useState<SocialMedia>({
    facebook: initialLinks?.facebook || '',
    instagram: initialLinks?.instagram || '',
    whatsapp: initialLinks?.whatsapp || '',
    tiktok: initialLinks?.tiktok || '',
    website: initialLinks?.website || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is fine (clearing it)
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    const errors: string[] = [];
    if (links.facebook && !validateUrl(links.facebook)) errors.push('Facebook URL is invalid. Must start with http:// or https://');
    if (links.instagram && !validateUrl(links.instagram)) errors.push('Instagram URL is invalid. Must start with http:// or https://');
    if (links.tiktok && !validateUrl(links.tiktok)) errors.push('TikTok URL is invalid. Must start with http:// or https://');
    if (links.website && !validateUrl(links.website)) errors.push('Website URL is invalid. Must start with http:// or https://');

    // WhatsApp numeric validation
    if (links.whatsapp) {
      const sanitizedPhone = links.whatsapp.replace(/\D/g, '');
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        errors.push('WhatsApp number must be a valid international number with country code (e.g., 923001234567, 10-15 digits, no spaces/special chars).');
      }
    }

    if (errors.length > 0) {
      setError(errors.join(' | '));
      return;
    }

    setSaving(true);
    try {
      await updateSocialLinks(userId, links);
      setSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess(links);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update social links.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof SocialMedia, value: string) => {
    setLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <form id="social-media-form" onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5 shadow-md">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Social Media & Connections</h3>
        <p className="text-xs text-slate-400">Establish professional endpoints for clients, distributors, and representatives.</p>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-500/30 p-3 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-lg flex items-center gap-2.5 text-xs text-emerald-200">
          <Check size={14} className="shrink-0" />
          <span>Social links updated successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Website */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Globe size={12} className="text-slate-400" />
            <span>Official Website</span>
          </label>
          <input
            type="url"
            placeholder="https://yourwebsite.com"
            value={links.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3.5 py-2 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MessageCircle size={12} className="text-emerald-500" />
            <span>WhatsApp Business Number (International Format)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 923001234567 (with country code, no + or spaces)"
            value={links.whatsapp || ''}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3.5 py-2 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* Facebook */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Facebook size={12} className="text-blue-500" />
            <span>Facebook Page URL</span>
          </label>
          <input
            type="url"
            placeholder="https://facebook.com/yourpage"
            value={links.facebook || ''}
            onChange={(e) => handleChange('facebook', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3.5 py-2 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Instagram size={12} className="text-pink-500" />
            <span>Instagram Profile URL</span>
          </label>
          <input
            type="url"
            placeholder="https://instagram.com/yourhandle"
            value={links.instagram || ''}
            onChange={(e) => handleChange('instagram', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3.5 py-2 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-600 font-sans"
          />
        </div>

        {/* TikTok */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Link size={12} className="text-cyan-500" />
            <span>TikTok Profile URL</span>
          </label>
          <input
            type="url"
            placeholder="https://tiktok.com/@yourhandle"
            value={links.tiktok || ''}
            onChange={(e) => handleChange('tiktok', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3.5 py-2 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-600 font-sans"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#FF6B00] hover:bg-[#E05B00] text-white py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Saving Settings...</span>
          </>
        ) : (
          <span>Save Social Connections</span>
        )}
      </button>
    </form>
  );
}
