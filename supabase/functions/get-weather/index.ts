import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache TTL in hours
const CACHE_TTL_HOURS = 2;

interface WeatherRequest {
  latitude: number;
  longitude: number;
  forecast_date?: string; // YYYY-MM-DD, defaults to today
}

interface WeatherInfo {
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

// Round coordinates to city level (~0.1 degree = ~11km)
function roundToCity(coord: number): number {
  return Math.round(coord * 10) / 10;
}

// Generate cache key from rounded coordinates
function getCacheKey(lat: number, lng: number): string {
  const roundedLat = roundToCity(lat);
  const roundedLng = roundToCity(lng);
  return `coords:${roundedLat}:${roundedLng}`;
}

// Map Google Weather condition codes to our types
function mapGoogleWeatherCondition(weatherCode: string, temp: number): WeatherInfo['condition'] {
  const code = weatherCode?.toUpperCase() || '';

  if (code.includes('THUNDER') || code.includes('STORM')) return 'stormy';
  if (code.includes('RAIN') || code.includes('DRIZZLE') || code.includes('SHOWER')) return 'rainy';
  if (code.includes('SNOW') || code.includes('SLEET') || code.includes('ICE')) return 'snowy';
  if (code.includes('FOG') || code.includes('MIST') || code.includes('HAZE')) return 'cloudy';
  if (code.includes('OVERCAST')) return 'cloudy';
  if (code.includes('PARTLY') || code.includes('MOSTLY_CLOUDY')) return 'partly_cloudy';
  if (code.includes('CLOUDY')) return 'partly_cloudy';
  if (code.includes('CLEAR') || code.includes('SUNNY')) {
    if (temp > 30) return 'hot';
    if (temp < 0) return 'cold';
    return 'sunny';
  }

  // Temperature-based fallback
  if (temp > 30) return 'hot';
  if (temp < 0) return 'cold';
  return 'partly_cloudy';
}

// Get weather recommendation based on conditions
function getRecommendation(condition: WeatherInfo['condition'], temp: number, uvIndex: number): string {
  const recommendations: string[] = [];

  if (condition === 'rainy' || condition === 'stormy') {
    recommendations.push('Bring rain gear');
  }
  if (condition === 'snowy') {
    recommendations.push('Drive carefully, roads may be icy');
  }
  if (condition === 'hot' || temp > 30) {
    recommendations.push('Stay hydrated');
  }
  if (condition === 'cold' || temp < 5) {
    recommendations.push('Dress warmly');
  }
  if (uvIndex > 6) {
    recommendations.push('Wear sunscreen');
  }
  if (uvIndex > 8) {
    recommendations.push('Limit outdoor exposure');
  }

  return recommendations.join('. ') || 'Good conditions for outdoor work';
}

// Get weather icon URL based on condition
function getWeatherIcon(condition: WeatherInfo['condition']): string {
  const iconMap: Record<WeatherInfo['condition'], string> = {
    sunny: '01d',
    cloudy: '03d',
    partly_cloudy: '02d',
    rainy: '10d',
    snowy: '13d',
    stormy: '11d',
    hot: '01d',
    cold: '13d',
  };
  return `https://openweathermap.org/img/wn/${iconMap[condition] || '03d'}@2x.png`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, forecast_date }: WeatherRequest = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const targetDate = forecast_date || new Date().toISOString().split('T')[0];
    const cacheKey = getCacheKey(latitude, longitude);

    console.log(`Weather request: ${cacheKey} for date ${targetDate}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('forecast_date', targetDate)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached && !cacheError) {
      console.log(`Cache HIT for ${cacheKey}`);
      return new Response(
        JSON.stringify({
          success: true,
          weather: cached.weather_data,
          cached: true,
          cache_key: cacheKey,
          fetched_at: cached.fetched_at,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Cache MISS for ${cacheKey}, fetching from API...`);

    // Get Weather API key (prefer dedicated key, fallback to Maps key)
    const googleApiKey = Deno.env.get("GOOGLE_WEATHER_API_KEY") || Deno.env.get("GOOGLE_MAPS_API_KEY");

    let weatherData: WeatherInfo;

