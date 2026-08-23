import React from 'react';

export const TopBanner: React.FC = () => {
  return (
    <div className="w-full bg-[#007979]/90 backdrop-blur-md py-2 border-b border-[#24B1B1]/30 shadow-sm" id="auto-choice-top-banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-100">
        <span className="tracking-widest text-center sm:text-left font-display flex items-center gap-1.5 text-[#FFE2AF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#24B1B1] animate-ping" />
          ★ PESHAWAR'S #1 AUTOMOTIVE MARKETPLACE ★
        </span>
        <span className="font-sans text-[11px] sm:text-xs text-center sm:text-right text-[#FFE2AF]/90 tracking-wide">
          ★ پشاور کی سب سے بڑی اور بہترین آٹوموٹو مارکیٹ پلیس ★
        </span>
      </div>
    </div>
  );
};

export default TopBanner;

