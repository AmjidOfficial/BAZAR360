import React, { useState } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Dealer } from '../../types';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../../lib/cloudinaryService';
import { processImageForUpload, validateImageSize } from '../../lib/imageProcessor';
import { UploadHealthIndicator } from '../UploadHealthIndicator';

interface LogoManagerProps {
  dealer: Dealer;
  onLogoUpdated: (newLogoUrl: string) => void;
}

export function LogoManager({ dealer, onLogoUpdated }: LogoManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string>(dealer.logo || dealer.logoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  // Upload Health Tracking State
  const [healthState, setHealthState] = useState<{
    originalSizeKB?: number;
    compressedSizeKB?: number;
    savedPercentage?: number;
    error?: string | null;
    uploadedUrl?: string | null;
  }>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict Client-Side Size Validation Guard (blocking > 500KB before processing)
    const validation = validateImageSize(file, 500);
    if (!validation.valid) {
      toast.error(validation.error || 'File size exceeds 500KB limit.');
      setHealthState({ error: validation.error });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setHealthState({
      originalSizeKB: validation.sizeKB,
      error: null,
      uploadedUrl: null
    });

    try {
      // 2. Client-Side Canvas Compression (max 1920px Full HD, quality 0.9) via imageProcessor
      const processed = await processImageForUpload(file, {
        maxDim: 1920,
        quality: 0.9,
        maxSizeKB: 5120,
      });

      setHealthState(prev => ({
        ...prev,
        compressedSizeKB: processed.compressedSizeKB,
        savedPercentage: processed.savedPercentage,
      }));

      // 3. Upload compressed file to Cloudinary using preset 'bazar360_upload'
      const res = await uploadToCloudinary(processed.compressedFile, {
        compress: false, // Already compressed by imageProcessor canvas
        maxSizeKB: 10240,
        folder: 'bazar360_showroom_logos',
        onProgress: (p) => setUploadProgress(p),
      });

      if (!res.secure_url || res.secure_url.startsWith('data:')) {
        throw new Error('Cloudinary upload did not return a valid secure HTTPS URL. Base64 strings are forbidden in Firestore.');
      }

      const uploadedUrl = res.secure_url;
      setLogoUrl(uploadedUrl);
      setHealthState(prev => ({
        ...prev,
        uploadedUrl,
      }));

      toast.success(`Logo compressed (${processed.savedPercentage}% saved) & uploaded via Cloudinary!`);

      // 4. Auto-save lightweight metadata string to Firestore
      await saveLogoToFirestore(uploadedUrl, res.public_id);
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      const errMsg = err.message || 'Upload error';
      setHealthState(prev => ({ ...prev, error: errMsg }));
      toast.error(`Failed to upload logo to Cloudinary: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const saveLogoToFirestore = async (url: string, publicId = '') => {
    if (url.startsWith('data:')) {
      toast.error('Base64 image strings cannot be stored in Firestore documents.');
      return;
    }

    setIsSaving(true);
    try {
      if (!dealer.id) {
        throw new Error('Dealer ID missing');
      }
      const dealerRef = doc(db, 'dealers', dealer.id);
      
      // Lean Schema Update (under 2KB payload)
      const logoPayload = {
        logoUrl: url,
        logo: url,
        publicId: publicId || 'bazar360_showroom_logos/dealer_logo',
        updatedAt: new Date().toISOString(),
        updatedBy: dealer.ownerUid || dealer.id
      };

      await updateDoc(dealerRef, logoPayload);

      onLogoUpdated(url);
      toast.success('Showroom logo updated in Firestore!');
    } catch (err: any) {
      console.error('Error saving logo to Firestore:', err);
      // Try setDoc with merge if document doesn't exist
      try {
        if (dealer.id) {
          const dealerRef = doc(db, 'dealers', dealer.id);
          await setDoc(dealerRef, {
            logoUrl: url,
            logo: url,
            publicId: publicId || '',
            updatedAt: new Date().toISOString(),
            updatedBy: dealer.ownerUid || dealer.id
          }, { merge: true });
          onLogoUpdated(url);
          toast.success('Showroom logo saved to Firestore!');
        }
      } catch (innerErr: any) {
        toast.error(`Could not persist logo to Firestore: ${innerErr.message || err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm('Are you sure you want to delete your showroom logo?')) return;

    setIsSaving(true);
    try {
      if (dealer.id) {
        const dealerRef = doc(db, 'dealers', dealer.id);
        await updateDoc(dealerRef, {
          logo: '',
          updatedAt: new Date().toISOString()
        });
      }
      setLogoUrl('');
      onLogoUpdated('');
      toast.success('Showroom logo deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting logo:', err);
      toast.error('Failed to delete logo from database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black uppercase text-[var(--color-text-main)] tracking-wider">Showroom Logo Manager</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full font-bold">Cloudinary bazar360_upload</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Preview Container */}
        <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center bg-[var(--color-bg-primary)] overflow-hidden shadow-inner group">
          {logoUrl ? (
            <img src={logoUrl} alt={dealer.name} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="text-center p-2">
              <ImageIcon className="w-6 h-6 text-[var(--color-text-muted)] mx-auto mb-1" />
              <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase">No Logo</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[var(--color-text-header)] text-[10px] font-bold">
              Uploading...
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2 w-full">
          <p className="text-xs text-[var(--color-text-muted)]">
            Upload your official showroom emblem or brand logo. Optimized instantly through Cloudinary <strong>bazar360_upload</strong> preset for live multi-tenant storefront synchronization.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-[var(--color-text-header)] rounded-lg text-xs font-bold transition shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload New Logo'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading || isSaving} className="hidden" />
            </label>

            {logoUrl && (
              <button
                onClick={handleDeleteLogo}
                disabled={uploading || isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-500/30 rounded-lg text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Logo</span>
              </button>
            )}
          </div>

          {/* Upload Health Indicator */}
          <UploadHealthIndicator
            originalSizeKB={healthState.originalSizeKB}
            compressedSizeKB={healthState.compressedSizeKB}
            savedPercentage={healthState.savedPercentage}
            progress={uploadProgress}
            isUploading={uploading}
            error={healthState.error}
            uploadedUrl={healthState.uploadedUrl}
            presetName="bazar360_upload"
          />
        </div>
      </div>
    </div>
  );
}
