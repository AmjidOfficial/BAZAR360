const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\#38BDF8/g, "var(--color-accent-main)");
content = content.replace(/\#f97316/g, "var(--color-accent-hover)");
content = content.replace(/sky-500/g, "emerald-500");
content = content.replace(/orange-500/g, "emerald-600");

fs.writeFileSync('src/App.tsx', content);
