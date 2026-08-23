const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/bg-\[radial-gradient\(\#ffffff03_1px,transparent_1px\)\]/gi, "bg-[radial-gradient(var(--color-border-main)_1px,transparent_1px)]");
fs.writeFileSync('src/App.tsx', content);
