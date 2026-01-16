import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_id: string;
  address_components: {
    street_number?: string;
    route?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
}

interface GeocodeRequest {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  property_id?: string;
  job_id?: string;
}

interface UseGeocodeResult {
  geocode: (request: GeocodeRequest) => Promise<GeocodeResult | null>;
  loading: boolean;
  error: Error | null;
  lastResult: GeocodeResult | null;
}

// Simple in-memory cache for geocode results
const geocodeCache = new Map<string, GeocodeResult>();

function getCacheKey(request: GeocodeRequest): string {
  return [
    request.address,
    request.city,
    request.state,
    request.zip,
    request.country
  ].filter(Boolean).join('|').toLowerCase();
}

export function useGeocode(): UseGeocodeResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<GeocodeResult | null>(null);

  const geocode = useCallback(async (request: GeocodeRequest): Promise<GeocodeResult | null> => {
    if (!request.address) {
      setError(new Error('Address is required'));
      return null;
    }

    // Check cache first
    const cacheKey = getCacheKey(request);
    const cached = geocodeCache.get(cacheKey);
    if (cached) {
      setLastResult(cached);
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('geocode-address', {
        body: request,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success || !data?.result) {
        throw new Error(data?.error || 'Geocoding failed');
      }

      const result = data.result as GeocodeResult;

      // Cache the result
      geocodeCache.set(cacheKey, result);

      setLastResult(result);
      return result;
    } catch (err) {
      console.error('Geocode error:', err);
      const error = err instanceof Error ? err : new Error('Unknown geocoding error');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, loading, error, lastResult };
}

// Utility function to geocode a property and update it
export async function geocodeProperty(propertyId: string, address: {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): Promise<GeocodeResult | null> {
  if (!address.address) return null;

  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: {
        ...address,
        property_id: propertyId,
      },
    });

    if (error || !data?.success) {
      console.error('Failed to geocode property:', error || data?.error);
      return null;
    }

    return data.result as GeocodeResult;
  } catch (err) {
    console.error('Geocode property error:', err);
    return null;
  }
}

// Utility function to geocode a job address
export async function geocodeJob(jobId: string, address: {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}): Promise<GeocodeResult | null> {
  if (!address.address) return null;

  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: {
        ...address,
        job_id: jobId,
      },
    });

    if (error || !data?.success) {
      console.error('Failed to geocode job:', error || data?.error);
      return null;
    }

    return data.result as GeocodeResult;
  } catch (err) {
    console.error('Geocode job error:', err);
    return null;
  }
}

export default useGeocode;
