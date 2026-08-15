const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { AutoChoiceLogo, Bazar360Logo }')) {
  code = code.replace(
    "import { AutoChoiceLogo } from './components/Bazar360Logo';",
    "import { AutoChoiceLogo, Bazar360Logo } from './components/Bazar360Logo';"
  );
}

const logoCyclerComponent = `
function AnimatedLogoCycler() {
  const [showAutoChoice, setShowAutoChoice] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowAutoChoice(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-10 w-full flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        {showAutoChoice ? (
          <motion.div
            key="autochoice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center"
          >
            <AutoChoiceLogo className="scale-110 origin-left" showText={true} themeMode="dark" />
          </motion.div>
        ) : (
          <motion.div
            key="bazar360"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center"
          >
            <Bazar360Logo className="scale-[1.15] origin-left" showText={true} themeMode="dark" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

if (!code.includes('AnimatedLogoCycler')) {
  const insertIndex = code.indexOf('const METRIC_TABS_DATA =');
  code = code.slice(0, insertIndex) + logoCyclerComponent + '\n' + code.slice(insertIndex);
}

// Replace ONLY the first instance that matches exactly (which should be in the header)
// Actually, let's target the exact place in App.tsx where AutoChoiceLogo is in the sticky header
code = code.replace(
  '<AutoChoiceLogo className="scale-110 origin-left" showText={true} themeMode="dark" />',
  '<AnimatedLogoCycler />'
);

fs.writeFileSync('src/App.tsx', code);
