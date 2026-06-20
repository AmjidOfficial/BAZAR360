import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Languages, X } from 'lucide-react';
import { callAiTranslate } from '../services/api';

interface AiTranslationWrapperProps {
  text: string;
  className?: string;
}

export default function AiTranslationWrapper({ text, className = '' }: AiTranslationWrapperProps) {
  const [currentText, setCurrentText] = useState(text);
  const [originalText, setOriginalText] = useState(text);
  const [translating, setTranslating] = useState(false);
  const [activeLang, setActiveLang] = useState<string | null>(null); // 'Urdu' | 'Pashto' | 'English' | null
  const [showMenu, setShowMenu] = useState(false);

  // Synchronize when parent text changes
  useEffect(() => {
    setOriginalText(text);
    setCurrentText(text);
    setActiveLang(null);
  }, [text]);

  const handleTranslate = async (lang: string) => {
    if (translating) return;
    setTranslating(true);
    setShowMenu(false);
    try {
      const response = await callAiTranslate(originalText, lang);
      if (response.success && response.translatedText) {
        setCurrentText(response.translatedText);
        setActiveLang(lang);
      }
    } catch (err) {
      console.warn("AI Translation Error, reverting to original:", err);
    } finally {
      setTranslating(false);
    }
  };

  const handleRevert = () => {
    setCurrentText(originalText);
    setActiveLang(null);
    setShowMenu(false);
  };

  return (
    <div className={`relative group/trans ${className}`} id="ai-translation-pwa-container">
      {/* Content Area */}
      <div className={`transition-all duration-300 ${translating ? 'opacity-40 select-none pointer-events-none blur-[1px]' : ''}`}>
        {currentText}
      </div>

      {translating && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/10 pointer-events-none">
          <RefreshCw size={18} className="text-[#F97316] animate-spin" />
        </div>
      )}

      {/* Control Overlay / Triggers */}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/5 pt-1.5 select-none">
        
        {/* Translation State Indicator Tag */}
        {activeLang ? (
          <div className="flex items-center gap-1">
            <span className="bg-[#F97316]/15 hover:bg-[#F97316]/25 border border-[#F97316]/30 px-2 py-0.5 rounded-lg text-[8px] font-mono font-black uppercase text-[#F97316] tracking-wider flex items-center gap-1 transition-colors">
              <Sparkles size={8} /> AI translated to {activeLang}
            </span>
            <button
              onClick={handleRevert}
              className="text-white/40 hover:text-[#F97316] duration-150 p-1 rounded-md"
              title="Revert to original text"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <div className="text-[9px] text-[#38BDF8] flex items-center gap-1 font-mono uppercase tracking-wide opacity-50 group-hover/trans:opacity-100 duration-150">
            <Languages size={10} /> KPK Regional Translation Ready
          </div>
        )}

        {/* orange Translate Core Trigger Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-[#F97316] hover:bg-orange-600 active:scale-95 text-white font-mono font-bold text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md shadow-orange-500/10 transition-all cursor-pointer"
          >
            <Sparkles size={10} /> Translate
          </button>

          {showMenu && (
            <>
              {/* Backing Dismiss Dialog */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Dropdown Languages list */}
              <div className="absolute right-0 bottom-full mb-1.5 z-50 bg-[#0F172A] border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[160px] max-h-[280px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="text-[7.5px] font-mono font-black text-white/35 uppercase tracking-widest px-2.5 py-1 border-b border-white/5 sticky top-0 bg-[#0F172A]">
                  Select Language
                </div>
                <button
                  onClick={() => handleTranslate('Urdu')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Urdu (اردو) {activeLang === 'Urdu' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Pashto')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Pashto (پښتو) {activeLang === 'Pashto' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Punjabi')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Punjabi (پنجابی) {activeLang === 'Punjabi' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Sindhi')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Sindhi (سنڌي) {activeLang === 'Sindhi' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Balochi')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Balochi (بلوچی) {activeLang === 'Balochi' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Saraiki')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Saraiki (سرائیکی) {activeLang === 'Saraiki' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Hindko')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Hindko (ہندکو) {activeLang === 'Hindko' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('Kashmiri')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  Kashmiri (کشمیری) {activeLang === 'Kashmiri' && '✓'}
                </button>
                <button
                  onClick={() => handleTranslate('English')}
                  className="w-full text-left font-mono text-[9px] uppercase font-bold text-slate-300 hover:text-white hover:bg-[#F97316] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between"
                >
                  English {activeLang === 'English' && '✓'}
                </button>
                {activeLang && (
                  <button
                    onClick={handleRevert}
                    className="w-full text-left font-mono text-[8px] uppercase font-black text-red-400 hover:text-white hover:bg-red-500/30 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 border-t border-white/5 mt-1 pt-1.5 sticky bottom-0 bg-[#0F172A]"
                  >
                    Reset Original
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
