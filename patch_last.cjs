const fs = require('fs');
const path = require('path');

function patchFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;

    content = content.replace(/bg-\[\#(1e2a40|0E1117|161f30|131c2e|080d17|0B1329|040D0A|0d0f17|131b2e|0E172A)\]/gi, "bg-[var(--color-bg-secondary)]");
    content = content.replace(/bg-\[\#(030A16)\]/gi, "bg-[var(--color-bg-primary)]");
    content = content.replace(/bg-\[\#(1a243c)\]/gi, "bg-[var(--color-bg-tertiary)]");
    content = content.replace(/bg-\[\#(0ea5e9|06B6D4)\]/gi, "bg-[var(--color-accent-main)]");
    content = content.replace(/bg-\[\#(E05E00)\]/gi, "bg-[var(--color-accent-hover)]");

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
