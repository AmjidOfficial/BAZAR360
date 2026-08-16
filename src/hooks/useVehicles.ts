import { useState, useEffect } from 'react';
import { CarListing } from '../types';
import { fetchPublishedInventory } from '../lib/inventoryRepository';

interface VehicleFilters {
  make?: string;
  model?: string;
  city?: string;
}

/**
 * Buyer-facing inventory hook.
 * Uses the canonical real-data repository instead of the legacy 100-record
 * fetch/deduplication path.
 */
export function useVehicles(filters?: VehicleFilters) {
  const [vehicles, setVehicles] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchInventory() {
      setLoading(true);
      try {
        const page = await fetchPublishedInventory();
        let filtered = page.listings;

        if (filters?.make) {
          const brandMatch = filters.make.toLowerCase().trim();
          filtered = filtered.filter(v => (v.make || '').toLowerCase().includes(brandMatch));
        }

        if (filters?.model) {
          const modelMatch = filters.model.toLowerCase().trim();
          filtered = filtered.filter(v => (v.model || '').toLowerCase().includes(modelMatch));
        }

        if (filters?.city) {
          const cityMatch = filters.city.toLowerCase().trim();
          filtered = filtered.filter(v => {
            const loc = (v.registrationCity || v.location || v.region || '').toLowerCase();
            return loc.includes(cityMatch);
          });
        }

        if (active) {
          setVehicles(filtered);
          setError(null);
        }
      } catch (err: unknown) {
        console.error('[useVehicles Hook] Sourcing error:', err);
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchInventory();
    return () => {
      active = false;
    };
  }, [filters?.make, filters?.model, filters?.city]);

  return { vehicles, loading, error };
}
