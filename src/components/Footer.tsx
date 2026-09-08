import React, { useState } from 'react';
import { 
  Send, 
  Facebook, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { dbSaveSuggestion, Suggestion } from '../lib/dbService';
import Bazar360Logo from './Bazar360Logo';

interface FooterProps {
  lang?: 'en' | 'ur';
  setTab?: (tab: string) => void;
  onOpenSupportDrawer?: () => void;
}

export default function Footer({ lang = 'en', setTab }: FooterProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      const newSuggestion: Suggestion = {
        id: 'sug_' + Math.random().toString(36).substr(2, 9),
        user_id: null,
        suggestion_text: suggestionText.trim(),
        submitted_at: new Date().toISOString(),
      };

      await dbSaveSuggestion(newSuggestion);
      setSuggestionText('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting suggestion:', err);
      setSubmitError(lang === 'ur' ? 'تجاویز جمع کرنے میں خرابی پیش آئی۔' : 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUrdu = lang === 'ur';

  return (
    <footer id="bazar360-main-footer" className="w-full bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-main)] text-[var(--color-text-muted)] pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans select-none relative overflow-hidden">
      
      {/* Background radial ambient accent glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-radial from-[rgba(212,175,55,0.03)] to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Grid: Clean & Well-Spaced 12-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12 text-left">
          
          {/* Column 1: Brand & Vision */}
          <div className="space-y-4 md:col-span-4 lg:col-span-3">
            <Bazar360Logo variant="full" size="lg" theme="dark" showTagline={true} />
            
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-sm">
              {isUrdu 
                ? 'پاکستان کا سب سے معتبر آٹوموٹو نیٹ ورک۔ تصدیق شدہ شو رومز، معائنہ اور براہ راست خریداروں اور بااعتماد بائعین کا نیٹ ورک۔'
                : "Pakistan's premier direct automotive network. Find verified cars, connect with certified showrooms, and buy or sell with 100% confidence."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              <a 
                href="https://facebook.com/bazar360.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center justify-center hover:bg-[var(--color-accent-main)] hover:border-[var(--color-accent-main)] text-[var(--color-text-muted)] hover:text-[#030712] transition-all duration-300"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/bazar360.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center justify-center hover:bg-[var(--color-accent-main)] hover:border-[var(--color-accent-main)] text-[var(--color-text-muted)] hover:text-[#030712] transition-all duration-300"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/bazar360" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center justify-center hover:bg-[var(--color-accent-main)] hover:border-[var(--color-accent-main)] text-[var(--color-text-muted)] hover:text-[#030712] transition-all duration-300"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/923149198403" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-tertiary)] flex items-center justify-center hover:bg-[#22C55E] hover:border-[#22C55E] text-[var(--color-text-muted)] hover:text-white transition-all duration-300"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Buy & Explore */}
          <div className="space-y-3 md:col-span-4 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-[var(--color-text-header)] uppercase tracking-widest mb-3">Buy Cars</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Browse All Cars
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Certified Pre-Owned
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('dealers')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Verified Showrooms
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  SUVs & 4x4s
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Electric & Hybrid Cars
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Sell & Showrooms */}
          <div className="space-y-3 md:col-span-4 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-[var(--color-text-header)] uppercase tracking-widest mb-3">Sell & Network</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => setTab && setTab('sell')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer flex items-center gap-1">
                  <span>Post Your Car</span>
                  <Sparkles size={12} className="text-[var(--color-accent-main)]" />
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('sell')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Dealer Registration
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('services')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Car Inspection
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('community')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
                  Community Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Our Team Section */}
          <div className="space-y-4 md:col-span-7 lg:col-span-3">
            <div className="mb-4">
              <h3 className="text-sm font-mono font-extrabold text-[var(--color-text-header)] uppercase tracking-widest inline-block pb-1 border-b-2 border-[var(--color-accent-main)]">
                OUR TEAM
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Member 1: Muhammad Amjid */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] flex items-center justify-center text-[var(--color-accent-main)] font-extrabold text-xs shrink-0 shadow-inner group-hover:border-[var(--color-accent-main)] transition-colors duration-300">
                  MA
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--color-text-header)]">Muhammad Amjid</span>
                    <span className="text-[var(--color-text-muted)]/30">|</span>
                    <a href="tel:03149198403" className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-main)] transition-colors">
                      03149198403
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[var(--color-accent-main)] uppercase tracking-wider">FOUNDER</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Product Strategy • Technology • Platform Development</p>
                </div>
              </div>

              {/* Member 2: Malak Mazhar */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] flex items-center justify-center text-[var(--color-accent-main)] font-extrabold text-xs shrink-0 shadow-inner group-hover:border-[var(--color-accent-main)] transition-colors duration-300">
                  MM
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--color-text-header)]">Malak Mazhar</span>
                    <span className="text-[var(--color-text-muted)]/30">|</span>
                    <a href="tel:03159085086" className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-main)] transition-colors">
                      03159085086
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[var(--color-accent-main)] uppercase tracking-wider">HEAD OF AUTOMOTIVE SALES</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Vehicle Sales • Negotiations • Customer Advisory</p>
                </div>
              </div>

              {/* Member 3: Ghani Khan */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] flex items-center justify-center text-[var(--color-accent-main)] font-extrabold text-xs shrink-0 shadow-inner group-hover:border-[var(--color-accent-main)] transition-colors duration-300">
                  GK
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--color-text-header)]">Ghani Khan</span>
                    <span className="text-[var(--color-text-muted)]/30">|</span>
                    <a href="tel:03556908996" className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-main)] transition-colors">
                      03556908996
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[var(--color-accent-main)] uppercase tracking-wider">MEDIA & INVENTORY MANAGER</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Vehicle Listings • Media Management • Marketplace Operations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 5: Feedback / Suggestions */}
          <div className="space-y-3 md:col-span-5 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-[var(--color-text-header)] uppercase tracking-widest mb-3">Improve Bazar360</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Have feedback or feature requests? Let our tech team know directly.</p>
            
            <form onSubmit={handleSuggestionSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder={isUrdu ? "اپنی تجاویز دیں..." : "Your suggestion..."}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-main)] rounded-xl text-xs text-[var(--color-text-header)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent-main)] transition-colors"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !suggestionText.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-[#030712] text-[11px] font-bold rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  {isSubmitting ? '...' : <Send size={11} />}
                </button>
              </div>
              {submitSuccess && (
                <p className="text-[11px] text-[#22C55E] font-semibold">Thank you for your feedback!</p>
              )}
              {submitError && (
                <p className="text-[11px] text-rose-400 font-semibold">{submitError}</p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--color-border-main)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p className="text-[var(--color-text-muted)]/70">
            © {new Date().getFullYear()} Bazar360.online • All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[var(--color-text-muted)]">
            <button onClick={() => setTab && setTab('faq')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
              FAQ & Help
            </button>
            <button onClick={() => setTab && setTab('contact')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
              Support
            </button>
            <button onClick={() => setTab && setTab('guides')} className="hover:text-[var(--color-accent-main)] transition-colors cursor-pointer">
              Terms & Safety
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
