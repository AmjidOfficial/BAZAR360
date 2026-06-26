import React from 'react';

export default function Footer() {
  return (
    <footer id="bazar360-footer" className="w-full bg-[#030712] border-t border-white/5 text-slate-400 py-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 text-center text-xs md:text-sm font-sans tracking-normal leading-relaxed">
        {/* Line 1 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-slate-300">
          <span className="font-medium">For Auto Choice, Inspection, Vehicle Registration &amp; Insurance Services contact</span>
          <span className="font-extrabold text-white">Malak Mazhar</span>
          <span className="hidden md:inline text-slate-600">&bull;</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400">Phone &amp; WhatsApp:</span>
            <a 
              href="https://wa.me/923159085086" 
              className="text-[#38BDF8] hover:text-sky-300 font-black transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-link-malak-whatsapp"
            >
              +92 315 9085086
            </a>
          </div>
        </div>

        {/* Line 2 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-slate-400 pt-2 border-t border-white/5">
          <span className="font-extrabold text-white">Muhammad Amjid</span>
          <span className="hidden md:inline text-slate-600">&bull;</span>
          <span className="font-medium text-slate-300">Founder, BAZAR360 Digital Marketplace</span>
          <span className="hidden md:inline text-slate-600">&bull;</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Phone &amp; Whatsap:</span>
            <a 
              href="tel:03149198403" 
              className="text-[#38BDF8] hover:text-sky-300 font-black transition-colors"
              id="footer-link-amjid-phone"
            >
              0314 9198403
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
