#!/usr/bin/env node
/**
 * One-time, fail-closed migration for the legacy listing mapper.
 *
 * Run from the repository root:
 *   node scripts/fix-listing-data-integrity.mjs
 *
 * The script refuses to continue if the expected legacy blocks are not found.
 * It never invents values. Missing optional marketplace facts remain undefined.
 */
import fs from 'node:fs';

const file = 'src/lib/dbService.ts';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

let source = fs.readFileSync(file, 'utf8');
const original = source;

const replacements = [
  [
    `    year: Number(data.year) || 2024,\n    price: Number(data.price) || 0,\n    mileage: Number(data.mileage) || 0,\n    fuelType: data.fuelType || 'Petrol',\n    transmission: data.transmission || 'Automatic',`,
    `    year: toOptionalNumber(data.year),\n    price: toOptionalNumber(data.price) ?? 0,\n    mileage: toOptionalNumber(data.mileage) ?? 0,\n    fuelType: data.fuelType,\n    transmission: data.transmission,`
  ],
  [
    `    specs: data.specs || {\n      color: data.exteriorColor || 'Standard',\n      engineSize: data.engineCC ? \`\${data.engineCC} CC\` : '2000 CC',\n      horspower: '150 hp',\n      regionalSpecs: data.assemblyType || 'Local'\n    },\n    condition: data.condition || 'Used',\n    engineCC: Number(data.engineCC) || 2000,\n    exteriorColor: data.exteriorColor || data.specs?.color || 'Standard White',\n    bodyCondition: data.bodyCondition || 'Total Genuine',\n    registrationCity: data.registrationCity || 'Peshawar',\n    documentType: data.documentType || 'Smart Card',\n    tokenTaxPaid: data.tokenTaxPaid !== false,\n    images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),\n    assemblyType: data.assemblyType || 'Local',\n    dentPaintDescription: data.dentPaintDescription || '',\n    tokenTaxStatus: data.tokenTaxStatus || 'Paid'`,
    `    specs: {\n      color: data.specs?.color ?? data.exteriorColor,\n      engineSize: data.specs?.engineSize ?? (data.engineCC != null ? \`\${data.engineCC} CC\` : undefined),\n      horspower: data.specs?.horspower,\n      regionalSpecs: data.specs?.regionalSpecs ?? data.assemblyType\n    },\n    condition: data.condition,\n    engineCC: toOptionalNumber(data.engineCC),\n    exteriorColor: data.exteriorColor ?? data.specs?.color,\n    bodyCondition: data.bodyCondition,\n    registrationCity: data.registrationCity,\n    documentType: data.documentType,\n    tokenTaxPaid: typeof data.tokenTaxPaid === 'boolean' ? data.tokenTaxPaid : undefined,\n    images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),\n    assemblyType: data.assemblyType,\n    dentPaintDescription: data.dentPaintDescription,\n    tokenTaxStatus: data.tokenTaxStatus`
  ],
  [
    `    id === 'listing-1784821782501' ||\n    id === 'listing-1784821585212';`,
    `    false;`
  ],
  [
    `    : ((data.dealerId === 'auto-choice' || (data.dealerId && data.dealerId.includes('auto-choice'))) ? 'auto-choice-peshawar' : (data.dealerId || 'private'));`,
    `    : (data.dealerId || undefined);`
  ],
  [
    `  const resolvedSellerType = isExplicitIndividual ? 'Individual' : (data.sellerType || (resolvedDealerId === 'private' ? 'Individual' : 'Showroom'));`,
    `  const resolvedSellerType = data.sellerType;`
  ],
  [
    `    dealerId: resolvedDealerId,\n    sellerType: resolvedSellerType,\n    sellerName: data.sellerName || data.createdBy || 'Individual Seller',`,
    `    dealerId: resolvedDealerId,\n    sellerType: resolvedSellerType,\n    sellerName: data.sellerName ?? data.createdBy,`
  ]
];

for (const [from, to] of replacements) {
  if (!source.includes(from)) {
    throw new Error('Expected legacy mapper block was not found. No changes were written.');
  }
  source = source.replace(from, to);
}

const marker = 'function mapListingDoc(id: string, data: any): CarListing {';
if (!source.includes(marker)) throw new Error('Listing mapper marker not found. No changes were written.');
source = source.replace(marker, `function toOptionalNumber(value: unknown): number | undefined {\n  if (value === null || value === undefined || value === '') return undefined;\n  const parsed = Number(value);\n  return Number.isFinite(parsed) ? parsed : undefined;\n}\n\n${marker}`);

if (source === original) throw new Error('No changes detected.');
fs.writeFileSync(file, source, 'utf8');
console.log(`Updated ${file} with real-data-only mapping rules.`);
