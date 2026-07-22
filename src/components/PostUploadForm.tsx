import React, { useState, useRef } from 'react';
import { Image, Video, X, Loader2, Sparkles, Send, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToCloudinary } from '../lib/cloudinaryService';
import { createSocialPost } from '../services/api';
import { toast } from 'sonner';

interface PostUploadFormProps {
  currentUser: any;
  idToken: string | null;
  onPostCreated: (newPost: any) => void;
  onLoginClick?: () => void;
}

export default function PostUploadForm({
  currentUser,
  idToken,
  onPostCreated,
  onLoginClick
}: PostUploadFormProps) {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('IMAGE' | 'VIDEO')[]>([]);
  
  // Computed values for single item backward-compatibility
  const mediaUrl = mediaUrls[0] || null;
  const mediaType = mediaUrls.length > 0 ? (mediaTypes[0] || 'IMAGE') : 'TEXT';
  
  const [isOfficialAnnouncement, setIsOfficialAnnouncement] = useState(false);

  // Upload progress indicators
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Role details
  const isShowroomOwner = currentUser?.role === 'Showroom Owner' || currentUser?.role === 'Dealer';
  const showroomId = currentUser?.associatedShowroomId;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!idToken) {
      toast.error('Please sign in to upload media.');
      if (onLoginClick) onLoginClick();
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        await processFile(files[i]);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!idToken) {
      toast.error('Please sign in to upload media.');
      if (onLoginClick) onLoginClick();
      return;
    }
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < Math.min(files.length, 6); i++) {
        await processFile(files[i]);
      }
    }
  };

  const processFile = async (file: File) => {
    // Determine type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      toast.error('Only images and videos are supported for community updates.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds the 25MB safety threshold.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: (p) => setUploadProgress(p),
        compress: true,
        resourceType: isVideo ? 'video' : 'image'
      });

      if (result && result.secure_url) {
        setMediaUrls((prev) => [...prev, result.secure_url]);
        setMediaTypes((prev) => [...prev, isVideo ? 'VIDEO' : 'IMAGE']);
        toast.success(`${isVideo ? 'Video' : 'Image'} uploaded & optimized successfully.`);
      } else {
        toast.error('Failed to parse upload server payload.');
      }
    } catch (err: any) {
      console.error('Cloudinary upload failure:', err);
      toast.error(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
    setMediaTypes((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;

    if (!idToken) {
      toast.error('Please sign in to publish community posts.');
      if (onLoginClick) onLoginClick();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        content,
        type: mediaType as 'TEXT' | 'IMAGE' | 'VIDEO',
        mediaUrl: mediaUrl || undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        showroomId: (isOfficialAnnouncement && showroomId) ? showroomId : undefined
      };

      const res = await createSocialPost(payload, idToken);
      if (res.success && res.post) {
        if (res.post.approved === false) {
          toast.success('Post submitted successfully! It is now pending moderation by administrators.');
        } else {
          toast.success('Your community post has been published!');
        }
        setContent('');
        setMediaUrls([]);
        setMediaTypes([]);
        setIsOfficialAnnouncement(false);
        onPostCreated(res.post);
      } else {
        toast.error(res.error || 'Failed to submit post.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error publishing post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="bg-[var(--color-bg-secondary)] border border-white/5 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] space-y-4"
      id="post-upload-form-container"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#FF6B00]" />
        <h3 className="text-sm font-black uppercase text-white tracking-widest font-display text-left">
          Share a Community Update
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="community-post-form">
        {/* Main Text Input Area */}
        <div className="relative">
          <textarea
            id="post-content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isShowroomOwner
                ? "Announce new stock arrivals, promotions, or showroom milestones..."
                : "Ask for opinions on a vehicle, share track days, or post auto news..."
            }
            className="w-full min-h-[90px] bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] duration-200 resize-none font-sans"
            disabled={submitting}
          />
        </div>

        {/* Dynamic Showroom Owner Announcement Feature */}
        {isShowroomOwner && showroomId && (
          <div
            id="official-announcement-toggle"
            className="flex items-center gap-3 p-3 rounded-2xl bg-[#38BDF8]/5 border border-[#38BDF8]/15 text-[#38BDF8] select-none"
          >
            <input
              id="announcement-checkbox"
              type="checkbox"
              checked={isOfficialAnnouncement}
              onChange={(e) => setIsOfficialAnnouncement(e.target.checked)}
              className="w-4 h-4 text-[#FF6B00] bg-slate-900 border-white/10 rounded focus:ring-0 focus:outline-none cursor-pointer"
            />
            <label htmlFor="announcement-checkbox" className="flex items-center gap-1.5 text-[10px] md:text-xs font-mono font-black uppercase cursor-pointer tracking-wider">
              <Store size={14} />
              Publish as Official Showroom Floor Announcement
            </label>
          </div>
        )}

        {/* Media Upload Container (Drag-and-Drop) */}
        <AnimatePresence>
          {uploading ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/10 bg-slate-900/40 text-center space-y-3"
              id="upload-progress-container"
            >
              <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Optimizing & Compressing Media...
                </p>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500">{uploadProgress}% Complete</span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 w-full">
              {/* Media gallery grid for uploaded multiple files */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="uploaded-media-gallery">
                  {mediaUrls.map((url, index) => {
                    const isVideo = mediaTypes[index] === 'VIDEO';
                    return (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-900 aspect-video group shadow-lg"
                      >
                        {isVideo ? (
                          <video src={url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img
                            src={url}
                            alt={`Uploaded attachment ${index + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 hover:bg-red-500 active:scale-90 text-white backdrop-blur-md transition-all cursor-pointer border border-white/10"
                          title="Remove attachment"
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Drag & Drop Upload Zone (only show if under limit of 6 files) */}
              {mediaUrls.length < 6 && (
                <div
                  ref={dragRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center space-y-1.5 ${
                    isDragging
                      ? 'border-orange-500 bg-orange-500/5 scale-[1.01]'
                      : 'border-white/5 hover:border-white/15 bg-slate-900/25 hover:bg-slate-900/40'
                  }`}
                  id="media-dropzone"
                >
                  <input
                    id="post-media-file-input"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                  <div className="flex gap-2 text-slate-400">
                    <Image size={18} className="text-[#FF6B00]" />
                    <Video size={18} className="text-[#38BDF8]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
                      {mediaUrls.length > 0 ? "Add More Media" : "Drag & Drop Auto Media"}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                      Supports up to 6 Photos or Clips (max 25MB each)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Action Panel Bottom */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="text-[10px] text-slate-500 font-mono">
            {!idToken ? '⚠️ Log in required to publish' : '⚡ Auto-optimized via Cloudinary'}
          </div>

          <div className="flex gap-2">
            {mediaUrls.length < 6 && !uploading && (
              <button
                id="post-attachment-trigger-btn"
                type="button"
                onClick={triggerFileInput}
                className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/15 hover:bg-slate-800 text-slate-300 active:scale-95 duration-100 text-[11px] font-mono font-black uppercase flex items-center gap-1.5 cursor-pointer"
                title="Add photo or video"
              >
                <Image size={13} className="text-orange-500" />
                <span>Attach</span>
              </button>
            )}

            <button
              id="submit-post-btn"
              type="submit"
              disabled={(!content.trim() && mediaUrls.length === 0) || submitting || uploading}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-slate-950 font-mono font-black text-[11px] uppercase tracking-wider disabled:opacity-40 disabled:scale-100 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/10"
              title="Publish community post"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin text-slate-950" />
                  <span>Publishing</span>
                </>
              ) : (
                <>
                  <Send size={13} className="text-slate-950" />
                  <span>Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
