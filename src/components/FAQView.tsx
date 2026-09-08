import React, { useState, useMemo } from 'react';
import { CENTRAL_FAQS, FAQItem } from '../data/faqs';
import { ChevronDown, Search, HelpCircle, ShieldCheck, MapPin, Car, DollarSign, Store } from 'lucide-react';

interface FAQViewProps {
  lang?: 'en' | 'ur';
  onNavigateToPostAd?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToContact?: () => void;
}

export const FAQView: React.FC<FAQViewProps> = ({
  lang = 'en',
  onNavigateToPostAd,
  onNavigateToInventory,
  onNavigateToContact
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq-what-is-bazar360', 'faq-how-to-buy-peshawar']));

  const isUr = lang === 'ur';

  const categories = [
    { id: 'all', labelEn: 'All Questions', labelUr: 'تمام سوالات', icon: HelpCircle },
    { id: 'peshawar_kpk', labelEn: 'Peshawar & KPK', labelUr: 'پشاور اور خیبر پختونخوا', icon: MapPin },
    { id: 'buying', labelEn: 'Buying & Inspection', labelUr: 'خریداری و انسپکشن', icon: Car },
    { id: 'selling', labelEn: 'Selling & Ads', labelUr: 'فروخت اور اشتہارات', icon: DollarSign },
    { id: 'verification', labelEn: 'Trust & Verification', labelUr: 'تصدیق و شفافیت', icon: ShieldCheck },
    { id: 'dealers', labelEn: 'Showrooms & Dealers', labelUr: 'شو رومز اور ڈیلرز', icon: Store }
  ];

  const filteredFaqs = useMemo(() => {
    return CENTRAL_FAQS.filter((faq) => {
      if (activeCategory !== 'all' && faq.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesEn = faq.questionEn.toLowerCase().includes(query) || faq.answerEn.toLowerCase().includes(query);
        const matchesUr = faq.questionUr.toLowerCase().includes(query) || faq.answerUr.toLowerCase().includes(query);
        return matchesEn || matchesUr;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 md:py-12 ${isUr ? 'text-right' : 'text-left'}`} dir={isUr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider">
          <HelpCircle size={14} />
          <span>{isUr ? 'مدد اور رہنمائی' : 'Official Help & Resource Center'}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-text-header)]">
          {isUr ? 'اکثر پوچھے جانے والے سوالات' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-sm md:text-base text-text-muted leading-relaxed">
          {isUr
            ? 'پشاور، خیبر پختونخوا اور پاکستان بھر میں گاڑی خریدنے، بیچنے، شو روم کی تصدیق اور انسپکشن سے متعلق تمام ضروری معلومات۔'
            : 'Everything you need to know about buying, selling, showroom verification, document checks, and automotive inspections across Peshawar, KPK, and Pakistan.'}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mt-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUr ? 'سوال یا موضوع تلاش کریں (مثلاً: پشاور، ٹوکن ٹیکس، اشتہار)...' : 'Search questions (e.g., Peshawar, Token Tax, Post Ad, Inspection)...'}
            className="w-full bg-[var(--color-bg-secondary)] border border-white/10 rounded-2xl py-3.5 px-12 text-sm text-[var(--color-text-main)] placeholder:text-text-muted focus:outline-none focus:border-orange-500 transition-colors shadow-lg"
          />
          <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-text-muted ${isUr ? 'right-4' : 'left-4'}`} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-white ${isUr ? 'left-4' : 'right-4'}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105'
                  : 'bg-[var(--color-bg-secondary)] text-text-muted hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              <Icon size={14} />
              <span>{isUr ? cat.labelUr : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Items Accordion */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div
                key={faq.id}
                id={faq.id}
                className={`bg-[var(--color-bg-secondary)]/70 backdrop-blur-md border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-orange-500/40 shadow-xl ring-1 ring-orange-500/20' : 'border-white/5 hover:border-white/15'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-5 md:p-6 flex items-center justify-between gap-4 text-left transition-colors"
                >
                  <span className={`text-base md:text-lg font-bold text-[var(--color-text-header)] ${isUr ? 'text-right' : 'text-left'}`}>
                    {isUr ? faq.questionUr : faq.questionEn}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-orange-500/20 text-orange-400' : 'bg-white/5 text-text-muted'
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-6 md:px-6 pt-0 border-t border-white/5 mt-1">
                    <p className="text-sm md:text-base text-text-muted leading-relaxed pt-4">
                      {isUr ? faq.answerUr : faq.answerEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[var(--color-bg-secondary)]/30 border border-white/5 rounded-3xl p-8">
            <HelpCircle size={48} className="mx-auto text-text-muted mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-[var(--color-text-header)]">
              {isUr ? 'کوئی سوال نہیں ملا' : 'No matching questions found'}
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              {isUr
                ? 'براہ کرم کوئی دوسرا لفظ تلاش کریں یا تمام سوالات دیکھیں۔'
                : 'Try searching with different keywords or switch back to "All Questions".'}
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors"
            >
              {isUr ? 'تمام سوالات دیکھیں' : 'Reset Search'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Banner */}
      <div className="mt-12 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg md:text-xl font-black text-[var(--color-text-header)]">
            {isUr ? 'کیا آپ کے پاس مزید کوئی سوال ہے؟' : 'Have another question? Ready to trade?'}
          </h3>
          <p className="text-xs md:text-sm text-text-muted">
            {isUr
              ? 'پشاور کے تصدیق شدہ شو رومز کی گاڑیاں تلاش کریں یا اپنا مفت اشتہار لگائیں۔'
              : 'Browse 100% real verified listings or list your vehicle on Bazar360 today.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0 justify-center">
          {onNavigateToContact && (
            <button
              onClick={onNavigateToContact}
              className="px-5 py-2.5 bg-[var(--color-bg-secondary)] border border-white/10 hover:border-white/30 rounded-xl text-xs font-bold text-white transition-all shadow-md"
            >
              {isUr ? 'ہم سے رابطہ کریں' : 'Contact Support'}
            </button>
          )}
          {onNavigateToInventory && (
            <button
              onClick={onNavigateToInventory}
              className="px-5 py-2.5 bg-[var(--color-bg-secondary)] border border-white/10 hover:border-white/30 rounded-xl text-xs font-bold text-white transition-all shadow-md"
            >
              {isUr ? 'گاڑیاں دیکھیں' : 'Browse Inventory'}
            </button>
          )}
          {onNavigateToPostAd && (
            <button
              onClick={onNavigateToPostAd}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-orange-500/20"
            >
              {isUr ? 'مفت اشتہار لگائیں' : 'Post Free Ad'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
