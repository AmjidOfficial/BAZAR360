import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src', 'app'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const forbiddenPatterns = [
  { name: 'synthetic vehicle defaults', regex: /(?:year|price|mileage|engineCC)\s*:\s*(?:202[0-9]|2000|150000|2500000)/i },
  { name: 'fake Auto Choice identity', regex: /auto-choice-peshawar|Auto Choice Peshawar/i },
  { name: 'artificial listing deduplication', regex: /seenTitles|seenPrices|seenYears|dedup|deduplicate/i },
];

const legacyPatterns = [
  { name: 'legacy global listing fetch', regex: /dbFetchListings\s*\(/ },
  { name: 'legacy paginated listing fetch', regex: /dbFetchListingsPaginated\s*\(/ },
];

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (EXTENSIONS.has(path.extname(entry.name))) result.push(full);
  }
  return result;
}

const files = SOURCE_DIRS.flatMap(dir => walk(path.join(ROOT, dir)));
const failures = [];
const warnings = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of forbiddenPatterns) {
    if (rule.regex.test(text)) failures.push(`${rule.name}: ${path.relative(ROOT, file)}`);
  }
  for (const rule of legacyPatterns) {
    if (rule.regex.test(text)) warnings.push(`${rule.name}: ${path.relative(ROOT, file)}`);
  }
}

if (failures.length) {
  console.error('Production audit FAILED. Forbidden production data patterns found:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

if (warnings.length) {
  console.warn('Production audit WARNING. Legacy listing APIs are still referenced:');
  for (const item of warnings) console.warn(`- ${item}`);
}

console.log(`Production audit passed: scanned ${files.length} source files.`);
