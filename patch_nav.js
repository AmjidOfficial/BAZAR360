import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = content.indexOf('        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}');
const endIndex = content.indexOf('        </header>\n        )}') + '        </header>\n        )}'.length;

const newNav = `        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}
        {currentTab !== 'dealer-storefront' && (
          <header className="hidden md:flex w-full items-center justify-between py-3 border-b border-white/5 relative z-20 mb-3 max-w-7xl mx-auto shrink-0 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 px-4 md:px-8">
            {/* Core Branding */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setTab('home')}>
              <svg className="w-11 h-11 select-none flex-shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 45 70 C 45 32, 135 32, 135 70" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" fill="none" className="stroke-[#00E5FF]" />
                <circle cx="62" cy="54" r="3.5" fill="#FFFFFF" />
                <path d="M 35 105 C 40 152, 128 152, 142 118" stroke="#F97316" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 132 112 L 148 112 L 144 126 Z" fill="#F97316" stroke="#F97316" strokeWidth="3" strokeLinejoin="round" />
                <text x="32" y="112" fill="#FFFFFF" className="font-sans font-black" fontSize="64" letterSpacing="-4">360</text>
                <circle cx="132" cy="90" r="24" fill="url(#orangeLogoGradApp)" />
                <path d="M 118 80 L 122 80 L 126 94 L 140 94 L 144 84 L 124 84" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="127" cy="101" r="3" fill="#FFFFFF" />
                <circle cx="139" cy="101" r="3" fill="#FFFFFF" />
                <defs>
                  <linearGradient id="orangeLogoGradApp" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black text-white tracking-wider leading-none">BAZAR<span className="text-orange-500 font-extrabold">360</span><span className="text-xs font-black text-[#38BDF8] ml-0.5 lowercase">.online</span></span>
                <span className="text-[7.5px] font-bold text-slate-400 tracking-[0.18em] uppercase pt-1 font-sans">
                  BUY <span className="text-orange-500 font-black">|</span> SELL <span className="text-orange-500 font-black">|</span> CONNECT
                </span>
              </div>
            </div>

            {/* Main Desktop Tabs */}
            <nav className="flex items-center gap-6">
              <button onClick={() => setTab('home')} className={\`text-[11px] font-black uppercase tracking-wider transition-colors \${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'}\`}>Home</button>
              <button onClick={() => setTab('inventory')} className={\`text-[11px] font-black uppercase tracking-wider transition-colors \${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'}\`}>Inventory</button>
              <button onClick={() => setTab('dealers')} className={\`text-[11px] font-black uppercase tracking-wider transition-colors \${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-slate-400 hover:text-white'}\`}>Showrooms</button>
              
              {/* Prominent CTA for Post Ad */}
              <button
                onClick={() => setTab('sell')}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg text-[11px] font-mono font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <PlusCircle size={14} />
                <span>Post Ad</span>
              </button>

              <button 
                onClick={() => currentUser ? setTab('profile') : setAuthModalOpen(true)} 
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-md"
              >
                {currentUser ? <User size={14} /> : <LogIn size={14} />}
                <span>{currentUser ? 'Profile' : 'Login / Register'}</span>
              </button>

              <a 
                href="https://wa.me/923000000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#25D366] hover:text-green-400 transition-colors"
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </a>
            </nav>
          </header>
        )}`;

if (startIndex > -1 && endIndex > -1) {
  let finalContent = content.substring(0, startIndex) + newNav + content.substring(endIndex);
  
  // also add mobile bottom nav at the end just before </RoleProvider> or similar? No, just outside the main scroll container.
  // Wait, let's inject mobile bottom nav just before the STICKY VEHICLE COMPARISON DRAWER BAR.
  
  const bottomNavStartIndex = finalContent.indexOf('{/* STICKY VEHICLE COMPARISON DRAWER BAR */}');
  
  const mobileNav = `
      {/* MOBILE FIXED BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0B0F19]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-[72px] px-2 max-w-md mx-auto relative pb-safe">
          <button onClick={() => setTab('home')} className="flex flex-col items-center justify-center w-14 pt-1 transition-colors">
            <Home size={20} className={\`\${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[9px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Home</span>
          </button>
          <button onClick={() => setTab('inventory')} className="flex flex-col items-center justify-center w-14 pt-1 transition-colors">
            <Grid size={20} className={\`\${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[9px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'inventory' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Cars</span>
          </button>
          
          {/* Central Post Ad Button */}
          <button onClick={() => setTab('sell')} className="relative flex flex-col items-center justify-center -mt-8 group">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full text-white shadow-lg shadow-orange-500/20 border-4 border-[#0B0F19] transition-transform active:scale-95">
              <PlusCircle size={24} />
            </div>
            <span className="text-[10px] font-black mt-1 text-orange-500 uppercase tracking-widest">Post Ad</span>
          </button>

          <button onClick={() => setTab('dealers')} className="flex flex-col items-center justify-center w-14 pt-1 transition-colors">
            <Store size={20} className={\`\${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            <span className={\`text-[9px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'dealers' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>Stores</span>
          </button>
          <button onClick={() => currentUser ? setTab('profile') : setAuthModalOpen(true)} className="flex flex-col items-center justify-center w-14 pt-1 transition-colors">
            {currentUser ? (
              <User size={20} className={\`\${currentTab === 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}\`} />
            ) : (
              <LogIn size={20} className="text-slate-400" />
            )}
            <span className={\`text-[9px] font-bold mt-1 uppercase tracking-wider \${currentTab === 'profile' ? 'text-[#38BDF8]' : 'text-slate-400'}\`}>
              {currentUser ? 'Profile' : 'Login'}
            </span>
          </button>
        </div>
      </div>
      
      `;
      
  finalContent = finalContent.substring(0, bottomNavStartIndex) + mobileNav + finalContent.substring(bottomNavStartIndex);

  fs.writeFileSync('src/App.tsx', finalContent);
  console.log("Patched");
} else {
  console.log("Not found boundaries");
}
