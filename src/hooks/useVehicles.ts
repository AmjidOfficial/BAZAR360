import { useState, useEffect } from 'react';
import { CarListing } from '../types';
import { dbFetchListings } from '../lib/dbService';

interface VehicleFilters {
  make?: string;
  model?: string;
  city?: string;
}

/**
 * 1. Reusable Client Hook for Vehicle inventory
 * Fetches active (approved) listings from Firestore with dynamic reactive filters.
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
        const listings = await dbFetchListings();
        
        // Filter out unapproved and match criteria
        let filtered = listings.filter(v => v.approved !== false);
        
        if (filters?.make) {
          const brandMatch = filters.make.toLowerCase().trim();
          filtered = filtered.filter(v => v.make.toLowerCase().includes(brandMatch));
        }
        
        if (filters?.model) {
          const modelMatch = filters.model.toLowerCase().trim();
          filtered = filtered.filter(v => v.model.toLowerCase().includes(modelMatch));
        }
        
        if (filters?.city) {
          const cityMatch = filters.city.toLowerCase().trim();
          filtered = filtered.filter(v => {
            const loc = (v.registrationCity || v.region || '').toLowerCase();
            return loc.includes(cityMatch);
          });
        }
        
        if (active) {
          setVehicles(filtered);
          setError(null);
        }
      } catch (err: any) {
        console.error('[useVehicles Hook] Sourcing error:', err);
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchInventory();
    
    return () => {
      active = false;
    };
  }, [filters?.make, filters?.model, filters?.city]);

  return { vehicles, loading, error };
}
