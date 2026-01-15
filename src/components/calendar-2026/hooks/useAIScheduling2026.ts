// AI Scheduling Hook for Calendar 2026
// Intelligent scheduling with Gemini AI

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addMinutes, differenceInMinutes, isSameDay, areIntervalsOverlapping } from 'date-fns';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';
import type { AIReasoning, ReasoningFactor, AlternativeSlot, RouteOptimization, MapJob } from '../types';

interface UseAIScheduling2026Props {
  events: CalendarEvent[];
  resources: CalendarResource[];
  businessHours?: {
    start: string;
    end: string;
  };
}

interface SchedulingContext {
  date: Date;
  duration: number; // minutes
  jobType?: string;
  clientId?: string;
  preferredTechnicianId?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
}

export function useAIScheduling2026({
  events,
  resources,
  businessHours = { start: '08:00', end: '18:00' },
}: UseAIScheduling2026Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find optimal slot with AI reasoning
  const findOptimalSlot = useCallback(
    async (context: SchedulingContext): Promise<AIReasoning | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { date, duration, jobType, clientId, preferredTechnicianId, preferredTimeOfDay } = context;

        // Get available slots for each technician
        const availableSlots: Array<{
          technician: CalendarResource;
          slot: TimeRange;
          score: number;
          factors: ReasoningFactor[];
        }> = [];

        for (const tech of resources) {
          const techEvents = events.filter(
            (e) => e.resourceId === tech.id && isSameDay(new Date(e.start), date)
          );

          // Generate time slots
          const slots = generateTimeSlots(date, businessHours, duration);

          for (const slot of slots) {
            // Check if slot is free
            const isConflict = techEvents.some((e) =>
              areIntervalsOverlapping(
                { start: slot.start, end: slot.end },
                { start: new Date(e.start), end: new Date(e.end) }
              )
            );

            if (isConflict) continue;

            // Calculate score
            const { score, factors } = calculateSlotScore({
              slot,
              technician: tech,
              techEvents,
              preferredTechnicianId,
              preferredTimeOfDay,
              jobType,
            });

            availableSlots.push({
              technician: tech,
              slot,
              score,
              factors,
            });
          }
        }

        // Sort by score
        availableSlots.sort((a, b) => b.score - a.score);

        if (availableSlots.length === 0) {
          return null;
        }

        const best = availableSlots[0];
        const alternatives = availableSlots
          .slice(1, 4)
          .map((alt) => ({
            slot: alt.slot,
            technician: alt.technician,
            score: alt.score,
            tradeoff: generateTradeoffText(best, alt),
          }));

        return {
          slot: best.slot,
          technician: best.technician,
          totalScore: best.score,
          factors: best.factors,
          alternatives,
        };
      } catch (err) {
        console.error('AI Scheduling error:', err);
        setError(err instanceof Error ? err.message : 'Failed to find optimal slot');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [events, resources, businessHours]
  );

  // Auto-schedule multiple jobs
  const autoScheduleJobs = useCallback(
    async (
      unassignedJobs: Array<{
        id: string;
        duration: number;
        jobType?: string;
        clientId?: string;
      }>,
      targetDate: Date
    ) => {
      setIsLoading(true);
      const results: Array<{
        jobId: string;
        success: boolean;
        slot?: TimeRange;
        technicianId?: string;
        error?: string;
      }> = [];

      for (const job of unassignedJobs) {
        const reasoning = await findOptimalSlot({
          date: targetDate,
          duration: job.duration,
          jobType: job.jobType,
          clientId: job.clientId,
        });

        if (reasoning) {
          results.push({
            jobId: job.id,
            success: true,
            slot: reasoning.slot,
            technicianId: reasoning.technician.id,
          });

          // Add to events to prevent conflicts for next iteration
          events.push({
            id: `temp-${job.id}`,
            title: 'Scheduled Job',
            start: reasoning.slot.start,
            end: reasoning.slot.end,
            resourceId: reasoning.technician.id,
            status: 'scheduled',
          });
        } else {
          results.push({
            jobId: job.id,
            success: false,
            error: 'No available slot found',
          });
        }
      }

      setIsLoading(false);
      return results;
    },
    [findOptimalSlot, events]
  );

  // Optimize routes for a day
  const optimizeRoutes = useCallback(
    async (
      technicianId: string,
      date: Date,
      jobCoordinates: Map<string, { lat: number; lng: number }>
    ): Promise<RouteOptimization | null> => {
      setIsLoading(true);

      try {
        const techEvents = events
          .filter((e) => e.resourceId === technicianId && isSameDay(new Date(e.start), date))
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        if (techEvents.length < 2) {
          return null;
        }

        // Create MapJobs
        const originalRoute: MapJob[] = techEvents.map((event, index) => {
          const coords = jobCoordinates.get(event.id) || { lat: 0, lng: 0 };
          return {
            id: event.id,
            event,
            coordinates: coords,
            address: event.extendedProps?.address || '',
            routeOrder: index,
          };
        });

        // Use Gemini to optimize (or implement TSP algorithm locally)
        // For now, use a simple nearest-neighbor heuristic
        const optimizedRoute = optimizeWithNearestNeighbor(originalRoute);

        // Calculate savings
        const originalDistance = calculateTotalDistance(originalRoute);
        const optimizedDistance = calculateTotalDistance(optimizedRoute);
        const distanceSaved = originalDistance - optimizedDistance;

        // Estimate time saved (assuming 30 km/h average in city)
        const timeSaved = Math.round((distanceSaved / 30) * 60);

        return {
          originalRoute,
          optimizedRoute,
          timeSaved,
          distanceSaved,
        };
      } catch (err) {
        console.error('Route optimization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to optimize routes');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  // Get AI-suggested time slots for highlighting
  const getHighlightedSlots = useCallback(
    (date: Date, duration: number = 60): TimeRange[] => {
      const slots = generateTimeSlots(date, businessHours, duration);
      const highlighted: TimeRange[] = [];

      for (const slot of slots) {
        // Check if at least one technician is available
        const hasAvailability = resources.some((tech) => {
          const techEvents = events.filter(
            (e) => e.resourceId === tech.id && isSameDay(new Date(e.start), date)
          );

          return !techEvents.some((e) =>
            areIntervalsOverlapping(
              { start: slot.start, end: slot.end },
              { start: new Date(e.start), end: new Date(e.end) }
            )
          );
        });

        if (hasAvailability) {
          highlighted.push(slot);
        }
      }

      // Return top 5 slots
      return highlighted.slice(0, 5);
    },
    [events, resources, businessHours]
  );

  return {
    findOptimalSlot,
    autoScheduleJobs,
    optimizeRoutes,
    getHighlightedSlots,
    isLoading,
    error,
  };
}

// Helper: Generate time slots for a day
function generateTimeSlots(
  date: Date,
  businessHours: { start: string; end: string },
  duration: number
): TimeRange[] {
  const slots: TimeRange[] = [];
  const [startHour, startMin] = businessHours.start.split(':').map(Number);
  const [endHour, endMin] = businessHours.end.split(':').map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startHour, startMin, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMin, 0, 0);

  let current = new Date(dayStart);
  while (addMinutes(current, duration) <= dayEnd) {
    slots.push({
      start: new Date(current),
      end: addMinutes(current, duration),
    });
    current = addMinutes(current, 30); // 30 min intervals
  }

  return slots;
}

// Helper: Calculate slot score
function calculateSlotScore(params: {
  slot: TimeRange;
  technician: CalendarResource;
  techEvents: CalendarEvent[];
  preferredTechnicianId?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  jobType?: string;
}): { score: number; factors: ReasoningFactor[] } {
  const { slot, technician, techEvents, preferredTechnicianId, preferredTimeOfDay } = params;
  const factors: ReasoningFactor[] = [];
  let totalScore = 0;

  // Factor 1: Technician preference (0-25 points)
  const techScore = preferredTechnicianId === technician.id ? 25 : 15;
  factors.push({
    name: 'Technician Match',
    score: techScore,
    maxScore: 25,
    explanation: preferredTechnicianId === technician.id
      ? 'Preferred technician selected'
      : 'Available technician',
    icon: 'user',
  });
  totalScore += techScore;

  // Factor 2: Time of day preference (0-25 points)
  const hour = slot.start.getHours();
  let timeScore = 15;
  let timeExplanation = 'Standard time slot';

  if (preferredTimeOfDay === 'morning' && hour < 12) {
    timeScore = 25;
    timeExplanation = 'Morning slot as preferred';
  } else if (preferredTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) {
    timeScore = 25;
    timeExplanation = 'Afternoon slot as preferred';
  } else if (preferredTimeOfDay === 'evening' && hour >= 17) {
    timeScore = 25;
    timeExplanation = 'Evening slot as preferred';
  }

  factors.push({
    name: 'Time Preference',
    score: timeScore,
    maxScore: 25,
    explanation: timeExplanation,
    icon: 'clock',
  });
  totalScore += timeScore;

  // Factor 3: Workload balance (0-25 points)
  const jobCount = techEvents.length;
  const workloadScore = jobCount < 4 ? 25 : jobCount < 6 ? 20 : jobCount < 8 ? 15 : 10;
  factors.push({
    name: 'Workload Balance',
    score: workloadScore,
    maxScore: 25,
    explanation: `${jobCount} jobs already scheduled`,
    icon: 'trending-up',
  });
  totalScore += workloadScore;

  // Factor 4: Schedule efficiency (0-25 points)
  // Prefer slots that minimize gaps
  let efficiencyScore = 20;
  if (techEvents.length > 0) {
    const lastEvent = techEvents[techEvents.length - 1];
    const gap = differenceInMinutes(slot.start, new Date(lastEvent.end));
    if (gap >= 0 && gap <= 30) {
      efficiencyScore = 25;
    } else if (gap > 30 && gap <= 60) {
      efficiencyScore = 20;
    } else {
      efficiencyScore = 15;
    }
  }

  factors.push({
    name: 'Schedule Efficiency',
    score: efficiencyScore,
    maxScore: 25,
    explanation: 'Minimizes schedule gaps',
    icon: 'zap',
  });
  totalScore += efficiencyScore;

  return { score: totalScore, factors };
}

// Helper: Generate tradeoff text
function generateTradeoffText(
  best: { technician: CalendarResource; slot: TimeRange; score: number },
  alt: { technician: CalendarResource; slot: TimeRange; score: number }
): string {
  const timeDiff = Math.abs(
    alt.slot.start.getHours() - best.slot.start.getHours()
  );
  const scoreDiff = best.score - alt.score;

  if (alt.technician.id !== best.technician.id) {
    return `Different technician, ${scoreDiff} points lower`;
  }
  if (timeDiff > 2) {
    return `${timeDiff}h ${alt.slot.start.getHours() > best.slot.start.getHours() ? 'later' : 'earlier'}`;
  }
  return `${scoreDiff} points lower score`;
}

// Helper: Nearest neighbor route optimization
function optimizeWithNearestNeighbor(jobs: MapJob[]): MapJob[] {
  if (jobs.length < 2) return jobs;

  const optimized: MapJob[] = [];
  const remaining = [...jobs];

  // Start with first job (assuming it's depot/starting point)
  const first = remaining.shift()!;
  optimized.push({ ...first, routeOrder: 0 });

  while (remaining.length > 0) {
    const last = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(
        last.coordinates.lat,
        last.coordinates.lng,
        remaining[i].coordinates.lat,
        remaining[i].coordinates.lng
      );
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = i;
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0];
    nearest.estimatedTravelTime = Math.round(nearestDistance / 0.5); // ~30km/h
    optimized.push({ ...nearest, routeOrder: optimized.length });
  }

  return optimized;
}

// Helper: Calculate total distance
function calculateTotalDistance(jobs: MapJob[]): number {
  let total = 0;
  for (let i = 0; i < jobs.length - 1; i++) {
    total += haversineDistance(
      jobs[i].coordinates.lat,
      jobs[i].coordinates.lng,
      jobs[i + 1].coordinates.lat,
      jobs[i + 1].coordinates.lng
    );
  }
  return total;
}

// Helper: Haversine distance formula
function haversineDistance(
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
