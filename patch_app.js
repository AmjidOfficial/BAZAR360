const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /<a href="https:\/\/wa\.me\/923000000000" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-12 pt-1 transition-colors">[\s\S]*?<\/a>/g,
  ''
);
fs.writeFileSync('src/App.tsx', content);
