import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { dbUpdateProfile, UserProfile } from '../../lib/dbService';
import { uploadToCloudinary, compressImage, fileToBase64 } from '../../lib/cloudinaryService';
import { Camera, Upload, User, Loader2, Check, AlertCircle, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface ProfilePhotoUploadProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  maxSizeMB?: number; // Default 5MB
  allowedTypes?: string[]; // Default image types
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  user,
  onUpdateUser,
  size = 'lg',
  showLabel = true,
  className = '',
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/bmp']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = previewUrl || user.photoURL || user.profilePhoto || user.logoUrl;

  // Size styling helper
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-16 h-16 rounded-xl', icon: 'w-8 h-8', btn: 'p-1.5' };
      case 'md':
        return { container: 'w-24 h-24 rounded-2xl', icon: 'w-12 h-12', btn: 'p-2' };
      case 'xl':
        return { container: 'w-40 h-40 rounded-3xl', icon: 'w-20 h-20', btn: 'p-3' };
      case 'lg':
      default:
        return { container: 'w-32 h-32 sm:w-36 sm:h-36 rounded-3xl', icon: 'w-16 h-16', btn: 'p-2.5' };
    }
  };

  const sizeStyle = getSizeClasses();

  // Validate file size and type
  const validateFile = (file: File): boolean => {
    // 1. File Type Validation
    const isAllowedType = allowedTypes.some(type => 
      file.type.toLowerCase() === type.toLowerCase() || 
      (type === 'image/*' && file.type.startsWith('image/'))
    );

    if (!isAllowedType && !file.type.startsWith('image/')) {
      toast.error(`Invalid file type (${file.type || 'unknown'}). Please upload an image (JPEG, PNG, WebP, GIF, HEIC).`);
      return false;
    }

    // 2. File Size Validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB} MB) exceeds maximum allowed limit of ${maxSizeMB} MB.`);
      return false;
    }

    return true;
  };

  // Process File Upload via Firebase Storage (with Cloudinary Fallback)
  const processUpload = async (file: File) => {
    if (!validateFile(file)) return;

    // Show temporary local preview immediately
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    setIsUploading(true);
    setUploadProgress(5);

    try {
      let secureDownloadUrl = '';

      // Primary Attempt: Firebase Storage
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storagePath = `profile-photos/${user.uid}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storageRef = ref(storage, storagePath);

        const metadata = {
          contentType: file.type || 'image/jpeg'
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        secureDownloadUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (error) => {
              console.warn('[Firebase Storage] Upload failed or permissions restricted, attempting Cloudinary fallback:', error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (err) {
                reject(err);
              }
            }
          );
        });

      } catch (firebaseErr) {
        console.warn('[ProfilePhotoUpload] Firebase Storage direct upload failed, attempting fallback Cloudinary service...', firebaseErr);
        
        // Secondary Fallback: Cloudinary Service with auto proxy fallback
        try {
          const res = await uploadToCloudinary(file, {
            compress: true,
            maxDim: 1024,
            quality: 0.85,
            folder: `bazar360/users/${user.uid}/profile`
          });

          if (res?.secure_url) {
            secureDownloadUrl = res.secure_url;
          } else {
            throw new Error('Unable to upload image. Storage service did not return a valid URL.');
          }
        } catch (cloudinaryErr: any) {
          console.warn('[ProfilePhotoUpload] Direct Cloudinary & server proxy upload failed, converting image to optimized base64 fallback:', cloudinaryErr);
          
          // Tertiary Resilient Fallback: Compress image locally to lightweight 400px JPEG base64 string
          const compressedFile = await compressImage(file, 400, 0.8);
          const base64Data = await fileToBase64(compressedFile);
          secureDownloadUrl = base64Data;
        }
      }

      setUploadProgress(100);
      URL.revokeObjectURL(tempUrl);
      setPreviewUrl(secureDownloadUrl);

      // Update Firestore Profile document
      await dbUpdateProfile(user.uid, {
        photoURL: secureDownloadUrl,
        profilePhoto: secureDownloadUrl,
        logoUrl: secureDownloadUrl,
        updatedAt: new Date().toISOString()
      });

      // Local state sync
      const updatedUser: UserProfile = {
        ...user,
        photoURL: secureDownloadUrl,
        profilePhoto: secureDownloadUrl,
        logoUrl: secureDownloadUrl
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

    } catch (err: any) {
      console.error('[ProfilePhotoUpload] Final Error:', err);
      toast.error('Failed to upload photo: ' + (err.message || 'Unknown error'));
      setPreviewUrl(null); // Reset preview on failure
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`flex flex-col items-center sm:items-start gap-3 ${className}`}>
      <div 
        className="relative group shrink-0"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Main Avatar Canvas */}
        <div 
          className={`${sizeStyle.container} overflow-hidden bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-secondary)] shadow-xl flex items-center justify-center relative transition-all duration-300 ${
            dragActive ? 'border-sky-500 scale-105 ring-4 ring-sky-500/20' : 'group-hover:border-sky-500/50'
          }`}
        >
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={user.displayName || 'Profile'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className={`${sizeStyle.icon} text-[var(--color-text-muted)]`} />
          )}

          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-sky-400 z-20">
              <Loader2 className="w-8 h-8 animate-spin mb-1 text-sky-400" />
              <span className="text-[10px] font-mono font-bold tracking-wider">{uploadProgress}%</span>
              <div className="w-full bg-bg-tertiary h-1.5 rounded-full mt-2 overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-[var(--color-accent-main)] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Drag Overlay Hint */}
          {dragActive && !isUploading && (
            <div className="absolute inset-0 bg-sky-500/90 text-slate-950 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 font-sans font-bold text-center text-xs">
              <Upload className="w-6 h-6 mb-1" />
              Drop image here
            </div>
          )}
        </div>

        {/* Action Buttons: Gallery File + Camera Capture */}
        {!isUploading && (
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1 z-10">
            {/* Gallery Upload Input */}
            <label 
              title="Upload photo from device"
              className={`bg-sky-500 hover:bg-sky-400 text-slate-950 ${sizeStyle.btn} rounded-2xl shadow-xl cursor-pointer transition-all transform hover:scale-110 active:scale-95 border-2 border-[var(--color-bg-secondary)] flex items-center justify-center`}
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Mobile Camera Direct Capture Input */}
            <label 
              title="Take photo with camera"
              className={`hidden sm:flex bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-main)] text-slate-950 ${sizeStyle.btn} rounded-2xl shadow-xl cursor-pointer transition-all transform hover:scale-110 active:scale-95 border-2 border-[var(--color-bg-secondary)] items-center justify-center`}
            >
              <ImageIcon className="w-4 h-4 stroke-[2.5]" />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Optional Label / Instructions */}
      {showLabel && (
        <div className="text-center sm:text-left space-y-0.5">
          <p className="text-xs font-bold text-[var(--color-text-main)] flex items-center justify-center sm:justify-start gap-1">
            <span>Profile Photo</span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">(Max {maxSizeMB}MB)</span>
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            JPEG, PNG, WebP or HEIC formats supported
          </p>
        </div>
      )}
    </div>
  );
};
