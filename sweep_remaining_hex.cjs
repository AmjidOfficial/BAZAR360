const fs = require('fs');
const path = require('path');

function patchFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    // Dark/Neutral backgrounds (Primary)
    content = content.replace(/bg-\[\#(0a0d16|0c101d|070b14|0B0F19|0f1118|0A0B10|0B1410|05110D|0a0d14|03140f|050505|0B1B15|030712)\]/gi, "bg-[var(--color-bg-primary)]");
    
    // Dark/Neutral backgrounds (Secondary / Cards)
    content = content.replace(/bg-\[\#(1e293b|0f172a|0A192F|121824|0A1A14|26344F|1E293B)\]/gi, "bg-[var(--color-bg-secondary)]");

    // Primary Accents
    content = content.replace(/bg-\[\#FF6B00\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/bg-\[\#E05B00\]/gi, "bg-[var(--color-accent-hover)]");
    content = content.replace(/bg-\[\#FE805D\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/text-\[\#FE805D\]/gi, "text-[var(--color-accent-main)]");
    
    // Borders
    content = content.replace(/border-\[\#(1e293b|0f172a|334155)\]/gi, "border-[var(--color-border-main)]");

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
