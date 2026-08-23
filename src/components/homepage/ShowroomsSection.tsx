import React from 'react';
import { Dealer } from '../../types';
import { Building2, ShieldCheck, MapPin, Phone, Star, ArrowRight, ExternalLink } from 'lucide-react';

interface ShowroomsSectionProps {
  dealers: Dealer[];
  onSelectDealer: (dealerId: string) => void;
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export const ShowroomsSection: React.FC<ShowroomsSectionProps> = ({
  dealers,
  onSelectDealer,
  setTab,
  lang
}) => {
  const isUrdu = lang === 'ur';

  if (!dealers || dealers.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[var(--color-bg-secondary)] py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-accent-main)]">
              {isUrdu ? 'تصدیق شدہ ڈیلرز' : 'Trusted Dealerships'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-header)] tracking-tight mt-1">
              {isUrdu ? 'تصدیق شدہ ڈیلرز اور شورومز' : 'Explore Verified Showrooms'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-medium">
              Buy directly from verified, licensed dealerships in Peshawar, Islamabad, Lahore & nationwide.
            </p>
          </div>

          <button
            onClick={() => setTab('dealers')}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer w-fit shadow-sm hover:border-[var(--color-accent-main)]/40"
          >
            <span>View All Showrooms</span>
            <ArrowRight size={14} className="text-[var(--color-accent-main)]" />
          </button>
        </div>

        {/* Grid of Showroom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.slice(0, 6).map((dealer) => {
            const logo = dealer.logoUrl || dealer.logo || dealer.profilePictureUrl || dealer.avatarUrl;
            const cover = dealer.coverImage || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800';

            return (
              <div
                key={dealer.id}
                onClick={() => onSelectDealer(dealer.id)}
                className="group bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--color-accent-main)]/50 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Cover Image & Overlay */}
                <div className="relative h-36 bg-[var(--color-bg-secondary)] overflow-hidden">
                  <img
                    src={cover}
                    alt={dealer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Verification Badge */}
                  {(dealer.flagshipVerified || dealer.verified) && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--color-accent-main)] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldCheck size={12} />
                      <span>Verified</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 text-xs font-mono font-bold border border-white/20 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{dealer.rating || 4.9}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between relative pt-8">
                  {/* Floating Logo */}
                  <div className="absolute -top-7 left-5 w-14 h-14 rounded-2xl bg-[var(--color-bg-primary)] border-2 border-[var(--color-border)] shadow-md overflow-hidden flex items-center justify-center text-[var(--color-text-main)] font-bold text-lg">
                    {logo ? (
                      <img src={logo} alt={dealer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[var(--color-accent-main)] font-mono font-black">{dealer.avatarLetter || dealer.name.substring(0, 2)}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-header)] tracking-tight line-clamp-1 group-hover:text-[var(--color-accent-main)] transition-colors">
                      {dealer.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                      {dealer.subtitle || dealer.description || 'Authorized Auto Dealership'}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-muted)]">
                      <MapPin size={14} className="text-[var(--color-accent-main)] shrink-0" />
                      <span className="truncate">{dealer.location || 'Peshawar, Pakistan'}</span>
                    </div>
                  </div>

                  {/* Footer Stats & Button */}
                  <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="text-xs font-mono">
                      <span className="text-[var(--color-accent-main)] font-bold">{dealer.vehiclesCount || 0}</span>
                      <span className="text-[var(--color-text-muted)] ml-1">Vehicles Listed</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent-main)] group-hover:translate-x-1 transition-transform">
                      <span>Showroom</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
