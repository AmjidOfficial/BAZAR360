import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `{/* MOBILE FIXED BOTTOM BAR */}`;

const endStr = `{/* STICKY VEHICLE COMPARISON DRAWER BAR */}`;

const startIndex = content.indexOf(targetStr);
const endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const newMobileNav = `
      {/* MOBILE FIXED BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0B0F19]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe">
        <div className="flex justify-between items-center h-[72px] px-1 max-w-md mx-auto relative">
          <button onClick={() => setTab('home')} className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">
            <Home size={18} className={\`\${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[8px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Home</span>
          </button>
          <button onClick={() => setTab('inventory')} className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">
            <Grid size={18} className={\`\${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[8px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Cars</span>
          </button>
          <button onClick={() => setTab('dealers')} className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">
            <Store size={18} className={\`\${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[8px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Stores</span>
          </button>
          
          {/* Central Post Ad Button */}
          <button onClick={() => setTab('sell')} className="relative flex flex-col items-center justify-center -mt-6 group w-14">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full text-white shadow-lg shadow-orange-500/20 border-2 border-[#0B0F19] transition-transform active:scale-95">
              <PlusCircle size={20} />
            </div>
            <span className="text-[9px] font-black mt-1 text-orange-500 uppercase tracking-widest whitespace-nowrap">Sell</span>
          </button>

          <button onClick={() => currentUser ? setTab('profile') : setAuthModalOpen(true)} className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">
            {currentUser ? (
              <User size={18} className={\`\${currentTab === 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            ) : (
              <LogIn size={18} className="text-slate-400" />
            )}
            <span className={\`text-[8px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>
              {currentUser ? 'Profile' : 'Login'}
            </span>
          </button>
          <a href="https://wa.me/923000000000" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">
            <MessageSquare size={18} className="text-[#25D366]" />
            <span className="text-[8px] font-bold mt-1 uppercase tracking-wider text-[#25D366]">Chat</span>
          </a>
        </div>
      </div>
      
      `;

  const finalContent = content.substring(0, startIndex) + newMobileNav + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', finalContent);
  console.log("Patched bottom nav");
} else {
  console.log("Boundaries not found");
}
