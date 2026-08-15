const fs = require('fs');
let code = fs.readFileSync('src/components/AutoChoiceHero.tsx', 'utf8');

// Remove activeServiceDot state
code = code.replace(/const \[activeServiceDot, setActiveServiceDot\] = useState\(0\);\n/g, '');

// Remove scrollServiceToIndex function and the related useEffect if they exist
code = code.replace(/const scrollServiceToIndex =[\s\S]*?};\n/g, '');

// There is a servicesScrollRef, we should remove that as well
code = code.replace(/const servicesScrollRef = useRef<HTMLDivElement>\(null\);\n/g, '');

// Also remove any remaining useEffect related to scrolling
code = code.replace(/useEffect\(\(\) => {\n\s+const container = servicesScrollRef\.current;[\s\S]*?}, \[\]\);\n/g, '');
fs.writeFileSync('src/components/AutoChoiceHero.tsx', code);
