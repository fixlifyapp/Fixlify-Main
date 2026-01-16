// Map Schedule View - Scheduling on a Map with Route Optimization
// Uses Google Maps for visualization

import * as React from 'react';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  format,
  isSameDay,
} from 'date-fns';
import {
  Route,
  Clock,
  User,
  MapPin,
  Navigation,
  Sparkles,
  ChevronRight,
  Play,
  Loader2,
  CheckCircle2,
  Car,
  Timer,
  Zap,
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  CloudSun,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';
import type { MapJob, RouteOptimization } from '../types';
import { useWeather, type WeatherInfo, getWeatherGradient } from '@/hooks/useWeather';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center: Toronto area
const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832,
};

// Weather icon component
function WeatherIcon({ condition, className }: { condition: WeatherInfo['condition']; className?: string }) {
  const iconMap: Record<WeatherInfo['condition'], React.ReactNode> = {
    sunny: <Sun className={cn("text-yellow-500", className)} />,
    cloudy: <Cloud className={cn("text-gray-400", className)} />,
    partly_cloudy: <CloudSun className={cn("text-blue-300", className)} />,
    rainy: <CloudRain className={cn("text-blue-500", className)} />,
    snowy: <Snowflake className={cn("text-blue-200", className)} />,
    stormy: <CloudLightning className={cn("text-purple-500", className)} />,
    hot: <Sun className={cn("text-orange-500", className)} />,
    cold: <Snowflake className={cn("text-cyan-500", className)} />,
  };
  return iconMap[condition] || <Cloud className={cn("text-gray-400", className)} />;
}

// Weather widget for the map overlay
function WeatherWidget({ weather, loading }: { weather: WeatherInfo | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
        <span className="text-sm text-muted-foreground">Loading weather...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border",
        `bg-gradient-to-r ${getWeatherGradient(weather.condition)}`
      )}
    >
      <div className="flex items-center gap-3">
        <WeatherIcon condition={weather.condition} className="h-8 w-8" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{weather.temperature}°{weather.temperatureUnit}</span>
            <span className="text-sm text-muted-foreground capitalize">{weather.description}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weather.windSpeed} {weather.windUnit}
            </span>
            {weather.uvIndex > 0 && (
              <span className="flex items-center gap-1">
                <Sun className="h-3 w-3" />
                UV {weather.uvIndex}
              </span>
            )}
          </div>
        </div>
      </div>
      {weather.recommendation && (
        <p className="text-xs text-violet-600 mt-2 font-medium">{weather.recommendation}</p>
      )}
    </motion.div>
  );
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

interface MapScheduleViewProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  currentDate: Date;
  selectedResourceId?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onOptimizeRoutes?: () => Promise<RouteOptimization>;
  onReorderRoute?: (eventIds: string[]) => void;
  googleMapsApiKey?: string;
}

