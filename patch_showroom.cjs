const fs = require('fs');
let content = fs.readFileSync('src/components/ShowroomMiniSite.tsx', 'utf8');

content = content.replace(/bg-\[\#030712\]/g, "bg-[var(--color-bg-primary)]");
content = content.replace(/bg-\[\#0F172A\]/g, "bg-[var(--color-bg-secondary)]");
content = content.replace(/text-\[\#FFFFFF\]/g, "text-[var(--color-text-header)]");
content = content.replace(/text-\[\#94A3B8\]/g, "text-[var(--color-text-muted)]");
content = content.replace(/text-\[\#E2E8F0\]/g, "text-[var(--color-text-main)]");

fs.writeFileSync('src/components/ShowroomMiniSite.tsx', content);
