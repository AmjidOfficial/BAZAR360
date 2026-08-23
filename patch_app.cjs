const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The design system uses var(--color-bg-primary) etc.
content = content.replace(/bg-\[\#030712\]/g, "bg-[var(--color-bg-primary)]");
content = content.replace(/bg-\[\#1E293B\]/g, "bg-[var(--color-bg-secondary)]");
content = content.replace(/bg-\[\#0F172A\]/g, "bg-[var(--color-bg-secondary)]");
content = content.replace(/text-\[\#334155\]/g, "text-[var(--color-text-main)]");
content = content.replace(/text-\[\#E2E8F0\]/g, "text-[var(--color-text-main)]");
content = content.replace(/text-\[\#F9FAFB\]/g, "text-[var(--color-text-header)]");

fs.writeFileSync('src/App.tsx', content);
