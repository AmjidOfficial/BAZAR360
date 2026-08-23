import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Cloud, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../lib/dbService';
import { DualSwipingBrandLogo } from './DualSwipingBrandLogo';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../lib/cloudinaryService';
import { processImageForUpload, validateImageSize } from '../lib/imageProcessor';
import { UploadHealthIndicator } from './UploadHealthIndicator';

interface AdminBrandingManagerProps {
  currentUser?: UserProfile | null;
}

export function AdminBrandingManager({ currentUser }: AdminBrandingManagerProps) {
  const [bazar360Logo, setBazar360Logo] = useState<string>('/bazar360_logo_dark.jpg');
  const [autoChoiceLogo, setAutoChoiceLogo] = useState<string>('/auto_choice_logo_dark.jpg');
  
  const [uploadingBazar360, setUploadingBazar360] = useState<boolean>(false);
  const [uploadingAutoChoice, setUploadingAutoChoice] = useState<boolean>(false);
  const [progressBazar360, setProgressBazar360] = useState<number>(0);
  const [progressAutoChoice, setProgressAutoChoice] = useState<number>(0);

  const [bazar360Health, setBazar360Health] = useState<{
    originalSizeKB?: number;
    compressedSizeKB?: number;
    savedPercentage?: number;
    error?: string | null;
    uploadedUrl?: string | null;
  }>({});

  const [autoChoiceHealth, setAutoChoiceHealth] = useState<{
    originalSizeKB?: number;
    compressedSizeKB?: number;
    savedPercentage?: number;
    error?: string | null;
    uploadedUrl?: string | null;
  }>({});

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [updatedByEmail, setUpdatedByEmail] = useState<string | null>(null);

  // Cloudinary Cloud Name provided in system spec
  const CLOUDINARY_CLOUD_NAME = 'me634xd0';

  // Load existing Firestore branding settings on mount & listen in real-time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const docRef = doc(db, 'system', 'branding');
      unsubscribe = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.bazar360LogoUrl) setBazar360Logo(data.bazar360LogoUrl);
          if (data.autoChoiceLogoUrl) setAutoChoiceLogo(data.autoChoiceLogoUrl);
          if (data.updatedAt) setLastUpdated(data.updatedAt);
          if (data.updatedBy) setUpdatedByEmail(data.updatedBy);
        }
      });
    } catch (err) {
      console.warn('Error subscribing to branding config:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Upload image to Cloudinary securely via uploadToCloudinary & imageProcessor
  const handleCloudinaryUpload = async (file: File, brandKey: 'bazar360' | 'autochoice') => {
    // 1. Client-Side Size Validation Guard
    const validation = validateImageSize(file, 5120);
    if (!validation.valid) {
      toast.error(validation.error || 'File size exceeds maximum limit.');
      if (brandKey === 'bazar360') setBazar360Health({ error: validation.error });
      else setAutoChoiceHealth({ error: validation.error });
      return;
    }

    if (brandKey === 'bazar360') {
      setUploadingBazar360(true);
      setProgressBazar360(10);
      setBazar360Health({ originalSizeKB: validation.sizeKB, error: null, uploadedUrl: null });
    } else {
      setUploadingAutoChoice(true);
      setProgressAutoChoice(10);
      setAutoChoiceHealth({ originalSizeKB: validation.sizeKB, error: null, uploadedUrl: null });
    }

    try {
      // 2. Client-Side Canvas Compression (max 1920px Full HD, quality 0.9) using imageProcessor
      const processed = await processImageForUpload(file, {
        maxDim: 1920,
        quality: 0.9,
        maxSizeKB: 5120,
      });

      if (brandKey === 'bazar360') {
        setBazar360Health(prev => ({
          ...prev,
          compressedSizeKB: processed.compressedSizeKB,
          savedPercentage: processed.savedPercentage,
        }));
      } else {
        setAutoChoiceHealth(prev => ({
          ...prev,
          compressedSizeKB: processed.compressedSizeKB,
          savedPercentage: processed.savedPercentage,
        }));
      }

      // 3. Upload to Cloudinary using preset 'bazar360_upload'
      const result = await uploadToCloudinary(processed.compressedFile, {
        compress: false, // Already compressed by imageProcessor
        maxSizeKB: 10240,
        folder: 'bazar360_branding',
        onProgress: (p) => {
          if (brandKey === 'bazar360') setProgressBazar360(p);
          else setProgressAutoChoice(p);
        }
      });

      if (!result.secure_url || result.secure_url.startsWith('data:')) {
        throw new Error('Base64 raw image strings are strictly forbidden in Firestore. Cloudinary must return a secure HTTPS URL.');
      }

      const uploadedUrl = result.secure_url;

      // Update state
      if (brandKey === 'bazar360') {
        setBazar360Logo(uploadedUrl);
        setBazar360Health(prev => ({ ...prev, uploadedUrl }));
        toast.success(`Bazar360 logo compressed (${processed.savedPercentage}% saved) & uploaded via Cloudinary!`);
      } else {
        setAutoChoiceLogo(uploadedUrl);
        setAutoChoiceHealth(prev => ({ ...prev, uploadedUrl }));
        toast.success(`Auto Choice logo compressed (${processed.savedPercentage}% saved) & uploaded via Cloudinary!`);
      }
    } catch (err: any) {
      console.error('Failed to process image upload:', err);
      const errMsg = err.message || 'Could not process image';
      if (brandKey === 'bazar360') setBazar360Health(prev => ({ ...prev, error: errMsg }));
      else setAutoChoiceHealth(prev => ({ ...prev, error: errMsg }));
      toast.error(`Upload error: ${errMsg}`);
    } finally {
      setUploadingBazar360(false);
      setUploadingAutoChoice(false);
    }
  };

  // Save branding changes to Firestore
  const handleSaveToFirestore = async () => {
    // Guard against base64 strings
    if (bazar360Logo.startsWith('data:') || autoChoiceLogo.startsWith('data:')) {
      toast.error('Cannot save base64 data URLs to Firestore. Please re-upload logos through Cloudinary.');
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, 'system', 'branding');
      const now = new Date().toISOString();
      
      // Lean Metadata-Only Document Schema (under 2KB payload)
      await setDoc(docRef, {
        logoUrl: bazar360Logo,
        bazar360LogoUrl: bazar360Logo,
        autoChoiceLogoUrl: autoChoiceLogo,
        publicId: 'bazar360_branding/system_logo',
        updatedAt: now,
        updatedBy: currentUser?.email || currentUser?.uid || 'admin_uid',
        cloudName: CLOUDINARY_CLOUD_NAME
      }, { merge: true });

      setLastUpdated(now);
      setUpdatedByEmail(currentUser?.email || 'Admin');
      toast.success('Branding logos published to Firestore live across all sessions!');
    } catch (err: any) {
      console.error('Error saving branding to Firestore:', err);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to static fallback logos
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset branding logos back to default static assets?')) return;
    
    const defaultB360 = '/bazar360_logo_dark.jpg';
    const defaultAC = '/auto_choice_logo_dark.jpg';

    setBazar360Logo(defaultB360);
    setAutoChoiceLogo(defaultAC);

    try {
      const docRef = doc(db, 'system', 'branding');
      await setDoc(docRef, {
        bazar360LogoUrl: defaultB360,
        autoChoiceLogoUrl: defaultAC,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'Admin'
      }, { merge: true });
      toast.success('Branding logos reset to system defaults!');
    } catch (err: any) {
      toast.error(`Reset error: ${err.message}`);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-main rounded-3xl p-6 md:p-8 space-y-8 text-left relative overflow-hidden shadow-2xl">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-main pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
              <Cloud size={20} />
            </span>
            <h3 className="text-xl font-black text-[var(--color-text-header)] uppercase tracking-wide">
              Cloudinary Branding & Logo Management Deck
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Upload, replace, and synchronize high-resolution brand assets directly across all sessions.
          </p>
        </div>

        {/* Security / Admin Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-accent-main)]/10 border border-[var(--color-accent-main)]/20 text-[var(--color-accent-main)] text-xs font-mono font-bold self-start md:self-auto">
          <ShieldCheck size={16} />
          <span>ADMIN ACCESS VERIFIED</span>
        </div>
      </div>

      {/* Live Interactive Preview Deck */}
      <div className="bg-bg-primary/80 border border-border-main rounded-2xl p-5 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-1.5">
            <Sparkles size={14} /> Live Interactive Preview
          </span>
          <span className="text-[10px] text-text-muted font-mono">
            Hover & Click to test scale & swiping effects
          </span>
        </div>

        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-border-main flex items-center justify-center">
          <DualSwipingBrandLogo showText={true} />
        </div>
      </div>

      {/* Logo Upload Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Card 1: Bazar360.online Logo */}
        <div className="bg-bg-primary/60 border border-border-main rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[var(--color-text-header)] uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Bazar360.online Logo
              </h4>
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                Main Marketplace
              </span>
            </div>

            {/* Current Logo Display */}
            <div className="relative w-full h-36 rounded-xl bg-bg-secondary border border-border-main flex items-center justify-center p-4 overflow-hidden group">
              <img
                src={bazar360Logo}
                alt="Bazar360 Logo"
                className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingBazar360}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCloudinaryUpload(file, 'bazar360');
                }}
              />
              <div className="w-full py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                {uploadingBazar360 ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-blue-400" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Replace Bazar360 Logo</span>
                  </>
                )}
              </div>
            </label>

            {/* Upload Health Status Indicator */}
            <UploadHealthIndicator
              originalSizeKB={bazar360Health.originalSizeKB}
              compressedSizeKB={bazar360Health.compressedSizeKB}
              savedPercentage={bazar360Health.savedPercentage}
              progress={progressBazar360}
              isUploading={uploadingBazar360}
              error={bazar360Health.error}
              uploadedUrl={bazar360Health.uploadedUrl}
              presetName="bazar360_upload"
            />
          </div>
        </div>

        {/* Card 2: Auto Choice Logo */}
        <div className="bg-bg-primary/60 border border-border-main rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[var(--color-text-header)] uppercase tracking-wider flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                Auto Choice Logo
              </h4>
              <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 font-bold">
                Showroom Hub
              </span>
            </div>

            {/* Current Logo Display */}
            <div className="relative w-full h-36 rounded-xl bg-bg-secondary border border-border-main flex items-center justify-center p-4 overflow-hidden group">
              <img
                src={autoChoiceLogo}
                alt="Auto Choice Logo"
                className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingAutoChoice}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCloudinaryUpload(file, 'autochoice');
                }}
              />
              <div className="w-full py-3 px-4 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 hover:text-[var(--color-text-header)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95">
                {uploadingAutoChoice ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-orange-400" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Replace Auto Choice Logo</span>
                  </>
                )}
              </div>
            </label>

            {/* Upload Health Status Indicator */}
            <UploadHealthIndicator
              originalSizeKB={autoChoiceHealth.originalSizeKB}
              compressedSizeKB={autoChoiceHealth.compressedSizeKB}
              savedPercentage={autoChoiceHealth.savedPercentage}
              progress={progressAutoChoice}
              isUploading={uploadingAutoChoice}
              error={autoChoiceHealth.error}
              uploadedUrl={autoChoiceHealth.uploadedUrl}
              presetName="bazar360_upload"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-4 border-t border-border-main flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="text-[11px] font-mono text-text-muted space-y-0.5">
          {lastUpdated && (
            <p>Last Sync: <span className="text-text-main">{new Date(lastUpdated).toLocaleString()}</span></p>
          )}
          {updatedByEmail && (
            <p>Updated By: <span className="text-orange-400 font-bold">{updatedByEmail}</span></p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-bg-tertiary hover:bg-slate-700 text-text-muted font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Publish Branding Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
