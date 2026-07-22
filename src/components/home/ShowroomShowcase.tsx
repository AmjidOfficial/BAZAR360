import React from 'react';
import { Dealer } from '../../types';
import { MapPin, Star, ArrowRight } from 'lucide-react';

interface ShowroomShowcaseProps {
  lang: 'en' | 'ur';
  dealers: Dealer[];
  onSelectDealer: (id: string) => void;
  setTab: (tab: string) => void;
  dbLoading?: boolean;
}

export function ShowroomShowcase({ lang, dealers, onSelectDealer, setTab, dbLoading }: ShowroomShowcaseProps) {
  return (
    <section className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] rounded-3xl py-8 px-6 mt-4">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-[var(--color-text-main)] tracking-tight">
              {lang === 'en' ? 'Certified Showrooms' : 'تصدیق شدہ شورومز'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] font-sans mt-2">
              {lang === 'en' ? 'Buy directly from our trusted partners.' : 'ہمارے معتبر پارٹنرز سے براہ راست خریدیں۔'}
            </p>
          </div>
          <button 
            onClick={() => setTab('dealers')}
            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-sans font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'All Showrooms' : 'سب شورومز'} <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dbLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--color-bg-primary)] h-48 rounded-3xl animate-pulse border border-[var(--color-border-main)]"></div>
            ))
          ) : (
            dealers.slice(0, 3).map(dealer => (
              <div 
                key={dealer.id}
                onClick={() => onSelectDealer(dealer.id)}
                className="bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-3xl p-6 cursor-pointer hover:border-orange-500/50 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-display font-black text-2xl group-hover:bg-orange-500 group-hover:text-slate-950 transition-colors shrink-0">
                    {dealer.avatarLetter || dealer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-sans font-bold text-[var(--color-text-main)] truncate group-hover:text-orange-500 transition-colors">
                      {dealer.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs font-sans text-[var(--color-text-muted)] font-semibold">
                      <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" /> {dealer.rating || '4.9'}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={12} className="text-slate-400" /> {dealer.location.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--color-border-main)] flex justify-between items-center text-sm font-sans">
                  <span className="text-[var(--color-text-muted)] font-medium">
                    {lang === 'en' ? 'Active Listings' : 'موجودہ گاڑیاں'}: <strong className="text-[var(--color-text-main)] font-mono ml-1">24</strong>
                  </span>
                  <span className="text-orange-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Visit <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
