const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      content = content.replace(/bg-\[\#030712\]/g, "bg-bg-primary");
      content = content.replace(/bg-\[\#1E293B\]/g, "bg-bg-secondary");
      content = content.replace(/bg-\[\#0F172A\]/g, "bg-bg-secondary");
      content = content.replace(/text-\[\#E2E8F0\]/g, "text-text-main");
      content = content.replace(/text-\[\#F9FAFB\]/g, "text-text-header");
      content = content.replace(/text-\[\#334155\]/g, "text-text-main");
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('src/components');
processDir('src/pages');
if (fs.existsSync('src/App.tsx')) {
  let content = fs.readFileSync('src/App.tsx', 'utf8');
  let originalContent = content;
  content = content.replace(/bg-\[\#030712\]/g, "bg-bg-primary");
  content = content.replace(/bg-\[\#1E293B\]/g, "bg-bg-secondary");
  content = content.replace(/bg-\[\#0F172A\]/g, "bg-bg-secondary");
  content = content.replace(/text-\[\#E2E8F0\]/g, "text-text-main");
  content = content.replace(/text-\[\#F9FAFB\]/g, "text-text-header");
  content = content.replace(/text-\[\#334155\]/g, "text-text-main");
  if (content !== originalContent) {
    fs.writeFileSync('src/App.tsx', content);
  }
}
