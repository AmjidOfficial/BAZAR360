// NOTE: Seed arrays were moved to a development-only script under
// `scripts/seed-dev/initial-data.js`. The production frontend must never
// import or consume hard-coded marketplace records. Returning empty arrays
// prevents accidental display of demo data in production builds.

import { Dealer, CarListing, Review } from './types';

if (process.env.NODE_ENV === 'production') {
  // Keep exports intentionally empty in production.
}

export const INITIAL_DEALERS: Dealer[] = [];
export const INITIAL_LISTINGS: CarListing[] = [];
export const INITIAL_REVIEWS: Record<string, Review[]> = {};