    if (googleApiKey) {
      const roundedLat = roundToCity(latitude);
      const roundedLng = roundToCity(longitude);

      // Use Google Weather API (currentConditions endpoint) - GET request with query params
      const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}&location.latitude=${roundedLat}&location.longitude=${roundedLng}&unitsSystem=METRIC`;

      console.log(`Fetching weather from: ${weatherUrl.replace(googleApiKey, 'API_KEY_HIDDEN')}`);

      const response = await fetch(weatherUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Weather API error: ${response.status}`, errorText);
        throw new Error(`Google Weather API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Weather response:', JSON.stringify(data).substring(0, 1000));

      // Parse Google Weather API response
      // Response structure: https://developers.google.com/maps/documentation/weather/reference/rest/v1/currentConditions/lookup
      // temperature: { degrees: number, unit: "CELSIUS"|"FAHRENHEIT" }
      // weatherCondition: { type: "CLEAR"|"CLOUDY"|..., description: { text: string }, iconBaseUri: string }
      // relativeHumidity: number (0-100)
      // uvIndex: number
      // wind: { direction: {...}, speed: { value: number, unit: "METERS_PER_SECOND" }, gust: {...} }

      const temp = Math.round(data.temperature?.degrees ?? 20);
      const weatherType = data.weatherCondition?.type || 'PARTLY_CLOUDY';
      const condition = mapGoogleWeatherCondition(weatherType, temp);
      const uvIndex = data.uvIndex ?? 0;
      const humidity = data.relativeHumidity ?? 50;

      // Wind speed comes in m/s, convert to km/h
      const windSpeedMs = data.wind?.speed?.value ?? 0;
      const windSpeedKmh = Math.round(windSpeedMs * 3.6);

      // Get description text from LocalizedText object
      const descriptionText = data.weatherCondition?.description?.text ||
                              weatherType.replace(/_/g, ' ').toLowerCase();

      // Use Google's weather icon if available
      const googleIconUrl = data.weatherCondition?.iconBaseUri
        ? `${data.weatherCondition.iconBaseUri}.svg`
        : getWeatherIcon(condition);

      weatherData = {
        condition,
        temperature: temp,
        temperatureUnit: 'C',
        feelsLike: Math.round(data.feelsLikeTemperature?.degrees ?? temp),
        humidity,
        windSpeed: windSpeedKmh,
        windUnit: 'km/h',
        precipitation: data.precipitation?.probability?.value ?? 0,
        uvIndex,
        description: descriptionText,
        icon: googleIconUrl,
        visibility: data.visibility?.distance?.value,
        recommendation: getRecommendation(condition, temp, uvIndex),
      };

      // Save to cache
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

      await supabase
        .from('weather_cache')
        .upsert({
          cache_key: cacheKey,
          city_name: null, // Google Weather API doesn't return location name in currentConditions
          latitude: roundedLat,
          longitude: roundedLng,
          weather_data: weatherData,
          forecast_date: targetDate,
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'cache_key',
        });

      console.log(`Weather fetched from Google and cached for ${cacheKey}`);

    } else {
      // No API key configured - return mock data for development
      console.warn("No GOOGLE_MAPS_API_KEY configured, returning mock data");

      weatherData = {
        condition: 'sunny',
        temperature: 22,
        temperatureUnit: 'C',
        feelsLike: 24,
        humidity: 45,
        windSpeed: 12,
        windUnit: 'km/h',
        precipitation: 0,
        uvIndex: 5,
        description: 'Clear sky',
        icon: getWeatherIcon('sunny'),
        visibility: 10,
        recommendation: 'Good conditions for outdoor work',
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather: weatherData,
        cached: false,
        cache_key: cacheKey,
        fetched_at: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Weather API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        // Return fallback weather for graceful degradation
        weather: {
          condition: 'cloudy',
          temperature: 15,
          temperatureUnit: 'C',
          humidity: 50,
          windSpeed: 10,
          windUnit: 'km/h',
          precipitation: 0,
          uvIndex: 3,
          description: 'Weather data unavailable',
          icon: getWeatherIcon('cloudy'),
          recommendation: 'Unable to fetch weather data',
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
