import React from 'react';
import { ShieldCheck, PlusCircle } from 'lucide-react';
import { CarListing } from '../../types';
import { UnifiedSearch } from './UnifiedSearch';
import { TaglineDisplay } from './TaglineDisplay';

interface HeroPremiumProps {
  lang: 'en' | 'ur';
  listings: CarListing[];
  setTab: (tab: string) => void;
  onSelectListing: (car: CarListing) => void;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

export function HeroPremium({ 
  lang, 
  listings, 
  setTab, 
  onSelectListing,
  setSelectedCategory,
  setSearchQuery
}: HeroPremiumProps) {
  const isUrdu = lang === 'ur';

  return (
    <section 
      className="relative w-full h-[600px] md:h-[700px] bg-[var(--color-bg-primary)] text-white overflow-hidden flex flex-col justify-center" 
      id="clean-room-hero-section"
    >
      {/* 1. Background Image with precise dark overlay gradient for maximum text readability */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Vehicle Hero" 
          className="w-full h-full object-cover opacity-60 object-center transition-transform duration-[20s] hover:scale-[1.05]"
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
          width={1920}
          height={700}
        />
        {/* Luxury gradient overlay: deep charcoal to transparent */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-[var(--color-bg-primary)]" />
      </div>

      {/* 2. Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8 pt-12">
        
        {/* Core Slogan Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm border border-[var(--color-border)] text-slate-400 text-[10px] font-mono font-black uppercase tracking-widest mx-auto">
          <ShieldCheck size={12} className="text-[#FF6B00]" />
          <span>{isUrdu ? 'پشاور کی سب سے بڑی آٹو مارکیٹ' : 'Peshawar’s Trusted Car Portal'}</span>
        </div>

        {/* Main Display Headlines - Tagline Rotation */}
        <div className="max-w-4xl mx-auto">
            <TaglineDisplay />
        </div>

        {/* 3. Floating High-Precision Native Search Bar Container - Glassmorphism */}
        <div className="w-full max-w-3xl mx-auto pt-4" id="floating-search-bar-wrapper">
          <div className="bg-[var(--color-bg-secondary)]/30 backdrop-blur-md border border-[var(--color-border)] p-2 rounded-xl shadow-lg">
              <UnifiedSearch 
                lang={lang} 
                setTab={setTab}
                setSelectedCategory={setSelectedCategory}
                setSearchQuery={setSearchQuery}
              />
          </div>
        </div>

        {/* 4. Secondary Conversion Banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6 text-xs">
          <button 
            onClick={() => setTab('sell')}
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05B00] text-white font-sans font-bold uppercase px-6 py-3 rounded-md transition-all cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <PlusCircle size={16} />
            <span>{isUrdu ? 'مفت اشتہار لگائیں' : 'Post Your Ad'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
