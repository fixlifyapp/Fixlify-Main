import { supabase } from '@/integrations/supabase/client';

interface WeatherCondition {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  date: Date;
}

interface WeatherForecast {
  current: WeatherCondition;
  forecast: WeatherCondition[];
  location: {
    city: string;
    state: string;
    country: string;
    lat: number;
    lon: number;
  };
}

interface GeocodeResult {
  lat: number;
  lon: number;
  city: string;
  state: string;
  country: string;
}

export class WeatherService {
  private apiKey: string;
  private cacheExpiry = 3600000; // 1 hour in milliseconds

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenWeather API key not configured');
    }
  }

  /**
   * Get weather forecast for a location
   */
  async getWeatherForecast(location: string, daysAhead: number = 1): Promise<WeatherForecast | null> {
    if (!this.apiKey) {
      console.error('Weather API key not configured');
      return null;
    }

    try {
      // Check cache first
      const cached = await this.getCachedWeather(location);
      if (cached) return cached;

      // Geocode the address
      const coords = await this.geocodeAddress(location);
      if (!coords) return null;

      // Fetch weather data
      const weatherData = await this.fetchWeatherData(coords, daysAhead);
      if (!weatherData) return null;

      // Cache the result
      await this.cacheWeatherData(location, weatherData);

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  /**
   * Check if weather conditions match automation trigger
   */
  checkWeatherTrigger(
    forecast: WeatherForecast,
    condition: string,
    temperatureThreshold: number,
    daysAhead: number
  ): boolean {
    // Get the forecast for the specified day
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    const dayForecast = forecast.forecast.find(f => {
      const forecastDate = new Date(f.date);
      return forecastDate.toDateString() === targetDate.toDateString();
    });

    if (!dayForecast) return false;

    switch (condition) {
      case 'extreme_heat':
        return dayForecast.temperature >= temperatureThreshold;
      
      case 'extreme_cold':
        return dayForecast.temperature <= temperatureThreshold;
      
      case 'heavy_rain':
        return dayForecast.condition.toLowerCase().includes('rain') && 
               dayForecast.description.toLowerCase().includes('heavy');
      
      case 'storm':
        return dayForecast.condition.toLowerCase().includes('storm') ||
               dayForecast.condition.toLowerCase().includes('thunder');
      
      default:
        return false;
    }
  }

  /**
   * Get weather data from cache
   */
  private async getCachedWeather(location: string): Promise<WeatherForecast | null> {
    try {
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('location', location.toLowerCase())
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;

      return data.weather_data as WeatherForecast;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Cache weather data
   */
  private async cacheWeatherData(location: string, weatherData: WeatherForecast): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + this.cacheExpiry);

      await supabase
        .from('weather_cache')
        .upsert({
          location: location.toLowerCase(),
          latitude: weatherData.location.lat,
          longitude: weatherData.location.lon,
          weather_data: weatherData,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'location'
        });
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Geocode an address to coordinates
   */
  private async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(address)}&limit=1&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        console.error('No geocoding results found for:', address);
        return null;
      }

      const result = data[0];
      return {
        lat: result.lat,
        lon: result.lon,
        city: result.name || '',
        state: result.state || '',
        country: result.country || ''
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Fetch weather data from API
   */
  private async fetchWeatherData(coords: GeocodeResult, daysAhead: number): Promise<WeatherForecast | null> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=imperial`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.statusText}`);
      }

      const currentData = await currentResponse.json();

      // Get forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=imperial&cnt=${daysAhead * 8}` // 8 forecasts per day (3-hour intervals)
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
      }

      const forecastData = await forecastResponse.json();

      return this.parseWeatherData(currentData, forecastData, coords);
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  /**
   * Parse weather API response
   */
  private parseWeatherData(current: any, forecast: any, coords: GeocodeResult): WeatherForecast {
    // Parse current weather
    const currentCondition: WeatherCondition = {
      temperature: Math.round(current.main.temp),
      condition: current.weather[0].main,
      description: current.weather[0].description,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed),
      date: new Date()
    };

    // Parse forecast - group by day and get daily high
    const dailyForecasts = new Map<string, WeatherCondition>();
    
    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      const existing = dailyForecasts.get(dateKey);
      const temp = Math.round(item.main.temp);
      
      if (!existing || temp > existing.temperature) {
        dailyForecasts.set(dateKey, {
          temperature: temp,
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed),
          date: date
        });
      }
    });

    return {
      current: currentCondition,
      forecast: Array.from(dailyForecasts.values()),
      location: {
        city: coords.city,
        state: coords.state,
        country: coords.country,
        lat: coords.lat,
        lon: coords.lon
      }
    };
  }

  /**
   * Get location string from various sources
   */
  async getLocationForAutomation(
    automationConfig: any,
    clientId?: string,
    userId?: string
  ): Promise<string | null> {
    // 1. Check if automation has specific location
    if (automationConfig?.location) {
      return automationConfig.location;
    }

    // 2. Check if this is client-specific and get client address
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('address, city, state, zip')
        .eq('id', clientId)
        .single();

      if (client?.address && client?.city && client?.state) {
        return `${client.address}, ${client.city}, ${client.state} ${client.zip || ''}`.trim();
      }
    }

    // 3. Fall back to company address
    if (userId) {
      const { data: settings } = await supabase
        .from('company_settings')
        .select('company_address, company_city, company_state, company_zip')
        .eq('user_id', userId)
        .single();

      if (settings?.company_address && settings?.company_city && settings?.company_state) {
        return `${settings.company_address}, ${settings.company_city}, ${settings.company_state} ${settings.company_zip || ''}`.trim();
      }
    }

    return null;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();