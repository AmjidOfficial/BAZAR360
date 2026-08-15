const fs = require('fs');
let content = fs.readFileSync('src/components/ShowroomHero.tsx', 'utf8');

content = content.replace(/bg-\[\#38BDF8\]\/20/g, "bg-[var(--color-accent-main)]/20");
content = content.replace(/border-\[\#38BDF8\]\/40/g, "border-[var(--color-accent-main)]/40");
content = content.replace(/text-\[\#38BDF8\]/g, "text-[var(--color-accent-main)]");
content = content.replace(/bg-\[\#0F172A\]/g, "bg-[var(--color-bg-secondary)]");

fs.writeFileSync('src/components/ShowroomHero.tsx', content);
