const fs = require('fs');
let content = fs.readFileSync('src/components/TopAppBar.tsx', 'utf8');

// Replace emerald-500/20 with generic styles
content = content.replace(/bg-emerald-500\/20/g, "bg-[var(--color-accent-main)]/20");
content = content.replace(/hover:bg-emerald-500\/30/g, "hover:bg-[var(--color-accent-main)]/30");
content = content.replace(/text-emerald-400/g, "text-[var(--color-accent-main)]");
content = content.replace(/border-emerald-500\/30/g, "border-[var(--color-accent-main)]/30");
content = content.replace(/shadow-\[0_0_15px_rgba\(16,185,129,0\.2\)\]/g, "shadow-[0_0_15px_var(--color-accent-main)]/20");

// Replace orange gradient with generic gradient
content = content.replace(/from-orange-500 via-amber-500 to-red-500/g, "from-[var(--color-accent-main)] to-[var(--color-accent-hover)]");
content = content.replace(/shadow-orange-500\/20/g, "shadow-[var(--color-accent-main)]/20");
content = content.replace(/border-amber-300\/40/g, "border-[var(--color-accent-main)]/40");

fs.writeFileSync('src/components/TopAppBar.tsx', content);
