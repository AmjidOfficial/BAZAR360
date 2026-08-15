const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('<IdentityBanner currentUser={currentUser} />\\n        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}', '<IdentityBanner currentUser={currentUser} />\n        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}');

fs.writeFileSync('src/App.tsx', code);
