const fs = require('fs');
const path = require('path');

function patchFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Dark/Neutral backgrounds
    content = content.replace(/bg-\[\#(030712|0b121f|070c12|0a0a0c)\]/gi, "bg-[var(--color-bg-primary)]");
    content = content.replace(/bg-\[\#(0F172A|111827|121a2a|111928|0a0d14)\]/gi, "bg-[var(--color-bg-secondary)]");
    content = content.replace(/bg-\[\#(1E293B|141b2b)\]/gi, "bg-[var(--color-bg-tertiary)]");

    // Primary Accents (Blues / Teals)
    content = content.replace(/bg-\[\#2563EB\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/bg-\[\#38bdf8\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/bg-\[\#3B82F6\]/gi, "bg-[var(--color-accent-hover)]");
    content = content.replace(/bg-\[\#0284C7\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/bg-\[\#0369A1\]/gi, "bg-[var(--color-accent-hover)]");

    // Primary Accents (Oranges)
    content = content.replace(/bg-\[\#F97316\]/gi, "bg-[var(--color-brand-orange)]");
    content = content.replace(/bg-\[\#EA580C\]/gi, "bg-[var(--color-brand-orange)]");
    content = content.replace(/bg-\[\#FF6B00\]/gi, "bg-[var(--color-brand-orange)]");
    content = content.replace(/bg-\[\#E05B00\]/gi, "hover:bg-[var(--color-brand-orange)]"); // close enough for hover
    content = content.replace(/text-\[\#F97316\]/gi, "text-[var(--color-brand-orange)]");

    // Borders
    content = content.replace(/border-\[\#(1E293B|334155|0F172A|111827)\]/gi, "border-[var(--color-border-main)]");
    content = content.replace(/border-\[\#38bdf8\]/gi, "border-[var(--color-accent-main)]");
    content = content.replace(/border-slate-[78]00/gi, "border-[var(--color-border-main)]");

    // Text
    content = content.replace(/text-\[\#38bdf8\]/gi, "text-[var(--color-accent-main)]");
    content = content.replace(/text-\[\#3B82F6\]/gi, "text-[var(--color-accent-hover)]");
    content = content.replace(/text-\[\#E2E8F0\]/gi, "text-[var(--color-text-main)]");
    content = content.replace(/text-\[\#F9FAFB\]/gi, "text-[var(--color-text-header)]");
    content = content.replace(/text-\[\#334155\]/gi, "text-[var(--color-text-main)]");

    // Tailwind hardcoded classes to CSS Variables
    content = content.replace(/bg-slate-950/g, "bg-[var(--color-bg-primary)]");
    content = content.replace(/bg-slate-900/g, "bg-[var(--color-bg-secondary)]");
    content = content.replace(/bg-slate-800/g, "bg-[var(--color-bg-tertiary)]");
    content = content.replace(/text-slate-100/g, "text-[var(--color-text-header)]");
    content = content.replace(/text-slate-200/g, "text-[var(--color-text-header)]");
    content = content.replace(/text-slate-300/g, "text-[var(--color-text-main)]");
    content = content.replace(/text-slate-400/g, "text-[var(--color-text-muted)]");
    content = content.replace(/text-slate-500/g, "text-[var(--color-text-muted)]");
    content = content.replace(/text-white/g, "text-[var(--color-text-header)]");

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            patchFile(fullPath);
        }
    }
}

processDir('src/components');
processDir('src/pages');
if (fs.existsSync('src/App.tsx')) {
    patchFile('src/App.tsx');
}
