import React from 'react';
import { Dealer } from '../../types';
import { Phone, MapPin, Globe } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface BusinessCardBackProps {
  dealer: Dealer;
  theme: 'dark' | 'light';
}

export const BusinessCardBack: React.FC<BusinessCardBackProps> = ({ dealer, theme }) => {
  return (
    <div className={`w-full aspect-[1.636] rounded-2xl border p-6 grid grid-cols-2 gap-4 items-center shadow-2xl backdrop-blur-md ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white/80 border-slate-200/50 text-slate-900'}`}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-tight">Contact</h3>
        <div className="space-y-2 text-sm opacity-80">
          <div className="flex items-center gap-3">
              <Phone size={18} />
              {dealer.phone}
          </div>
          <div className="flex items-center gap-3">
              <MapPin size={18} />
              {dealer.location}
          </div>
          {dealer.socials?.website && (
              <div className="flex items-center gap-3">
                  <Globe size={18} />
                  {dealer.socials.website}
              </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="bg-white p-2 rounded-lg">
            <QRCodeCanvas value={`https://bazar360.online/showroom/${dealer.id}`} size={100} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Scan to View</p>
      </div>
    </div>
  );
};
