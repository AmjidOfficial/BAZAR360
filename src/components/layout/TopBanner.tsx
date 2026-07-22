import React from 'react';

export const TopBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-100 dark:bg-[#030712] py-2 border-b border-slate-200 dark:border-white/5" id="auto-choice-top-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">
        <span className="tracking-wide text-center sm:text-left font-display">
          ★ PESHAWAR'S #1 AUTOMOTIVE MARKETPLACE
        </span>
        <span className="font-sans text-[11px] sm:text-xs text-center sm:text-right text-slate-500 dark:text-slate-400 direction-rtl">
          ★ پشاور کی سب سے بڑی اور بہترین آٹوموٹو مارکیٹ پلیس
        </span>
      </div>
    </div>
  );
};

export default TopBanner;