// Google Maps component with job markers
function GoogleMapsView({
  jobs,
  selectedJobId,
  onJobSelect,
  showRoute,
  optimizedOrder,
}: {
  jobs: MapJob[];
  selectedJobId?: string;
  onJobSelect: (jobId: string) => void;
  showRoute: boolean;
  optimizedOrder?: string[];
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const [infoWindowJobId, setInfoWindowJobId] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Fit bounds to show all markers
    if (jobs.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      jobs.forEach((job) => {
        bounds.extend({ lat: job.coordinates.lat, lng: job.coordinates.lng });
      });
      map.fitBounds(bounds, 50);
    }
  }, [jobs]);

  // Get route path for polyline
  const routePath = useMemo(() => {
    if (!showRoute || jobs.length < 2) return [];

    const orderedJobs = optimizedOrder
      ? optimizedOrder.map(id => jobs.find(j => j.id === id)).filter(Boolean) as MapJob[]
      : jobs;

    return orderedJobs.map((job) => ({
      lat: job.coordinates.lat,
      lng: job.coordinates.lng,
    }));
  }, [jobs, showRoute, optimizedOrder]);

  // Create custom marker icon with number
  const getMarkerIcon = (index: number, isSelected: boolean) => {
    const color = isSelected ? '#7c3aed' : '#8b5cf6';
    const textColor = '#ffffff';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: isSelected ? 16 : 12,
      labelOrigin: new google.maps.Point(0, 0),
    };
  };

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading Google Maps</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your API key configuration
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Google Maps API Key not configured</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add VITE_GOOGLE_MAPS_API_KEY to your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={jobs.length > 0 ? jobs[0].coordinates : defaultCenter}
      zoom={12}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {/* Route polyline */}
      {showRoute && routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#8b5cf6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            geodesic: true,
          }}
        />
      )}

      {/* Job markers */}
      {jobs.map((job, index) => {
        const isSelected = job.id === selectedJobId;
        const orderIndex = optimizedOrder?.indexOf(job.id) ?? index;

        return (
          <Marker
            key={job.id}
            position={{ lat: job.coordinates.lat, lng: job.coordinates.lng }}
            icon={getMarkerIcon(orderIndex, isSelected)}
            label={{
              text: String(orderIndex + 1),
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: isSelected ? '14px' : '11px',
            }}
            onClick={() => {
              onJobSelect(job.id);
              setInfoWindowJobId(job.id);
            }}
            zIndex={isSelected ? 1000 : index}
          />
        );
      })}

      {/* Info Window for selected job */}
      {infoWindowJobId && (() => {
        const job = jobs.find(j => j.id === infoWindowJobId);
        if (!job) return null;

        return (
          <InfoWindow
            position={{ lat: job.coordinates.lat, lng: job.coordinates.lng }}
            onCloseClick={() => setInfoWindowJobId(null)}
          >
            <div className="p-2 min-w-[200px]">
              <p className="font-semibold">{job.event.title}</p>
              <p className="text-sm text-gray-600">{job.event.extendedProps?.clientName}</p>
              <p className="text-xs text-gray-500 mt-1">{job.address}</p>
              <p className="text-xs text-violet-600 mt-1">
                {format(new Date(job.event.start), 'h:mm a')}
              </p>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}

export function MapScheduleView({
  events,
  resources,
  currentDate,
  selectedResourceId,
  onEventClick,
  onOptimizeRoutes,
  onReorderRoute,
  googleMapsApiKey,
}: MapScheduleViewProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<RouteOptimization | null>(null);
  const [showRoute, setShowRoute] = useState(true);

  // Fetch weather for the default center (will use server-side cache)
  const { weather, loading: weatherLoading } = useWeather(defaultCenter.lat, defaultCenter.lng);

  // Filter events for current date and selected resource
  const todaysJobs = useMemo(() => {
    return events
      .filter((e) => {
        const matchesDate = isSameDay(new Date(e.start), currentDate);
        const matchesResource = selectedResourceId ? e.resourceId === selectedResourceId : true;
        return matchesDate && matchesResource;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, currentDate, selectedResourceId]);

  // Convert events to MapJobs - use real coordinates from job/property data
  const mapJobs: MapJob[] = useMemo(() => {
    return todaysJobs.map((event, index) => {
      // Get coordinates from extendedProps (populated from job.latitude/longitude)
      const lat = event.extendedProps?.latitude;
      const lng = event.extendedProps?.longitude;

      // Use real coordinates if available, otherwise fallback to Toronto area with offset
      // The offset ensures jobs without coords don't all stack on the same point
      const hasRealCoords = typeof lat === 'number' && typeof lng === 'number';

      return {
        id: event.id,
        event,
        coordinates: {
          lat: hasRealCoords ? lat : defaultCenter.lat + (index * 0.01) - 0.025,
          lng: hasRealCoords ? lng : defaultCenter.lng + (index * 0.01) - 0.025,
        },
        address: event.extendedProps?.address || 'Address not set',
        routeOrder: index,
        hasRealCoordinates: hasRealCoords, // Track if we have real geocoded coordinates
      };
    });
  }, [todaysJobs]);

  const selectedJob = mapJobs.find((j) => j.id === selectedJobId);
  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  // Handle route optimization
  const handleOptimize = async () => {
    if (!onOptimizeRoutes) return;

    setIsOptimizing(true);
    try {
      const result = await onOptimizeRoutes();
      setOptimization(result);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Get current route order
  const optimizedOrder = optimization?.optimizedRoute.map((j) => j.id);

  // Calculate stats
  const totalJobs = mapJobs.length;
  const estimatedDriveTime = optimization?.optimizedRoute.reduce(
    (sum, job) => sum + (job.estimatedTravelTime || 0),
    0
  ) || mapJobs.length * 15; // Fallback: 15 min average

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Map Area */}
      <div className="flex-1 relative">
        <GoogleMapsView
          jobs={mapJobs}
          selectedJobId={selectedJobId || undefined}
          onJobSelect={setSelectedJobId}
          showRoute={showRoute}
          optimizedOrder={optimizedOrder}
        />

        {/* Weather Widget */}
        <div className="absolute top-4 right-4 z-10">
          <WeatherWidget weather={weather} loading={weatherLoading} />
        </div>

        {/* Map Overlay Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing || mapJobs.length < 2}
            className="bg-violet-600 hover:bg-violet-700 shadow-lg"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Routes
              </>
            )}
          </Button>

          <Button
            variant={showRoute ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRoute(!showRoute)}
            className="shadow-lg"
          >
            <Route className="mr-2 h-4 w-4" />
            {showRoute ? 'Hide Route' : 'Show Route'}
          </Button>
        </div>

        {/* Optimization Result */}
        <AnimatePresence>
          {optimization && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800">Route Optimized!</p>
                      <p className="text-sm text-emerald-600">
                        Save {optimization.timeSaved} min & {optimization.distanceSaved.toFixed(1)} km
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onReorderRoute?.(optimizedOrder || [])}
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel */}
      <div className="w-80 flex flex-col">
        {/* Stats Card */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {selectedResource ? (
                <>
                  <User className="h-4 w-4" />
                  {selectedResource.title}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  All Technicians
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-2xl font-bold text-violet-600">{totalJobs}</p>
                <p className="text-xs text-muted-foreground">Jobs Today</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center">
                <p className="text-2xl font-bold text-violet-600">{estimatedDriveTime}</p>
                <p className="text-xs text-muted-foreground">Drive Time (min)</p>
              </div>
            </div>
            {/* Weather Summary */}
            {weather && (
              <div className={cn(
                "mt-3 rounded-lg p-3 flex items-center gap-3",
                `bg-gradient-to-r ${getWeatherGradient(weather.condition)}`
              )}>
                <WeatherIcon condition={weather.condition} className="h-6 w-6" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {weather.temperature}°{weather.temperatureUnit} - {weather.description}
                  </p>
                  {weather.recommendation && (
                    <p className="text-xs text-muted-foreground">{weather.recommendation}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job List */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Route Order</span>
              <Badge variant="outline">{mapJobs.length} stops</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {(optimization?.optimizedRoute || mapJobs).map((job, index) => {
                  const mapJob = 'event' in job ? job : mapJobs.find(j => j.id === (job as MapJob).id);
                  if (!mapJob) return null;

                  const event = mapJob.event;
                  const isSelected = mapJob.id === selectedJobId;

                  return (
                    <motion.div
                      key={mapJob.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedJobId(mapJob.id);
                        onEventClick?.(event);
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        isSelected
                          ? "bg-violet-50 border border-violet-200"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      {/* Order Number */}
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          isSelected
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {index + 1}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.extendedProps?.clientName}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start), 'h:mm a')}
                          </span>
                          {mapJob.estimatedTravelTime && (
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {mapJob.estimatedTravelTime} min
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Job Details */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{selectedJob.event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedJob.event.extendedProps?.clientName || 'No client'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedJob.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedJob.event.start), 'h:mm a')} -{' '}
                      {format(new Date(selectedJob.event.end), 'h:mm a')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Start Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
