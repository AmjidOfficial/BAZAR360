import React from 'react';
import { Dealer } from '../../types';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface BusinessCardFrontProps {
  dealer: Dealer;
  theme: 'dark' | 'light';
}

export const BusinessCardFront: React.FC<BusinessCardFrontProps> = ({ dealer, theme }) => {
  return (
    <div className={`w-full aspect-[1.636] rounded-2xl border p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white/80 border-slate-200/50 text-slate-900'}`}>
        <div className="flex justify-between items-start">
          {/* Showroom Logo */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700/50 bg-slate-800">
            <img src={dealer.logoUrl || dealer.logo} alt={dealer.name} className="w-full h-full object-cover" />
          </div>
          {dealer.verified && <ShieldCheck className="text-blue-500 fill-blue-500/20" size={24} />}
        </div>
        
        <div className="mt-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">{dealer.name}</h2>
            <p className="text-sm opacity-80 font-medium">{dealer.tagline}</p>
        </div>

        <div className="flex justify-between items-center mt-6 text-xs opacity-60 font-semibold uppercase tracking-widest">
            <span>Bazar360 Partner</span>
            <Sparkles size={16} />
        </div>
    </div>
  );
};
