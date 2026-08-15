import React from 'react';
import { PlusCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Clock, Users } from 'lucide-react';

interface SellYourCarBannerProps {
  setTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export const SellYourCarBanner: React.FC<SellYourCarBannerProps> = ({ setTab, lang }) => {
  const isUrdu = lang === 'ur';

  return (
    <section className="w-full bg-[var(--color-bg-secondary)] py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-[var(--color-border)] relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--color-accent-main)]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>{isUrdu ? 'گاڑی جلدی بیچیں' : 'Sell In Minutes'}</span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-header)] tracking-tight">
                  {isUrdu ? 'اپنی گاڑی فروخت کرنے کے لیے تیار ہیں؟' : 'Ready to Sell Your Car?'}
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-2 max-w-2xl leading-relaxed">
                  {isUrdu
                    ? 'ہزاروں تصدیق شدہ خریداروں تک رسائی حاصل کریں۔ مفت اشتہار لگائیں یا ہماری وی آئی پی "Sell For U" کنسرج سروس استعمال کریں۔'
                    : 'List your car for free in under 60 seconds and reach thousands of serious automotive buyers across Pakistan.'}
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-main)] font-medium">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] flex items-center justify-center shrink-0">
                    <Clock size={12} />
                  </div>
                  <span>{isUrdu ? '۶۰ سیکنڈ میں اشتہار' : 'Instant 60s Posting'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-main)] font-medium">
                  <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Users size={12} />
                  </div>
                  <span>{isUrdu ? 'براہ راست خریدار رابطے' : 'Direct Buyer Inquiries'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-main)] font-medium">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] flex items-center justify-center shrink-0">
                    <ShieldCheck size={12} />
                  </div>
                  <span>{isUrdu ? 'صفر کمیشن فیس' : '0% Commission Options'}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('sell')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <PlusCircle size={16} />
                  <span>{isUrdu ? 'گاڑی کا اشتہار لگائیں' : 'Post Your Vehicle'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('services')}
                  className="px-6 py-3.5 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-main)] font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isUrdu ? 'کیسے کام کرتا ہے؟' : 'Learn How It Works'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Graphic / Stat Box */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] space-y-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase">Sell Options</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-accent-main)]/15 text-[var(--color-accent-main)] text-[10px] font-mono font-bold">2 Pathways</span>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => setTab('sell')}
                    className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent-main)]/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--color-text-main)]">Self-Managed Ad</h4>
                      <span className="text-[10px] font-mono font-bold text-amber-400">FREE</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Post photos, set your price, receive direct WhatsApp inquiries.</p>
                  </div>

                  <div 
                    onClick={() => setTab('sell')}
                    className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-amber-400/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--color-text-main)]">Sell For U (VIP)</h4>
                      <span className="text-[10px] font-mono font-bold text-amber-400">CONCIERGE</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">We inspect, photograph, verify documents, and negotiate on your behalf.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
