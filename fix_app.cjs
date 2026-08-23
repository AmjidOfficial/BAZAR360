const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the recursive AnimatedLogoCycler call with AutoChoiceLogo
code = code.replace(
  '            <AnimatedLogoCycler />\\n          </motion.div>\\n        ) : (\\n          <motion.div\\n            key="bazar360"',
  '            <AutoChoiceLogo className="scale-110 origin-left" showText={true} themeMode="dark" />\\n          </motion.div>\\n        ) : (\\n          <motion.div\\n            key="bazar360"'
);

fs.writeFileSync('src/App.tsx', code);
