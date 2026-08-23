const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newLogoCycler = `function AnimatedLogoCycler() {
  const [showAutoChoice, setShowAutoChoice] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowAutoChoice(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-11 w-48 flex items-center overflow-hidden">
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
            <AutoChoiceLogo className="scale-90 origin-left" showText={true} themeMode="dark" />
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
            <Bazar360Logo className="scale-90 origin-left" showText={true} themeMode="dark" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

code = code.replace(/function AnimatedLogoCycler\(\) \{[\s\S]*?\}\n/, newLogoCycler + '\n');

const headerBrandingRegex = /<div className="flex items-center space-x-3 cursor-pointer select-none" onClick=\{\(\) => setTab\('home'\)\}>[\s\S]*?<\/div>\s*<\/div>/;

code = code.replace(headerBrandingRegex, '<div className="cursor-pointer select-none" onClick={() => setTab(\'home\')}><AnimatedLogoCycler /></div>');

fs.writeFileSync('src/App.tsx', code);
