import React from 'react';
import { Dealer } from '../../types';
import { Building2, ShieldCheck, MapPin, Star, ArrowRight, ExternalLink } from 'lucide-react';

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
    <section className="w-full bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--color-border-main)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-accent-main)]">
              {isUrdu ? 'تصدیق شدہ ڈیلرز' : 'Verified Showroom Partners'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-header)] tracking-tight mt-1">
              {isUrdu ? 'تصدیق شدہ ڈیلرز اور شورومز' : 'Explore Certified Dealerships'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              {isUrdu
                ? 'پشاور، اسلام آباد، لاہور اور پورے پاکستان سے تصدیق شدہ شورومز سے براہ راست گاڑیاں خریدیں۔'
                : 'Browse verified inventory directly from certified physical dealerships across Pakistan.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTab('dealers')}
            className="btn-luxury-secondary text-xs shrink-0 w-fit"
          >
            <span>View All Showrooms</span>
            <ArrowRight size={14} className="text-[var(--color-accent-main)]" />
          </button>
        </div>

        {/* Grid of Showroom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.slice(0, 6).map((dealer) => {
            const logo = dealer.logoUrl || dealer.logo || dealer.profilePictureUrl || dealer.avatarUrl;
            const cover = dealer.coverImage || '';

            return (
              <div
                key={dealer.id}
                onClick={() => onSelectDealer(dealer.id)}
                className="group bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--color-accent-main)]/50 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Cover Image & Overlay */}
                <div className="relative h-36 bg-[var(--color-bg-tertiary)] overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={dealer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">
                      <Building2 size={32} className="opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090D14]/80 via-transparent to-black/20" />

                  {/* Verification Badge */}
                  {(dealer.flagshipVerified || dealer.verified) && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--color-accent-main)] text-[#090D14] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldCheck size={12} />
                      <span>Verified</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[var(--color-accent-main)] text-xs font-mono font-bold border border-white/20 flex items-center gap-1">
                    <Star size={12} className="fill-[var(--color-accent-main)] text-[var(--color-accent-main)]" />
                    <span>{dealer.rating || 4.9}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between relative pt-8">
                  {/* Floating Logo */}
                  <div className="absolute -top-7 left-5 w-14 h-14 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border-main)] shadow-md overflow-hidden flex items-center justify-center text-[var(--color-text-main)] font-bold text-lg">
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
                  <div className="mt-5 pt-3 border-t border-[var(--color-border-main)] flex items-center justify-between">
                    <div className="text-xs font-mono">
                      <span className="text-[var(--color-accent-main)] font-bold">{dealer.vehiclesCount || 0}</span>
                      <span className="text-[var(--color-text-muted)] ml-1">Vehicles Listed</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent-main)] group-hover:translate-x-1 transition-transform">
                      <span>Visit Showroom</span>
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
