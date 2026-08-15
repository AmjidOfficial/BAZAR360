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
    <footer id="bazar360-main-footer" className="w-full bg-[#0B192C] border-t border-[#1E293B] text-[#94A3B8] pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid: Clean & Well-Spaced 12-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12 text-left">
          
          {/* Column 1: Brand & Vision */}
          <div className="space-y-4 md:col-span-5 lg:col-span-4">
            <Bazar360Logo variant="full" size="lg" theme="dark" showTagline={true} />
            
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
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
                className="w-9 h-9 rounded-xl border border-white/10 bg-[#0F172A] flex items-center justify-center hover:bg-[#F97316] hover:border-[#F97316] text-[#94A3B8] hover:text-white transition-all duration-200"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/bazar360.online" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 bg-[#0F172A] flex items-center justify-center hover:bg-[#F97316] hover:border-[#F97316] text-[#94A3B8] hover:text-white transition-all duration-200"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/bazar360" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 bg-[#0F172A] flex items-center justify-center hover:bg-[#F97316] hover:border-[#F97316] text-[#94A3B8] hover:text-white transition-all duration-200"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/923149198403" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 bg-[#0F172A] flex items-center justify-center hover:bg-[#22C55E] hover:border-[#22C55E] text-[#94A3B8] hover:text-white transition-all duration-200"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Buy & Explore */}
          <div className="space-y-3 md:col-span-3 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-3">Buy Cars</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-white transition-colors cursor-pointer">
                  Browse All Cars
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-white transition-colors cursor-pointer">
                  Certified Pre-Owned
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('dealers')} className="hover:text-white transition-colors cursor-pointer">
                  Verified Showrooms
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-white transition-colors cursor-pointer">
                  SUVs & 4x4s
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('search')} className="hover:text-white transition-colors cursor-pointer">
                  Electric & Hybrid Cars
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Sell & Showrooms */}
          <div className="space-y-3 md:col-span-2 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-3">Sell & Network</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => setTab && setTab('sell')} className="hover:text-[#F97316] transition-colors cursor-pointer flex items-center gap-1">
                  <span>Post Your Car</span>
                  <Sparkles size={12} className="text-[#F97316]" />
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('sell')} className="hover:text-white transition-colors cursor-pointer">
                  Dealer Registration
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('services')} className="hover:text-white transition-colors cursor-pointer">
                  Car Inspection
                </button>
              </li>
              <li>
                <button onClick={() => setTab && setTab('community')} className="hover:text-white transition-colors cursor-pointer">
                  Community Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Our Team Section */}
          <div className="space-y-4 md:col-span-6 lg:col-span-4">
            <div className="mb-4">
              <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-widest inline-block pb-1 border-b-2 border-[#F97316]">
                OUR TEAM
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Member 1: Muhammad Amjid */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center text-[#F97316] font-extrabold text-xs shrink-0 shadow-inner">
                  MA
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">Muhammad Amjid</span>
                    <span className="text-white/20">|</span>
                    <a href="tel:03149198403" className="text-xs font-mono text-[#94A3B8] hover:text-[#F97316] transition-colors">
                      03149198403
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[#F97316] uppercase tracking-wider">FOUNDER</p>
                  <p className="text-[11px] text-[#94A3B8]">Product Strategy • Technology • Platform Development</p>
                </div>
              </div>

              {/* Member 2: Malak Mazhar */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center text-[#F97316] font-extrabold text-xs shrink-0 shadow-inner">
                  MM
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">Malak Mazhar</span>
                    <span className="text-white/20">|</span>
                    <a href="tel:03159085086" className="text-xs font-mono text-[#94A3B8] hover:text-[#F97316] transition-colors">
                      03159085086
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[#F97316] uppercase tracking-wider">HEAD OF AUTOMOTIVE SALES</p>
                  <p className="text-[11px] text-[#94A3B8]">Vehicle Sales • Negotiations • Customer Advisory</p>
                </div>
              </div>

              {/* Member 3: Ghani Khan */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center text-[#F97316] font-extrabold text-xs shrink-0 shadow-inner">
                  GK
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">Ghani Khan</span>
                    <span className="text-white/20">|</span>
                    <a href="tel:03556908996" className="text-xs font-mono text-[#94A3B8] hover:text-[#F97316] transition-colors">
                      03556908996
                    </a>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[#F97316] uppercase tracking-wider">MEDIA & INVENTORY MANAGER</p>
                  <p className="text-[11px] text-[#94A3B8]">Vehicle Listings • Media Management • Marketplace Operations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 5: Feedback / Suggestions */}
          <div className="space-y-3 md:col-span-4 lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-3">Improve Bazar360</h4>
            <p className="text-xs text-[#94A3B8]">Have feedback or feature requests? Let our tech team know directly.</p>
            
            <form onSubmit={handleSuggestionSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder={isUrdu ? "اپنی تجاویز دیں..." : "Your suggestion or feedback..."}
                  className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#F97316]"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !suggestionText.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '...' : <Send size={12} />}
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
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p className="text-[#64748B]">
            © {new Date().getFullYear()} Bazar360.online • All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[#94A3B8]">
            <button onClick={() => setTab && setTab('faq')} className="hover:text-white transition-colors cursor-pointer">
              FAQ & Help
            </button>
            <button onClick={() => setTab && setTab('contact')} className="hover:text-white transition-colors cursor-pointer">
              Support
            </button>
            <button onClick={() => setTab && setTab('guides')} className="hover:text-white transition-colors cursor-pointer">
              Terms & Safety
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
