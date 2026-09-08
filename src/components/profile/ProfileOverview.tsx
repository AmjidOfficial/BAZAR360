import React, { useState, useEffect } from 'react';
import { UserProfile, dbUpdateProfile } from '../../lib/dbService';
import { dbLogUserActivity } from '../../lib/userProfileService';
import { 
  User, Mail, Phone, MapPin, Calendar, Globe, Globe2,
  Save, Loader2, CheckCircle, ShieldCheck, Heart, Car, Eye, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Handle toast import safely
function toastMsg(type: 'success' | 'error', msg: string) {
  if (typeof window !== 'undefined') {
    import('sonner').then(m => m.toast[type](msg)).catch(() => {
      import('react-hot-toast').then(m => m.toast[type](msg)).catch(() => console.log(msg));
    });
  }
}

interface ProfileOverviewProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  counts: {
    vehicles: number;
    favorites: number;
    recentViews: number;
  };
  onNavigateTab: (tab: any) => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  user,
  onUpdateUser,
  counts,
  onNavigateTab
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [email, setEmail] = useState(user.email || '');
  const [city, setCity] = useState(user.city || '');
  const [address, setAddress] = useState(user.address || '');
  const [dob, setDob] = useState(user.dob || '');
  const [gender, setGender] = useState(user.gender || '');
  const [bio, setBio] = useState(user.bio || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ur'>(user.preferredLanguage || 'en');

  useEffect(() => {
    if (!isEditing) {
      setDisplayName(user.displayName || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
      setCity(user.city || '');
      setAddress(user.address || '');
      setDob(user.dob || '');
      setGender(user.gender || '');
      setBio(user.bio || '');
      setPreferredLanguage(user.preferredLanguage || 'en');
    }
  }, [user, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedFields: Partial<UserProfile> = {
        displayName,
        phoneNumber,
        email,
        city,
        address,
        dob,
        gender,
        bio,
        preferredLanguage,
        updatedAt: new Date().toISOString()
      };

      await dbUpdateProfile(user.uid, updatedFields);
      
      const updatedUser: UserProfile = {
        ...user,
        ...updatedFields
      };

      if (onUpdateUser) onUpdateUser(updatedUser);

      await dbLogUserActivity({
        userId: user.uid,
        action: 'UPDATE_PROFILE',
        description: 'Updated personal profile details and contact information.'
      });

      setIsEditing(false);
    } catch (err: any) {
      toastMsg('error', 'Failed to update profile: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Quick Stats Summary Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigateTab('my_vehicles')}
          className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-sky-500/40 transition-all text-center group cursor-pointer"
        >
          <div className="w-9 h-9 mx-auto rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-[var(--color-text-main)]">
            {counts.vehicles}
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Listed Vehicles
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('favorites')}
          className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-rose-500/40 transition-all text-center group cursor-pointer"
        >
          <div className="w-9 h-9 mx-auto rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-[var(--color-text-main)]">
            {counts.favorites}
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Saved Wishlist
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('recently_viewed')}
          className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-amber-500/40 transition-all text-center group cursor-pointer"
        >
          <div className="w-9 h-9 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-[var(--color-text-main)]">
            {counts.recentViews}
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Recently Viewed
          </div>
        </button>
      </div>

      {/* Main Profile Details Card */}
      <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-base font-bold font-display text-[var(--color-text-main)] flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              Personal & Contact Information
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] font-sans">
              Real account records associated with your Firebase identity.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Edit Details
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Peshawar, Islamabad, Lahore"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                Address / Neighborhood
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. University Road, Peshawar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                Biography / Short Intro
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell sellers & buyers a bit about yourself..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500 resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1">
                Preferred Interface Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs text-[var(--color-text-main)] focus:outline-none focus:border-sky-500"
              >
                <option value="en">English (Official)</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] font-bold text-xs uppercase font-mono cursor-pointer"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Full Name
              </div>
              <div className="font-semibold text-[var(--color-text-main)]">
                {user.displayName || 'Not provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Email Address
              </div>
              <div className="font-semibold text-[var(--color-text-main)]">
                {user.email || 'Not provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Mobile Number
              </div>
              <div className="font-mono font-semibold text-[var(--color-text-main)]">
                {user.phoneNumber || 'Not provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                City / Region
              </div>
              <div className="font-semibold text-[var(--color-text-main)]">
                {user.city || 'Not provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Gender
              </div>
              <div className="font-semibold text-[var(--color-text-main)]">
                {user.gender || 'Not specified'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Date of Birth
              </div>
              <div className="font-mono font-semibold text-[var(--color-text-main)]">
                {user.dob || 'Not provided'}
              </div>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <div className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-0.5">
                Address / Location
              </div>
              <div className="font-semibold text-[var(--color-text-main)]">
                {user.address || 'Not provided'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
