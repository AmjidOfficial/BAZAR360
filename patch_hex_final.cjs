const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard dark shades with semantic variables
content = content.replace(/bg-\[\#(111827|141b2b|121a2a|0b121f|0a0a0c|070c12|1e293b|111928)\]/gi, "bg-[var(--color-bg-secondary)]");
content = content.replace(/border-\[\#1e293b\]/gi, "border-[var(--color-border-main)]");

// Replace blue highlights with semantic variables
content = content.replace(/bg-\[\#2563EB\]/gi, "bg-[var(--color-accent-main)]");
content = content.replace(/bg-\[\#38bdf8\]/gi, "bg-[var(--color-accent-main)]");
content = content.replace(/text-\[\#38bdf8\]/gi, "text-[var(--color-accent-main)]");
content = content.replace(/border-\[\#38bdf8\]/gi, "border-[var(--color-accent-main)]");
content = content.replace(/bg-\[\#3B82F6\]/gi, "bg-[var(--color-accent-hover)]");

// Replace oranges with semantic variables
content = content.replace(/bg-\[\#F97316\]/gi, "bg-[var(--color-accent-main)]");

fs.writeFileSync('src/App.tsx', content);
