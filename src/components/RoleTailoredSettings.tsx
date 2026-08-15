import React, { useState } from 'react';
import { 
  User, Shield, Store, Save, Sparkles, Sliders
} from 'lucide-react';
import { UserProfile, dbUpdateProfile } from '../lib/dbService';
import { useTheme } from './ThemeContext';
import { useCurrencyMode } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { useAutoSave } from '../hooks/useAutoSave';

interface RoleTailoredSettingsProps {
  currentUser: UserProfile;
  lang: 'en' | 'ur';
  onUpdateUser?: (updated: UserProfile) => void;
}

export function RoleTailoredSettings({
  currentUser,
  lang,
  onUpdateUser
}: RoleTailoredSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { currencyMode, changeCurrencyMode } = useCurrencyMode();

  // Role detection
  const isFounderOrAdmin = 
    currentUser.role === 'Admin' || 
    currentUser.role === 'Super Admin' || 
    ['amjid.bisconni@gmail.com', 'khattakghani94@gmail.com', 'mazharsouls@gmail.com'].includes(currentUser.email?.toLowerCase() || '');

  const isShowroomOwner = currentUser.role === 'Showroom Owner' || currentUser.role === 'Dealer';

  // Safe accessor for extended user profile fields
  const rawUser = currentUser as any;

  // Local Form Settings
  const [formData, setFormData] = useState({
    displayName: currentUser.displayName || '',
    phoneNumber: currentUser.phoneNumber || '',
    address: currentUser.address || 'Peshawar, KP',
    bio: currentUser.bio || '',
    notifyLeads: rawUser.settings?.notifyLeads ?? true,
    notifyWhatsApp: rawUser.settings?.notifyWhatsApp ?? true,
    showroomName: rawUser.dealershipName || rawUser.showroomName || '',
    whatsappHotline: currentUser.phoneNumber || '',
    themeChoice: rawUser.themeChoice || 'theme-cosmic-dark',
    autoApproveListings: isFounderOrAdmin,
    auditLogging: true
  });

  // Global Auto-Save engine hook integration
  const { isSaving, lastSavedAt } = useAutoSave(`user_settings_${currentUser.uid}`, formData, {
    delay: 1000,
    onSaveToCloud: async (savedData) => {
      try {
        await dbUpdateProfile(currentUser.uid, {
          displayName: savedData.displayName,
          phoneNumber: savedData.phoneNumber,
          address: savedData.address,
          bio: savedData.bio
        });
      } catch (err) {
        console.warn('Auto-save settings failed:', err);
      }
    }
  });

  const [isSavingManual, setIsSavingManual] = useState(false);


  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header Banner */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black uppercase text-[var(--color-text-main)] tracking-wider">
              {lang === 'ur' ? 'کردار کے مطابق ترتیبات' : 'Role-Tailored Control Panel'}
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Configured specifically for <span className="text-amber-400 font-bold uppercase">{currentUser.role || 'Member'}</span> rights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[10px] font-mono text-amber-400 animate-pulse flex items-center gap-1">
              <Sparkles size={11} /> Auto-Saving...
            </span>
          )}
          {lastSavedAt && !isSaving && (
            <span className="text-[10px] font-mono text-[var(--color-accent-main)]">
              Synced: {lastSavedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: Standard Account Preferences (Visible to All Roles) */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--color-border-main)]">
          <User size={16} /> Personal Account & Contact Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
              Full Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-main)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
              Primary Phone Number
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-main)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
              City & Region
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-main)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
              Display Currency Mode
            </label>
            <div className="grid grid-cols-3 gap-1 bg-bg-primary p-1 rounded-xl border border-[var(--color-border-main)]">
              {(['PKR', 'USD', 'DUAL'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeCurrencyMode(mode)}
                  className={`py-1 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all ${
                    currencyMode === mode ? 'bg-amber-500 text-slate-950 shadow' : 'text-text-muted hover:text-[var(--color-text-header)]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Role-Specific Showroom Controls (Only Showroom Owners) */}
      {isShowroomOwner && (
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--color-border-main)]">
            <Store size={16} /> Dealership Branding & Showroom Configurations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
                Showroom Name
              </label>
              <input
                type="text"
                value={formData.showroomName}
                onChange={(e) => setFormData({ ...formData, showroomName: e.target.value })}
                className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-main)]"
                placeholder="e.g. Auto Choice Showroom Peshawar"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">
                Direct WhatsApp Lead Hotline
              </label>
              <input
                type="text"
                value={formData.whatsappHotline}
                onChange={(e) => setFormData({ ...formData, whatsappHotline: e.target.value })}
                className="w-full bg-bg-primary border border-[var(--color-border-main)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-main)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Admin & Founder Platform Settings (Only Founders & Admins) */}
      {isFounderOrAdmin && (
        <div className="bg-bg-secondary/80 border border-amber-500/30 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 pb-2 border-b border-amber-500/20">
            <Shield size={16} /> Founder & Admin Governance Controls
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl border border-border-main cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoApproveListings}
                onChange={(e) => setFormData({ ...formData, autoApproveListings: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-[var(--color-text-header)] uppercase block">Auto-Approve Verified Listings</span>
                <span className="text-[10px] text-text-muted">Bypass moderation queue for verified showroom owners.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl border border-border-main cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auditLogging}
                onChange={(e) => setFormData({ ...formData, auditLogging: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div>
                <span className="text-xs font-bold text-[var(--color-text-header)] uppercase block">Full Security Audit Logging</span>
                <span className="text-[10px] text-text-muted">Record all system write operations and user privilege shifts.</span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
