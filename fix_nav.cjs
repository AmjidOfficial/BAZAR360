const fs = require('fs');
let code = fs.readFileSync('src/components/NavigationAudit.tsx', 'utf8');

// Find the problematic block and replace it cleanly
const blockStart = "            {/* Dark/Light Color Theme Mode Toggler */}";
const blockEnd = "      {/* ========================================================= */}\n      {/* MOBILE STICKY NAVIGATION HEADER                           */}";

const startIdx = code.indexOf(blockStart);
const endIdx = code.indexOf(blockEnd);

if (startIdx !== -1 && endIdx !== -1) {
    const newBlock = `            {/* Dark/Light Color Theme Mode Toggler */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-primary)] transition-all cursor-pointer border border-transparent"
              title="Toggle theme contrast"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="h-5 w-[1px] bg-[var(--color-border-main)]" />

            {/* Dynamic Profile Selector */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-main)] rounded-full py-1.5 pl-1.5 pr-3 cursor-pointer text-xs select-none transition-all duration-300 shadow-sm"
                  id="desktop-profile-trigger"
                >
                  <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[var(--color-accent-main)] to-amber-600 text-white flex items-center justify-center font-black text-[11px] uppercase shadow-inner">
                    {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[var(--color-text-main)] font-black max-w-[80px] truncate uppercase tracking-wider">
                    {(currentUser.displayName || currentUser.email || 'User').split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className="text-[var(--color-text-muted)] shrink-0" />
                </button>
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-primary)] border border-[var(--color-border-main)] rounded-2xl shadow-2xl p-1.5 z-50 text-left"
                      >
                        <div className="px-3 py-2.5 border-b border-[var(--color-border-main)]">
                          <p className="text-[8px] font-mono font-black text-[var(--color-accent-main)] uppercase tracking-widest">{currentUser.role || 'Member'}</p>
                          <p className="text-xs font-black text-[var(--color-text-main)] truncate">{currentUser.displayName || 'Bazar360 Member'}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setTab('profile');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] rounded-xl transition-all cursor-pointer flex items-center gap-2 mt-1"
                        >
                          <User size={13} />
                          <span>{t.profile}</span>
                        </button>
                        <button
                          onClick={() => {
                            onLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-2 border-t border-[var(--color-border-main)] mt-1"
                        >
                          <LogOut size={13} />
                          <span>{t.logout}</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-5 py-2 bg-[var(--color-accent-main)] hover:bg-[var(--color-accent-hover)] text-white font-black text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap"
                id="desktop-login-button"
              >
                <User size={13} />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>
`;

    const result = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
    fs.writeFileSync('src/components/NavigationAudit.tsx', result, 'utf8');
    console.log("Fixed NavigationAudit.tsx");
} else {
    console.log("Could not find block boundaries.");
}
