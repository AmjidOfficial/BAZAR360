import React, { useState } from 'react';
import { UserProfile, dbUpdateProfile } from '../../lib/dbService';
import { uploadToCloudinary } from '../../lib/cloudinaryService';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { auth } from '../../firebase';
import { 
  User, Camera, Shield, ShieldCheck, Mail, Phone, MapPin, 
  Calendar, Edit2, Share2, Sparkles, Check, Loader2, Building2, Image as ImageIcon
} from 'lucide-react';
import { ProfileCompletion } from './ProfileCompletion';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
  onOpenSecurity: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  setTab?: (tab: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  onOpenSecurity,
  onUpdateUser,
  setTab
}) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isActuallyVerified = (user as any).isVerified === true || (user as any).verifiedStatus === 'verified';
  const displayRole = user.role || 'Individual User';

  const coverUrl = user.coverImage || (user as any).coverPhoto || (user as any).coverPhotoURL;
  const avatarUrl = user.photoURL || user.profilePhoto || user.logoUrl;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error(`Image size (${Math.round(file.size / (1024 * 1024))}MB) exceeds 12MB limit.`);
      return;
    }

    setIsUploadingPhoto(true);
    try {
      let photoURL = '';
      try {
        const res = await uploadToCloudinary(file, {
          compress: true,
          maxDim: 1200,
          quality: 0.85,
          resourceType: 'image',
          folder: 'bazar360/users/avatars'
        });
        if (res?.secure_url) photoURL = res.secure_url;
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, converting to local base64:', cloudErr);
      }

      if (!photoURL) {
        // Local base64 fallback
        const reader = new FileReader();
        photoURL = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      await dbUpdateProfile(user.uid, { photoURL, profilePhoto: photoURL, logoUrl: photoURL });
      
      const updated = { ...user, photoURL, profilePhoto: photoURL, logoUrl: photoURL };
      if (onUpdateUser) onUpdateUser(updated);

    } catch (err: any) {
      toast.error('Failed to upload photo: ' + (err.message || err));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error(`Cover image size (${Math.round(file.size / (1024 * 1024))}MB) exceeds 12MB limit.`);
      return;
    }

    setIsUploadingCover(true);
    try {
      let coverImage = '';
      try {
        const res = await uploadToCloudinary(file, {
          compress: true,
          maxDim: 1920,
          quality: 0.85,
          resourceType: 'image',
          folder: 'bazar360/users/covers'
        });
        if (res?.secure_url) coverImage = res.secure_url;
      } catch (cErr) {
        console.warn('Cloudinary cover upload failed, converting to local base64:', cErr);
      }

      if (!coverImage) {
        const reader = new FileReader();
        coverImage = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      await dbUpdateProfile(user.uid, { coverImage });
      
      const updated = { ...user, coverImage };
      if (onUpdateUser) onUpdateUser(updated);

    } catch (err: any) {
      toast.error('Failed to upload cover photo: ' + (err.message || err));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleShareProfile = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${user.displayName || 'User'}'s Profile | Bazar360`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Profile link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const creationDate = user.createdAt || (auth.currentUser?.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toISOString() : null);
  const accountCreatedFormatted = creationDate 
    ? new Date(creationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-lg space-y-0">
      
      {/* 1. Facebook-Style Cover Photo Banner */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full bg-bg-primary overflow-hidden group">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="User Cover"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-950 via-sky-950/80 to-slate-950 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-sky-500/15 via-transparent to-transparent" />
            <div className="text-center opacity-30 select-none space-y-1">
              <div className="text-2xl font-black font-display tracking-widest text-sky-400 uppercase">BAZAR360.online</div>
              <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Powered by AUTO CHOICE</div>
            </div>
          </div>
        )}

        {/* Cover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20" />

        {/* Change Cover Photo Trigger Button */}
        <label className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-[var(--color-text-header)] border border-white/20 px-3.5 py-1.5 rounded-xl shadow-lg cursor-pointer text-xs font-mono font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 z-10">
          {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" /> : <ImageIcon className="w-3.5 h-3.5 text-sky-400" />}
          <span className="hidden sm:inline">Edit Cover Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
            disabled={isUploadingCover}
          />
        </label>
      </div>

      {/* 2. Overlapping Profile Avatar & Main Identity Row */}
      <div className="px-5 sm:px-8 pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
          
          {/* Avatar Container with ProfilePhotoUpload */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <ProfilePhotoUpload
              user={user}
              onUpdateUser={onUpdateUser}
              showLabel={false}
              size="lg"
            />

            {/* Title & Roles overlay */}
            <div className="space-y-1 mb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-black font-display text-[var(--color-text-main)] tracking-tight">
                  {user.displayName || 'Bazar360 Member'}
                </h2>

                {/* Real Verification Badge ONLY */}
                {isActuallyVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-accent-main)]/15 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] text-[10px] font-mono font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-main)]" />
                    Verified
                  </span>
                )}

                {/* Role Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  user.role === 'Admin' || user.role === 'Super Admin'
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                    : user.role === 'Showroom Owner' || user.role === 'Dealer'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                }`}>
                  {displayRole}
                </span>
              </div>

              <p className="text-xs font-mono text-[var(--color-text-muted)]">
                UID: {user.uid.substring(0, 12)}...
              </p>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={onEditProfile}
              className="px-4 py-2.5 rounded-2xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-main)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={onOpenSecurity}
              className="px-4 py-2.5 rounded-2xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-main)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-[var(--color-accent-main)]" />
              <span>Security</span>
            </button>

            {(user.associatedShowroomId || user.dealerId) && setTab && (
              <button
                onClick={() => setTab('dealers')}
                className="px-4 py-2.5 rounded-2xl bg-[var(--color-accent-main)]/10 hover:bg-[var(--color-accent-main)]/20 border border-[var(--color-accent-main)]/30 text-[var(--color-accent-main)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-[var(--color-accent-main)]" />
                <span>My Showroom</span>
              </button>
            )}

            <button
              onClick={handleShareProfile}
              className="p-2.5 rounded-2xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-all cursor-pointer shadow-sm"
              title="Share Profile Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[var(--color-accent-main)]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-5 text-xs text-[var(--color-text-muted)] font-sans border-t border-[var(--color-border)] pt-4">
          {user.phoneNumber && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono">{user.phoneNumber}</span>
            </span>
          )}
          {user.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>{user.email}</span>
            </span>
          )}
          {user.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{user.city}{user.province ? `, ${user.province}` : ''}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Member since {accountCreatedFormatted}</span>
          </span>
        </div>

        {/* Biography text */}
        {user.bio && (
          <p className="text-xs text-[var(--color-text-muted)] italic font-sans max-w-2xl leading-relaxed mt-3">
            "{user.bio}"
          </p>
        )}

        {/* Dynamic Profile Completion Section */}
        <div className="mt-4">
          <ProfileCompletion user={user} onCompleteField={onEditProfile} />
        </div>

      </div>
    </div>
  );
};

