#!/usr/bin/env node
/**
 * Bazar360 production data-integrity audit.
 *
 * This is intentionally conservative. It does not modify source files.
 * It fails CI when marketplace code contains known factual fallback values
 * or production code appears to depend on development seed data.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/lib/dbService.ts',
  'src/types.ts',
  'src/App.tsx',
  'server.ts',
];

const forbidden = [
  { pattern: /year:\s*Number\([^\n]+\)\s*\|\|\s*2024\b/, reason: 'vehicle year fallback to 2024' },
  { pattern: /fuelType:\s*data\.fuelType\s*\|\|\s*['\"]Petrol['\"]/, reason: 'fuel type fallback to Petrol' },
  { pattern: /transmission:\s*data\.transmission\s*\|\|\s*['\"]Automatic['\"]/, reason: 'transmission fallback to Automatic' },
  { pattern: /engineCC:\s*Number\(data\.engineCC\)\s*\|\|\s*2000\b/, reason: 'engine fallback to 2000 CC' },
  { pattern: /registrationCity:\s*data\.registrationCity\s*\|\|\s*['\"]Peshawar['\"]/, reason: 'registration city fallback to Peshawar' },
  { pattern: /bodyCondition:\s*data\.bodyCondition\s*\|\|\s*['\"]Total Genuine['\"]/, reason: 'body condition fallback to Total Genuine' },
  { pattern: /documentType:\s*data\.documentType\s*\|\|\s*['\"]Smart Card['\"]/, reason: 'document type fallback to Smart Card' },
  { pattern: /tokenTaxPaid:\s*data\.tokenTaxPaid\s*!==\s*false/, reason: 'missing token-tax status treated as paid' },
];

const violations = [];
for (const relative of files) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      violations.push(`${relative}: ${rule.reason}`);
    }
  }
}

if (violations.length) {
  console.error('\nBAZAR360 PRODUCTION DATA INTEGRITY FAILED\n');
  for (const violation of violations) console.error(`- ${violation}`);
  console.error('\nMarketplace facts must come from persisted user/admin data.\n');
  process.exit(1);
}

console.log('BAZAR360 production data integrity audit passed.');
