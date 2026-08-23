const fs = require('fs');
let code = fs.readFileSync('src/components/NavigationAudit.tsx', 'utf8');

// Replace Language Switcher
const langSwitcherBlock = `            {/* Language Selection Switcher */}
            <button
              onClick={onLanguageToggle}
              className="px-2.5 py-1.5 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[#FF6B00] font-mono font-black text-[10px] rounded-xl border border-[var(--color-border-main)] cursor-pointer transition-all uppercase tracking-widest"
              title="Toggle language mode"
            >
              {lang === 'en' ? 'UR' : 'EN'}
            </button>`;

const newLangSwitcherBlock = `            {/* Language Selection Switcher */}
            <button
              onClick={onLanguageToggle}
              className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[#FF6B00] font-mono font-black text-[10px] rounded-xl border border-[var(--color-border-main)] cursor-pointer transition-all uppercase tracking-widest shrink-0"
              title="Toggle language mode"
            >
              {lang === 'en' ? 'UR' : 'EN'}
            </button>`;

// Replace Theme Toggler
const themeTogglerBlock = `            {/* Dark/Light Color Theme Mode Toggler */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] transition-all cursor-pointer border border-transparent"
              title="Toggle theme contrast"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>`;

const newThemeTogglerBlock = `            {/* Dark/Light Color Theme Mode Toggler */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] transition-all cursor-pointer border border-transparent shrink-0"
              title="Toggle theme contrast"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>`;

// Replace Sell Car CTA
const sellCTA = `            {/* Direct Sell Car CTA Ad Banner Button (Orange-500) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onLoginClick();
                } else {
                  setTab('sell');
                }
              }}
              className="px-4.5 py-2.5 bg-[#FF6B00] hover:bg-[#E05B00] text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/10 active:scale-95 border-none"
              id="desktop-cta-sell-nav"
            >
              <PlusCircle size={14} className="stroke-[2.5]" />
              <span>{t.sell}</span>
            </button>`;

const newSellCTA = `            {/* Direct Sell Car CTA Ad Banner Button (Orange-500) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onLoginClick();
                } else {
                  setTab('sell');
                }
              }}
              className="px-3 sm:px-4.5 py-2.5 bg-[#FF6B00] hover:bg-[#E05B00] text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/10 active:scale-95 border-none shrink-0"
              id="desktop-cta-sell-nav"
            >
              <PlusCircle size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">{t.sell}</span>
            </button>`;

// Profile Dropdown Trigger
const profileTrigger = `                  className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] rounded-full py-1.5 pl-1.5 pr-3 cursor-pointer text-xs select-none transition-all duration-300 shadow-sm"
                  id="desktop-profile-trigger"
                >
                  <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[var(--color-accent-main)] to-amber-600 text-white flex items-center justify-center font-black text-[11px] uppercase shadow-inner">
                    {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[var(--color-text-main)] font-black max-w-[80px] truncate uppercase tracking-wider">
                    {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
                  </span>`;

const newProfileTrigger = `                  className="flex items-center gap-1.5 sm:gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] rounded-full py-1.5 pl-1.5 pr-2 sm:pr-3 cursor-pointer text-xs select-none transition-all duration-300 shadow-sm"
                  id="desktop-profile-trigger"
                >
                  <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-tr from-[var(--color-accent-main)] to-amber-600 text-white flex items-center justify-center font-black text-[11px] uppercase shadow-inner">
                    {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[var(--color-text-main)] font-black max-w-[60px] sm:max-w-[80px] truncate uppercase tracking-wider">
                    {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
                  </span>`;

code = code.replace(langSwitcherBlock, newLangSwitcherBlock);
code = code.replace(themeTogglerBlock, newThemeTogglerBlock);
code = code.replace(sellCTA, newSellCTA);
code = code.replace(profileTrigger, newProfileTrigger);

fs.writeFileSync('src/components/NavigationAudit.tsx', code, 'utf8');
console.log("Fixed NavigationAudit.tsx");
