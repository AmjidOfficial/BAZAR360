const fs = require('fs');
let code = fs.readFileSync('src/components/RoleTailoredSettings.tsx', 'utf8');

// The sed command `sed -i '/<button/,/<\/button>/d'` deleted everything from `<button` to `</button>`.
// Oh wait, I didn't actually delete all of it in git. Let me see the actual file contents right now.
console.log(code);
