import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CarListing, Dealer } from '../types';
import { VehicleCard } from './VehicleCard';
import AutoChoiceHero from './AutoChoiceHero';
import { TopBrandsRail } from './homepage/TopBrandsRail';
import { ShowroomsSection } from './homepage/ShowroomsSection';
import { ServicesSection } from './homepage/ServicesSection';
import { TrustSafetySection } from './homepage/TrustSafetySection';
import { SellYourCarBanner } from './homepage/SellYourCarBanner';
import { pageTransitions } from './AnimationProvider';
import { Sparkles, Car, ArrowRight } from 'lucide-react';

interface HomeFeedProps {
  listings: CarListing[];
  dealers: Dealer[];
  onSelectListing: (car: CarListing) => void;
  onSelectDealer?: (dealerId: string) => void;
  onToggleCompare: (car: CarListing) => void;
  compareList: CarListing[];
  onToggleFavorite: (car: CarListing) => void;
  favoritesList: CarListing[];
  recentViewsList?: CarListing[];
  lang: 'en' | 'ur';
  setTab: (tab: string) => void;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

export function HomeFeed({ listings, dealers, onSelectListing, onSelectDealer, onToggleCompare, compareList, onToggleFavorite, favoritesList, recentViewsList = [], lang, setTab, setSelectedCategory, setSearchQuery }: HomeFeedProps) {
  const isUrdu = lang === 'ur';
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'recent' | 'certified' | 'budget' | 'suv'>('all');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const publishedListings = useMemo(() => (listings || []).filter(car => car?.approved === true && car.isArchived !== true && car.isPaused !== true && car.isSold !== true), [listings]);
  const featuredListings = useMemo(() => publishedListings.filter(car => car.featured === true || car.verified === true).slice(0, 4), [publishedListings]);

  const filteredListings = useMemo(() => publishedListings.filter(car => {
    if (selectedBrand && car.make?.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (selectedCity && !((car.location || car.registrationCity || '').toLowerCase().includes(selectedCity.toLowerCase()))) return false;
    if (activeTabFilter === 'certified') return car.verified === true;
    if (activeTabFilter === 'budget') return typeof car.price === 'number' && car.price <= 3000000;
    if (activeTabFilter === 'suv') {
      const text = `${car.title || ''} ${car.model || ''} ${(car.tags || []).join(' ')}`.toLowerCase();
      return text.includes('suv') || text.includes('prado') || text.includes('fortuner') || text.includes('revo') || text.includes('land cruiser') || text.includes('sportage') || text.includes('tucson');
    }
    return true;
  }), [publishedListings, activeTabFilter, selectedBrand, selectedCity]);

  const sortedListings = useMemo(() => activeTabFilter === 'recent' ? [...filteredListings].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : filteredListings, [filteredListings, activeTabFilter]);
  const displayedListings = useMemo(() => sortedListings.slice(0, visibleCount), [sortedListings, visibleCount]);
  const handleBrandSelect = (brandName: string) => setSelectedBrand(prev => prev === brandName ? '' : brandName);

  return (
    <motion.div variants={pageTransitions} initial="initial" animate="animate" exit="exit" className="b360-editorial-home min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-main)] overflow-x-hidden font-sans pb-24">
      <div className="w-full text-[var(--color-text-header)]">
        <AutoChoiceHero lang={lang} onSearch={query => setSearchQuery?.(query)} setTab={setTab} listings={publishedListings} onSelectListing={onSelectListing} />
      </div>

      <section className="b360-editorial-story" aria-labelledby="b360-editorial-title">
        <div>
          <span className="b360-editorial-kicker">Bazar360 / The Auto Choice</span>
          <h1 id="b360-editorial-title" className="b360-editorial-title">Real vehicles. Real sellers. One premium marketplace.</h1>
        </div>
        <div>
          <p className="b360-editorial-copy">Discover vehicles from the live Bazar360 marketplace, explore verified listings and showrooms, and connect directly with the people behind the vehicle. This section is driven by the same persisted marketplace data shown below.</p>
          <div className="b360-editorial-stats" aria-label="Live marketplace totals">
            <div className="b360-editorial-stat"><span className="b360-editorial-stat-value">{publishedListings.length}</span><span className="b360-editorial-stat-label">Live vehicles</span></div>
            <div className="b360-editorial-stat"><span className="b360-editorial-stat-value">{dealers.length}</span><span className="b360-editorial-stat-label">Showrooms & dealers</span></div>
          </div>
        </div>
      </section>

      <TopBrandsRail onSelectBrand={handleBrandSelect} selectedBrand={selectedBrand} lang={lang} />

      {featuredListings.length > 0 && (
        <section className="b360-editorial-section w-full py-12 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-primary)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-mono font-bold uppercase tracking-wider mb-2"><Sparkles size={14} /><span>Real Featured Stock</span></div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-header)] tracking-tight">{isUrdu ? 'خاص گاڑیاں' : 'Featured & Verified Vehicles'}</h2>
              </div>
              <button onClick={() => setTab('inventory')} className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] text-[var(--color-text-main)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"><span>Explore All Inventory</span><ArrowRight size={14} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((car, idx) => <VehicleCard key={car.id} car={car} dealer={dealers.find(d => d.id === car.dealerId)} onSelect={onSelectListing} onToggleCompare={onToggleCompare} isComparing={compareList.some(c => c.id === car.id)} onToggleFavorite={onToggleFavorite} isFavorite={favoritesList.some(f => f.id === car.id)} index={idx} />)}
            </div>
          </div>
        </section>
      )}

      <section className="b360-editorial-section w-full py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-600">{isUrdu ? 'حقیقی مارکیٹ پلیس لسٹنگز' : 'Live Marketplace Inventory'}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-header)] mt-1 tracking-tight">{isUrdu ? 'حالیہ گاڑیاں' : 'Current Inventory'}</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{publishedListings.length} real published vehicle{publishedListings.length === 1 ? '' : 's'} available now.</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--color-bg-primary)] rounded-2xl border border-[var(--color-border-main)]">
              {[{ id: 'all', label: 'All' }, { id: 'recent', label: 'Newest' }, { id: 'certified', label: 'Verified' }, { id: 'budget', label: 'Under 30 Lakh' }, { id: 'suv', label: 'SUVs & 4x4' }].map(tab => <button key={tab.id} onClick={() => { setActiveTabFilter(tab.id as any); setVisibleCount(8); }} className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${activeTabFilter === tab.id ? 'bg-orange-500 text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'}`}>{tab.label}</button>)}
            </div>
          </div>

          {(selectedBrand || selectedCity) && <div className="mb-6 flex flex-wrap items-center gap-2"><span className="text-xs text-[var(--color-text-muted)]">Active Filters:</span>{selectedBrand && <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-mono font-bold">Make: {selectedBrand} <button onClick={() => setSelectedBrand('')} aria-label="Remove brand filter">×</button></span>}{selectedCity && <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-mono font-bold">City: {selectedCity} <button onClick={() => setSelectedCity('')} aria-label="Remove city filter">×</button></span>}</div>}

          {displayedListings.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{displayedListings.map((car, idx) => <VehicleCard key={car.id} car={car} dealer={dealers.find(d => d.id === car.dealerId)} onSelect={onSelectListing} onToggleCompare={onToggleCompare} isComparing={compareList.some(c => c.id === car.id)} onToggleFavorite={onToggleFavorite} isFavorite={favoritesList.some(f => f.id === car.id)} index={idx} />)}</div> : <div className="py-16 text-center bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-3xl p-8"><Car size={48} className="mx-auto text-orange-400 mb-3 opacity-70" /><h3 className="text-lg font-bold text-[var(--color-text-header)]">{publishedListings.length === 0 ? 'No current inventory yet' : 'No vehicles match your filters'}</h3><p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">{publishedListings.length === 0 ? 'Published inventory uploaded by Admins, Showroom Owners and Users will appear here automatically.' : 'Reset the filters to view the available inventory.'}</p><button onClick={() => { setActiveTabFilter('all'); setSelectedBrand(''); setSelectedCity(''); setVisibleCount(8); }} className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider">Reset Filters</button></div>}

          {visibleCount < sortedListings.length && <div className="mt-12 text-center"><button onClick={() => setVisibleCount(prev => Math.min(prev + 8, sortedListings.length))} className="px-8 py-3 rounded-2xl bg-[var(--color-bg-primary)] hover:bg-white border border-[var(--color-border-main)] text-[var(--color-text-main)] text-xs font-mono font-bold uppercase tracking-wider">Load More Vehicles ({sortedListings.length - visibleCount} Remaining)</button></div>}
        </div>
      </section>

      <section className="b360-editorial-numbered" aria-label="Why Bazar360">
        <article><span className="b360-editorial-number">01 / DISCOVER</span><h3>Find the right vehicle</h3><p>Search real marketplace inventory by make, model, price, location and vehicle details.</p></article>
        <article><span className="b360-editorial-number">02 / EXPLORE</span><h3>See the real story</h3><p>Use vehicle galleries, specifications, seller details and showroom profiles before you decide.</p></article>
        <article><span className="b360-editorial-number">03 / VERIFY</span><h3>Buy with more confidence</h3><p>Use the platform's real verification and approval signals instead of made-up marketplace claims.</p></article>
        <article><span className="b360-editorial-number">04 / CONNECT</span><h3>Talk directly</h3><p>Reach sellers, dealers and showrooms through Bazar360's existing contact and lead flows.</p></article>
      </section>

      <ShowroomsSection dealers={dealers} onSelectDealer={onSelectDealer || (() => setTab('dealers'))} setTab={setTab} lang={lang} />
      <ServicesSection setTab={setTab} lang={lang} />
      <TrustSafetySection lang={lang} />
      <SellYourCarBanner setTab={setTab} lang={lang} />
    </motion.div>
  );
}
