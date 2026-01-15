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
} from 'lucide-react';
import type { CalendarEvent, CalendarResource } from '../../calendar/CalendarProvider';
import type { MapJob, RouteOptimization } from '../types';

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

// Placeholder map component (replace with actual Google Maps implementation)
function MapPlaceholder({
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
  // In production, this would be replaced with actual Google Maps implementation
  // using @react-google-maps/api

  return (
    <div className="relative h-full bg-slate-100 rounded-lg overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300">
        <svg className="w-full h-full opacity-20">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Job Markers */}
      <div className="absolute inset-0 p-8">
        {jobs.map((job, index) => {
          const isSelected = job.id === selectedJobId;
          const orderIndex = optimizedOrder?.indexOf(job.id) ?? index;

          // Simple positioning (in production, use actual coordinates)
          const x = 15 + (index % 4) * 20;
          const y = 20 + Math.floor(index / 4) * 25;

          return (
            <motion.div
              key={job.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onJobSelect(job.id)}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex items-center justify-center",
                  "w-10 h-10 rounded-full shadow-lg",
                  isSelected
                    ? "bg-violet-600 ring-4 ring-violet-200"
                    : "bg-white border-2 border-violet-500"
                )}
              >
                {showRoute && optimizedOrder ? (
                  <span className={cn(
                    "font-bold",
                    isSelected ? "text-white" : "text-violet-600"
                  )}>
                    {orderIndex + 1}
                  </span>
                ) : (
                  <MapPin
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-white" : "text-violet-600"
                    )}
                  />
                )}
              </motion.div>

              {/* Connecting Lines */}
              {showRoute && optimizedOrder && orderIndex < jobs.length - 1 && (
                <svg
                  className="absolute top-5 left-10 w-32 h-8 pointer-events-none overflow-visible"
                >
                  <motion.path
                    d="M 0 0 Q 60 -20 120 0"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  />
                </svg>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Map Attribution Placeholder */}
      <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-white/80 px-2 py-1 rounded">
        Map data placeholder - integrate Google Maps
      </div>
    </div>
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

  // Convert events to MapJobs
  const mapJobs: MapJob[] = useMemo(() => {
    return todaysJobs.map((event, index) => ({
      id: event.id,
      event,
      coordinates: {
        // Placeholder coordinates - in production, geocode from address
        lat: 43.65 + Math.random() * 0.1,
        lng: -79.38 + Math.random() * 0.1,
      },
      address: event.extendedProps?.address || 'Address not set',
      routeOrder: index,
    }));
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
        <MapPlaceholder
          jobs={mapJobs}
          selectedJobId={selectedJobId || undefined}
          onJobSelect={setSelectedJobId}
          showRoute={showRoute}
          optimizedOrder={optimizedOrder}
        />

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

// Missing import
import { Calendar } from 'lucide-react';
