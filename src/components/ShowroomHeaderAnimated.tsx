'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, Phone, Clock, Star, Building2, MessageCircle, QrCode, ImageIcon, CheckCircle2, Share2, Calendar } from 'lucide-react';

export interface ShowroomHeaderData {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  whatsapp?: string;
  timings?: string;
  logo?: string;
  logoUrl?: string;
  rating?: number | string;
  verified?: boolean;
  coverImage?: string;
  subtitle?: string;
  description?: string;
  vehiclesCount?: number;
  createdAt?: string;
}

interface ShowroomHeaderAnimatedProps {
  showroom: ShowroomHeaderData;
  onOpenMediaManager?: () => void;
  onOpenQrModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function ShowroomHeaderAnimated({ showroom, onOpenMediaManager, onOpenQrModal, activeTab = 'inventory', setActiveTab }: ShowroomHeaderAnimatedProps) {
  const logo = showroom.logoUrl || showroom.logo;
  const cover = showroom.coverImage || 'https://images.unsplash.com/photo-1562575214-da9fcf59b907?auto=format&fit=crop&w=1600&q=80';
  const phone = showroom.phone || '0315-9085086';
  const rawWhatsApp = (showroom.whatsapp || showroom.phone || '03159085086').replace(/[^\d]/g, '');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${showroom.name} - Bazar360 Showroom`,
        text: `Check out ${showroom.name} on Bazar360 Auto Choice!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Showroom link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white dark:bg-bg-primary text-slate-900 dark:text-[var(--color-text-header)] border-b border-slate-200 dark:border-border-main transition-colors duration-300">
      {/* 1. Facebook-Style Cover Photo Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 bg-bg-secondary overflow-hidden group">
        <img 
          src={cover} 
          alt={`${showroom.name} Cover`} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="eager"
        />
        {/* Subtle Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        
        {/* Cover Action Button (if media manager enabled) */}
        {onOpenMediaManager && (
          <button
            type="button"
            onClick={onOpenMediaManager}
            className="absolute top-4 right-4 bg-bg-secondary/80 hover:bg-bg-secondary text-[var(--color-text-header)] backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg cursor-pointer transition-all"
          >
            <ImageIcon size={14} className="text-orange-400" />
            <span>Edit Cover</span>
          </button>
        )}
      </div>

      {/* 2. Showroom Identity & Quick Action Console */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-16 sm:-mt-20 md:-mt-22 mb-4">
          
          {/* Logo & Showroom Title Profile Group */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Showroom Logo / Avatar overlapping cover */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl bg-white dark:bg-bg-secondary border-4 border-white dark:border-slate-950 p-2 shrink-0 flex items-center justify-center shadow-xl relative group/logo">
              {logo ? (
                <img
                  src={logo}
                  alt={showroom.name}
                  className="w-full h-full object-contain rounded-2xl"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-14 h-14 text-orange-500" />
              )}
              
              {/* Verified Shield Badge on Avatar */}
              <div className="absolute -bottom-1 -right-1 bg-[var(--color-accent-main)] text-[var(--color-text-header)] p-1.5 rounded-full ring-4 ring-white dark:ring-slate-950 shadow-md" title="Verified Showroom">
                <CheckCircle2 size={16} />
              </div>
            </div>

            {/* Showroom Metadata Text */}
            <div className="space-y-1 pb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                  <ShieldCheck size={12} /> Verified Showroom
                </span>
                {showroom.rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-bg-tertiary text-slate-700 dark:text-text-muted text-[10px] font-mono font-bold rounded-full border border-slate-200 dark:border-border-main">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {showroom.rating}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-[var(--color-text-header)]">
                {showroom.name}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-text-muted dark:text-text-muted text-xs font-medium flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-orange-500 shrink-0" />
                  {showroom.location || 'Peshawar, Pakistan'}
                </span>
                {showroom.subtitle && (
                  <span>• {showroom.subtitle}</span>
                )}
                <span className="flex items-center gap-1 text-slate-600 dark:text-text-muted font-mono font-bold">
                  <Clock size={13} className="text-text-muted" />
                  {showroom.timings || '9:00 AM - 9:00 PM'}
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-text-muted font-mono font-bold">
                  <Calendar size={13} className="text-orange-500 shrink-0" />
                  Showroom created {showroom.createdAt ? new Date(showroom.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 13, 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Console (Facebook-Style Profile Action Row) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center sm:justify-end shrink-0 pt-2 md:pt-0">
            <a
              href={`https://wa.me/${rawWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-[var(--color-accent-main)] text-[var(--color-text-header)] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${phone}`}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-[var(--color-text-header)] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Phone size={15} />
              <span>Call</span>
            </a>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-bg-tertiary dark:hover:bg-slate-700 text-slate-700 dark:text-text-main rounded-xl transition-all border border-slate-200 dark:border-border-main cursor-pointer active:scale-95"
              title="Share Showroom"
            >
              <Share2 size={16} />
            </button>

            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-bg-tertiary dark:hover:bg-slate-700 text-slate-700 dark:text-text-main rounded-xl transition-all border border-slate-200 dark:border-border-main cursor-pointer active:scale-95"
                title="Showroom QR Code"
              >
                <QrCode size={16} className="text-orange-500" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Facebook Profile Navigation Tabs */}
        {setActiveTab && (
          <div className="flex items-center gap-2 border-t border-slate-200 dark:border-border-main pt-3 mt-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                  : 'text-slate-600 dark:text-text-muted hover:bg-slate-100 dark:hover:bg-bg-tertiary'
              }`}
            >
              Vehicles Fleet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                  : 'text-slate-600 dark:text-text-muted hover:bg-slate-100 dark:hover:bg-bg-tertiary'
              }`}
            >
              About & Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

