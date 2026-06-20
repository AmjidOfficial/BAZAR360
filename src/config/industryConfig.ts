import { IndustryConfig } from '../types';

/**
 * High-Level Immutable Configuration State for BAZAR360 Multi-Tenancy.
 * Switching from "Automotive" to a future variant like "Footwear" can be controlled
 * cleanly here by changing activeIndustry and related labels.
 */
export const BAZAR360_INDUSTRY_CONFIG: IndustryConfig = {
  activeIndustry: 'Automotive', // 'Automotive' | 'Footwear' | 'Apparel'
  industryName: 'Auto Choice',
  slogan: 'To buy and Sell New and Used Cars, Jeeps and SUVs',
  heroBadge: '★ ENTERPRISE AUTOMOTIVE PLATFORM',
};
