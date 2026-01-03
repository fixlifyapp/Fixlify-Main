import { useMemo } from "react";
import { differenceInMinutes } from "date-fns";
import { CalendarEvent } from "@/components/calendar/CalendarProvider";

export interface TravelGap {
  fromJob: CalendarEvent;
  toJob: CalendarEvent;
  travelMinutes: number; // estimated travel time
  gapMinutes: number; // actual gap between jobs
  isRisky: boolean; // gap < travel time
  isTight: boolean; // gap is barely enough (< travel + 15 min buffer)
  distanceKm: number;
  fromAddress?: string;
  toAddress?: string;
}

export interface TechnicianTravelSummary {
  technicianId: string;
  technicianName?: string;
  totalTravelMinutes: number;
  totalDistanceKm: number;
  riskyGaps: number;
  gaps: TravelGap[];
}

// Haversine formula for calculating distance between two coordinates
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate travel time based on distance (rough: 2 min per km in urban areas)
function estimateTravelTime(distanceKm: number): number {
  // Assuming average speed of 30 km/h in urban areas
  // Plus 5 minutes for parking/walking
  return Math.ceil(distanceKm * 2) + 5;
}

// Parse coordinates from address or extendedProps
function getCoordinates(event: CalendarEvent): { lat: number; lon: number } | null {
  const props = event.extendedProps;

  if (props?.latitude && props?.longitude) {
    return {
      lat: parseFloat(props.latitude),
      lon: parseFloat(props.longitude),
    };
  }

  if (props?.coordinates) {
    return props.coordinates;
  }

  // No coordinates available
  return null;
}

// Calculate distance between two events
function calculateDistance(from: CalendarEvent, to: CalendarEvent): number {
  const fromCoords = getCoordinates(from);
  const toCoords = getCoordinates(to);

  if (fromCoords && toCoords) {
    return calculateHaversineDistance(
      fromCoords.lat,
      fromCoords.lon,
      toCoords.lat,
      toCoords.lon
    );
  }

  // Default estimate if no coordinates (assume 5km average)
  return 5;
}

// Calculate travel gaps for a technician's events
export function calculateTravelGaps(events: CalendarEvent[]): TravelGap[] {
  if (events.length < 2) return [];

  // Sort events by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const gaps: TravelGap[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const gapMinutes = differenceInMinutes(
      new Date(next.start),
      new Date(current.end)
    );

    const distanceKm = calculateDistance(current, next);
    const travelMinutes = estimateTravelTime(distanceKm);

    const isRisky = gapMinutes < travelMinutes;
    const isTight = !isRisky && gapMinutes < travelMinutes + 15;

    gaps.push({
      fromJob: current,
      toJob: next,
      travelMinutes,
      gapMinutes,
      isRisky,
      isTight,
      distanceKm: Math.round(distanceKm * 10) / 10,
      fromAddress: current.extendedProps?.address,
      toAddress: next.extendedProps?.address,
    });
  }

  return gaps;
}

// Hook for calculating travel gaps for all technicians
export function useTravelCalculation(
  events: CalendarEvent[],
  resources: { id: string; title: string }[]
): Map<string, TechnicianTravelSummary> {
  return useMemo(() => {
    const summaryMap = new Map<string, TechnicianTravelSummary>();

    resources.forEach((resource) => {
      const techEvents = events.filter(
        (e) => e.resourceId === resource.id
      );

      const gaps = calculateTravelGaps(techEvents);

      const totalTravelMinutes = gaps.reduce(
        (sum, gap) => sum + gap.travelMinutes,
        0
      );

      const totalDistanceKm = gaps.reduce(
        (sum, gap) => sum + gap.distanceKm,
        0
      );

      const riskyGaps = gaps.filter((g) => g.isRisky).length;

      summaryMap.set(resource.id, {
        technicianId: resource.id,
        technicianName: resource.title,
        totalTravelMinutes,
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        riskyGaps,
        gaps,
      });
    });

    return summaryMap;
  }, [events, resources]);
}

// Get travel summary text
export function getTravelSummaryText(summary: TechnicianTravelSummary): string {
  const hours = Math.floor(summary.totalTravelMinutes / 60);
  const mins = summary.totalTravelMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m driving, ${summary.totalDistanceKm}km`;
  }
  return `${mins}m driving, ${summary.totalDistanceKm}km`;
}
