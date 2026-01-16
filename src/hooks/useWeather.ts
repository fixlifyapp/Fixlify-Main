import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'hot' | 'cold' | 'partly_cloudy' | 'stormy';
  temperature: number;
  temperatureUnit: 'C' | 'F';
  humidity: number;
  windSpeed: number;
  windUnit: 'km/h' | 'mph';
  precipitation: number;
  uvIndex: number;
  description: string;
  icon: string;
  recommendation?: string;
  feelsLike?: number;
  visibility?: number;
}

interface UseWeatherResult {
  weather: WeatherInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  cached: boolean;
}

interface UseWeatherOptions {
  enabled?: boolean;
  forecastDate?: string; // YYYY-MM-DD
}

// In-memory cache for client-side (additional layer)
const clientCache = new Map<string, { weather: WeatherInfo; timestamp: number }>();
const CLIENT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 10) / 10;
  const roundedLng = Math.round(lng * 10) / 10;
  return `${roundedLat}:${roundedLng}`;
}

export function useWeather(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  options: UseWeatherOptions = {}
): UseWeatherResult {
  const { enabled = true, forecastDate } = options;

  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cached, setCached] = useState(false);

  const fetchWeather = useCallback(async () => {
    if (!latitude || !longitude || !enabled) {
      return;
    }

    const cacheKey = getCacheKey(latitude, longitude);

    // Check client-side cache first
    const clientCached = clientCache.get(cacheKey);
    if (clientCached && Date.now() - clientCached.timestamp < CLIENT_CACHE_TTL) {
      setWeather(clientCached.weather);
      setCached(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: {
          latitude,
          longitude,
          forecast_date: forecastDate,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.success && data?.weather) {
        setWeather(data.weather);
        setCached(data.cached || false);

        // Store in client cache
        clientCache.set(cacheKey, {
          weather: data.weather,
          timestamp: Date.now(),
        });
      } else if (data?.weather) {
        // Fallback weather (from error response)
        setWeather(data.weather);
        setCached(false);
      } else {
        throw new Error(data?.error || 'Failed to fetch weather');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));

      // Set fallback weather for graceful degradation
      setWeather({
        condition: 'cloudy',
        temperature: 15,
        temperatureUnit: 'C',
        humidity: 50,
        windSpeed: 10,
        windUnit: 'km/h',
        precipitation: 0,
        uvIndex: 3,
        description: 'Weather unavailable',
        icon: 'https://openweathermap.org/img/wn/03d@2x.png',
        recommendation: 'Unable to load weather',
      });
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, enabled, forecastDate]);

  useEffect(() => {
    if (latitude && longitude && enabled) {
      fetchWeather();
    }
  }, [latitude, longitude, enabled, fetchWeather]);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
    cached,
  };
}

// Batch weather fetch for multiple locations
export async function fetchWeatherBatch(
  locations: Array<{ id: string; latitude: number; longitude: number }>
): Promise<Map<string, WeatherInfo>> {
  const results = new Map<string, WeatherInfo>();
  const uniqueLocations = new Map<string, { id: string; lat: number; lng: number }>();

  // Deduplicate by rounded coordinates
  for (const loc of locations) {
    const cacheKey = getCacheKey(loc.latitude, loc.longitude);
    if (!uniqueLocations.has(cacheKey)) {
      uniqueLocations.set(cacheKey, {
        id: loc.id,
        lat: loc.latitude,
        lng: loc.longitude,
      });
    }
  }

  // Fetch weather for unique locations (with rate limiting)
  const fetchPromises = Array.from(uniqueLocations.entries()).map(
    async ([cacheKey, loc], index) => {
      // Stagger requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 100));

      // Check client cache first
      const clientCached = clientCache.get(cacheKey);
      if (clientCached && Date.now() - clientCached.timestamp < CLIENT_CACHE_TTL) {
        return { cacheKey, weather: clientCached.weather };
      }

      try {
        const { data } = await supabase.functions.invoke('get-weather', {
          body: { latitude: loc.lat, longitude: loc.lng },
        });

        if (data?.weather) {
          clientCache.set(cacheKey, {
            weather: data.weather,
            timestamp: Date.now(),
          });
          return { cacheKey, weather: data.weather };
        }
      } catch (e) {
        console.error(`Failed to fetch weather for ${cacheKey}:`, e);
      }
      return { cacheKey, weather: null };
    }
  );

  const responses = await Promise.all(fetchPromises);

  // Map results back to original location IDs
  for (const loc of locations) {
    const cacheKey = getCacheKey(loc.latitude, loc.longitude);
    const response = responses.find(r => r.cacheKey === cacheKey);
    if (response?.weather) {
      results.set(loc.id, response.weather);
    }
  }

  return results;
}

// Get weather icon component class
export function getWeatherIconClass(condition: WeatherInfo['condition']): string {
  const iconMap: Record<WeatherInfo['condition'], string> = {
    sunny: 'text-yellow-500',
    cloudy: 'text-gray-400',
    partly_cloudy: 'text-blue-300',
    rainy: 'text-blue-500',
    snowy: 'text-blue-200',
    stormy: 'text-purple-500',
    hot: 'text-orange-500',
    cold: 'text-cyan-500',
  };
  return iconMap[condition] || 'text-gray-400';
}

// Get weather background gradient
export function getWeatherGradient(condition: WeatherInfo['condition']): string {
  const gradients: Record<WeatherInfo['condition'], string> = {
    sunny: 'from-yellow-400/20 to-orange-400/20',
    cloudy: 'from-gray-300/20 to-gray-400/20',
    partly_cloudy: 'from-blue-200/20 to-gray-300/20',
    rainy: 'from-blue-400/20 to-blue-600/20',
    snowy: 'from-blue-100/20 to-white/20',
    stormy: 'from-purple-500/20 to-gray-600/20',
    hot: 'from-orange-400/20 to-red-400/20',
    cold: 'from-cyan-300/20 to-blue-300/20',
  };
  return gradients[condition] || 'from-gray-200/20 to-gray-300/20';
}

export default useWeather;
