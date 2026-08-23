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
      
      content = content.replace(/bg-slate-950/g, "bg-bg-primary");
      content = content.replace(/bg-slate-900/g, "bg-bg-secondary");
      content = content.replace(/bg-slate-800/g, "bg-bg-tertiary");
      content = content.replace(/border-slate-800/g, "border-border-main");
      content = content.replace(/border-slate-700/g, "border-border-main");
      content = content.replace(/text-slate-100/g, "text-text-main");
      content = content.replace(/text-slate-200/g, "text-text-main");
      content = content.replace(/text-slate-300/g, "text-text-muted");
      content = content.replace(/text-slate-400/g, "text-text-muted");
      content = content.replace(/text-slate-500/g, "text-text-muted");
      
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
  content = content.replace(/bg-slate-950/g, "bg-bg-primary");
  content = content.replace(/bg-slate-900/g, "bg-bg-secondary");
  content = content.replace(/bg-slate-800/g, "bg-bg-tertiary");
  content = content.replace(/border-slate-800/g, "border-border-main");
  content = content.replace(/border-slate-700/g, "border-border-main");
  content = content.replace(/text-slate-100/g, "text-text-main");
  content = content.replace(/text-slate-200/g, "text-text-main");
  content = content.replace(/text-slate-300/g, "text-text-muted");
  content = content.replace(/text-slate-400/g, "text-text-muted");
  content = content.replace(/text-slate-500/g, "text-text-muted");
  if (content !== originalContent) {
    fs.writeFileSync('src/App.tsx', content);
  }
}
