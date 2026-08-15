import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { pageTransitions } from './AnimationProvider';
import { TabbedNavigation } from './TabbedNavigation';
import { Camera, RefreshCw } from 'lucide-react';
import { LazyImage } from './LazyImage';

interface ShowroomProfileLayoutProps {
  coverUrl: string;
  logoUrl: string | ReactNode;
  dealerName: string;
  dealerLocation: string;
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  headerActions?: ReactNode;
  
  // Custom owner assets uploading extensions
  isOwner?: boolean;
  onUploadCover?: (file: File) => void;
  onUploadLogo?: (file: File) => void;
  onUploadAvatar?: (file: File) => void;
  coverUploading?: boolean;
  logoUploading?: boolean;
  avatarUploading?: boolean;
  logo?: string;
  avatarUrl?: string;
}

export function ShowroomProfileLayout({
  coverUrl,
  logoUrl,
  dealerName,
  dealerLocation,
  tabs,
  activeTab,
  onTabChange,
  children,
  headerActions,
  
  isOwner = false,
  onUploadCover,
  onUploadLogo,
  onUploadAvatar,
  coverUploading = false,
  logoUploading = false,
  avatarUploading = false,
  logo,
  avatarUrl
}: ShowroomProfileLayoutProps) {
  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto min-h-screen bg-[var(--color-bg-primary)] flex flex-col"
      variants={pageTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Immersive Cover Photo Area */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-[var(--color-bg-secondary)] overflow-hidden group/cover">
        {coverUrl ? (
          <LazyImage 
            src={coverUrl} 
            alt="Showroom Cover" 
            className="w-full h-full" 
            priority={true}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] opacity-50" />
        )}
        
        {/* Subtle vignette for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
        
        {/* Background / Cover Image Upload Trigger */}
        {isOwner && onUploadCover && (
          <label className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer backdrop-blur-md border border-white/15 z-20 transition-all shadow-lg select-none hover:scale-102">
            {coverUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
            ) : (
              <Camera className="w-4 h-4 text-orange-400" />
            )}
            <span>{coverUploading ? 'Uploading Cover...' : 'Change Background'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadCover(e.target.files[0]);
                }
              }} 
              disabled={coverUploading}
            />
          </label>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end gap-6 md:justify-between">
          <div className="flex items-end gap-6">
            
            {/* Profile Pic / Avatar Frame */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-[var(--color-bg-primary)] bg-[var(--color-bg-secondary)] overflow-hidden shrink-0 shadow-2xl z-10 flex items-center justify-center text-[var(--color-accent-main)] font-black text-4xl group/avatar">
              {avatarUrl ? (
                <LazyImage src={avatarUrl} alt={dealerName} className="w-full h-full" priority={true} />
              ) : typeof logoUrl === 'string' && logoUrl ? (
                <LazyImage src={logoUrl} alt={dealerName} className="w-full h-full" priority={true} />
              ) : (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {logoUrl || dealerName.charAt(0)}
                </motion.span>
              )}

              {/* Profile Pic Upload Trigger */}
              {isOwner && onUploadAvatar && (
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-extrabold cursor-pointer select-none text-center p-2 z-20">
                  {avatarUploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-orange-400 mb-1" />
                  ) : (
                    <Camera className="w-5 h-5 text-orange-400 mb-1" />
                  )}
                  <span>{avatarUploading ? 'Uploading...' : 'Update Avatar'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onUploadAvatar(e.target.files[0]);
                      }
                    }} 
                    disabled={avatarUploading}
                  />
                </label>
              )}
            </div>
            
            <div className="pb-2 md:pb-4 relative z-10 text-white drop-shadow-md">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">{dealerName}</h1>
                
                {/* Brand Logo Badge Display with Upload option */}
                <div className="flex items-center gap-2">
                  {logo && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] backdrop-blur-md border border-[var(--color-border-main)] p-1 shrink-0 flex items-center justify-center shadow-lg" 
                      title="Showroom Brand Logo"
                    >
                      <LazyImage src={logo} alt="Brand Logo" className="w-full h-full object-contain" priority={true} />
                    </motion.div>
                  )}

                  {isOwner && onUploadLogo && (
                    <label className="bg-black/40 hover:bg-black/60 hover:scale-102 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white p-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all select-none" title="Update Official Brand Logo">
                      {logoUploading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-orange-400" />
                      )}
                      <span className="text-[10px] font-black tracking-wider uppercase hidden sm:inline">{logoUploading ? 'Logo...' : 'Upload Logo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            onUploadLogo(e.target.files[0]);
                          }
                        }} 
                        disabled={logoUploading}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <p className="text-sm md:text-base font-mono font-bold text-gray-300 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                {dealerLocation}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            {headerActions}
          </div>
        </div>
      </div>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[var(--color-bg-primary)]/90 backdrop-blur-md shadow-sm border-b border-[var(--color-border-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabbedNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={onTabChange}
          />
        </div>
      </div>

      {/* Content Area with simple page transition */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
