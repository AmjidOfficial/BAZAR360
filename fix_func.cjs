const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('}\\nfunction App() {', '}\nfunction App() {');

fs.writeFileSync('src/App.tsx', code);
