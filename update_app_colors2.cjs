const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-orange-500/g, "bg-[var(--color-accent-hover)]");
content = content.replace(/border-orange-500\/30/g, "border-[var(--color-accent-hover)]/30");
content = content.replace(/text-orange-500/g, "text-[var(--color-accent-hover)]");
content = content.replace(/hover\:bg-orange-600/g, "hover:bg-[var(--color-accent-hover)]");

fs.writeFileSync('src/App.tsx', content);
