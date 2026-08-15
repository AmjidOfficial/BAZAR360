const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const identityHandler = `
function IdentityBanner({ currentUser }: { currentUser: any }) {
  let identity = 'Visitor';
  let bannerColor = 'bg-slate-800/50 border-slate-700 text-slate-300';
  let greeting = 'Welcome, Guest. Login to access full features.';

  if (currentUser) {
    if (currentUser.role === 'dealer' || currentUser.role === 'admin') {
      identity = 'Showroom Owner';
      bannerColor = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      greeting = \`Welcome back, \${currentUser.name || 'Owner'}. Your showroom dashboard is active.\`;
    } else {
      identity = 'Registered User';
      bannerColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      greeting = \`Welcome back, \${currentUser.name || 'User'}. Explore personalized recommendations.\`;
    }
  }

  return (
    <div className={\`w-full max-w-7xl mx-auto px-4 md:px-8 py-2 border-b flex items-center justify-between text-[10px] font-mono tracking-widest uppercase \${bannerColor} backdrop-blur-sm z-20 relative\`}>
      <div className="flex items-center gap-2 font-black">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
        {identity}
      </div>
      <div className="hidden sm:block opacity-80">{greeting}</div>
    </div>
  );
}
`;

// Insert the component before the App function
code = code.replace('export default function App() {', identityHandler + '\\nexport default function App() {');

// Render the banner right above the header
code = code.replace(
  "{/* 1. REFINED PREMIUM GATEWAY NAVBAR */}",
  "<IdentityBanner currentUser={currentUser} />\\n        {/* 1. REFINED PREMIUM GATEWAY NAVBAR */}"
);

// Remove the WhatsApp icon and replace it with contact text in the header
const waRegex = /<a\s+href="https:\/\/wa\.me\/923159085086"[\s\S]*?<\/a>/;
const contactDetails = `
              <div className="flex flex-col text-[9px] font-mono uppercase tracking-widest text-slate-400 border-l border-[var(--color-border-main)] pl-4 ml-2">
                <span className="font-bold text-[#38BDF8]">Malak Mazhar</span>
                <span className="font-bold text-[#F97316]">Muhammad Amjid</span>
              </div>
`;

code = code.replace(waRegex, contactDetails);

fs.writeFileSync('src/App.tsx', code);
