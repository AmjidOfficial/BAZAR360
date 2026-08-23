#!/usr/bin/env node
/**
 * Bazar360 production data-integrity audit.
 *
 * Conservative, source-level CI gate. It does not modify application data.
 * It fails when production marketplace code contains known factual fallbacks,
 * synthetic seller identity, special-case showroom identity, or artificial
 * listing deduplication that can hide real records.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/lib/dbService.ts',
  'src/lib/inventoryRepository.ts',
  'src/types.ts',
  'src/App.tsx',
  'src/components/ShowroomView.tsx',
  'src/hooks/useVehicles.ts',
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
  { pattern: /['\"]auto-choice-peshawar['\"]/, reason: 'special-case Auto Choice identity in marketplace code' },
  { pattern: /['\"]auto-choice['\"]/, reason: 'special-case Auto Choice identity in marketplace code' },
  { pattern: /['\"]Individual Seller['\"]/, reason: 'synthetic seller identity fallback' },
  { pattern: /title_price_year_dealer/, reason: 'artificial listing deduplication key' },
  { pattern: /cleanAndDeduplicateListings/, reason: 'legacy artificial listing deduplication path' },
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
