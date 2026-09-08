const fs = require('fs');

function replaceFile(path, regex, replacement) {
    let content = fs.readFileSync(path, 'utf8');
    let original = content;
    content = content.replace(regex, replacement);
    if (content !== original) fs.writeFileSync(path, content);
}

replaceFile('src/components/LazyImage.tsx', /bg-\[\#F9FAFB\]\/50/g, 'bg-slate-100/50 dark:bg-slate-800/50');
replaceFile('src/components/RegistrationPortal.tsx', /bg-\[\#4a7c59\]/g, 'bg-emerald-700');
replaceFile('src/components/AuthModal.tsx', /bg-\[\#1877F2\]/g, 'bg-blue-600');
replaceFile('src/components/AuthModal.tsx', /hover:bg-\[\#166FE5\]/g, 'hover:bg-blue-700');
replaceFile('src/components/ShowroomBusinessCard.tsx', /bg-\[\#E2B755\]/g, 'bg-amber-500');
replaceFile('src/components/ShowroomBusinessCard.tsx', /text-\[\#E2B755\]/g, 'text-amber-500');
replaceFile('src/components/ShowroomBusinessCard.tsx', /border-\[\#E2B755\]/g, 'border-amber-500');

replaceFile('src/components/ShowroomBusinessCard.tsx', /bg-\[\#10B981\]/g, 'bg-emerald-500');
replaceFile('src/components/ShowroomBusinessCard.tsx', /text-\[\#10B981\]/g, 'text-emerald-500');
replaceFile('src/components/ShowroomBusinessCard.tsx', /border-\[\#10B981\]/g, 'border-emerald-500');

