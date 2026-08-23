const fs = require('fs');
let content = fs.readFileSync('src/components/ThemeEngine.tsx', 'utf8');

const replacement = `export const DEFAULT_THEME_VARIABLES = {
  bgPrimary: '#030712',
  bgSecondary: '#0F172A',
  textMain: '#FFFFFF',
  textHeader: '#F8FAFC',
  textMuted: '#94A3B8',
  borderMain: 'rgba(255, 255, 255, 0.05)',
  accentMain: '#F97316',
  accentHover: '#EA580C',
  fontFamilyHeader: '"Space Grotesk", sans-serif',
  fontFamilyBody: '"Inter", ui-sans-serif, system-ui, sans-serif'
};`;

content = content.replace(/export const DEFAULT_THEME_VARIABLES = \{[\s\S]*?\};/, replacement);

fs.writeFileSync('src/components/ThemeEngine.tsx', content);
