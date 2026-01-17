// AI Scheduling Hook for Calendar 2026
// Intelligent scheduling with Gemini AI + local fallback

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addMinutes, differenceInMinutes, isSameDay, areIntervalsOverlapping, format } from 'date-fns';
import type { CalendarEvent, CalendarResource, TimeRange } from '../../calendar/CalendarProvider';
import type { AIReasoning, ReasoningFactor, RouteOptimization, MapJob, SchedulingInsight } from '../types';

interface UseAIScheduling2026Props {
  events: CalendarEvent[];
  resources: CalendarResource[];
  businessHours?: {
    start: string;
    end: string;
  };
  useGemini?: boolean; // Enable/disable Gemini AI (defaults to true)
}

interface SchedulingContext {
  date: Date;
  duration: number; // minutes
  jobType?: string;
  clientId?: string;
  clientName?: string;
  address?: string;
  preferredTechnicianId?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  requiredSkills?: string[];
}

interface GeminiSlotRecommendation {
  recommendedSlot: {
    start: string;
    end: string;
    technicianId: string;
    technicianName: string;
  };
  score: number;
  reasoning: string[];
  alternatives: Array<{
    slot: { start: string; end: string; technicianId: string; technicianName: string };
    score: number;
    tradeoff: string;
  }>;
  warnings: string[];
}

interface GeminiRouteOptimization {
  optimizedOrder: string[];
  originalDistance: number;
  optimizedDistance: number;
  distanceSaved: number;
  timeSaved: number;
  routeDetails: Array<{
    jobId: string;
    order: number;
    estimatedArrival: string;
    travelTimeFromPrevious: number;
  }>;
  suggestions: string[];
}

interface GeminiInsights {
  insights: SchedulingInsight[];
  scheduleHealth: {
    score: number;
    factors: {
      workloadBalance: number;
      routeEfficiency: number;
      utilizationRate: number;
    };
  };
  summary: string;
}

export function useAIScheduling2026({
  events,
  resources,
  businessHours = { start: '08:00', end: '18:00' },
  useGemini = true,
}: UseAIScheduling2026Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Generate time slots for a day
  const generateTimeSlots = useCallback((
    date: Date,
    duration: number
  ): TimeRange[] => {
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
  }, [businessHours]);

  // Helper: Get available slots for all technicians
  const getAvailableSlots = useCallback((
    date: Date,
    duration: number
  ): Array<{ slot: TimeRange; technician: CalendarResource }> => {
    const timeSlots = generateTimeSlots(date, duration);
    const availableSlots: Array<{ slot: TimeRange; technician: CalendarResource }> = [];

    for (const tech of resources) {
      const techEvents = events.filter(
        (e) => e.resourceId === tech.id && isSameDay(new Date(e.start), date)
      );

      for (const slot of timeSlots) {
        const isConflict = techEvents.some((e) =>
          areIntervalsOverlapping(
            { start: slot.start, end: slot.end },
            { start: new Date(e.start), end: new Date(e.end) }
          )
        );

        if (!isConflict) {
          availableSlots.push({
            slot: { start: slot.start, end: slot.end },
            technician: tech,
          });
        }
      }
    }

    return availableSlots;
  }, [events, resources, generateTimeSlots]);

  // Local fallback for finding optimal slot
  const findOptimalSlotLocal = useCallback((
    context: SchedulingContext,
    availableSlots: Array<{ slot: TimeRange; technician: CalendarResource }>
  ): AIReasoning | null => {
    const { date, preferredTechnicianId, preferredTimeOfDay } = context;

    // Score each slot
    const scoredSlots = availableSlots.map(({ slot, technician }) => {
      const techEvents = events.filter(
        (e) => e.resourceId === technician.id && isSameDay(new Date(e.start), date)
      );

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
      let efficiencyScore = 20;
      if (techEvents.length > 0) {
        const sortedEvents = [...techEvents].sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );
        const lastEvent = sortedEvents[sortedEvents.length - 1];
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

      return {
        slot,
        technician,
        totalScore,
        factors,
      };
    });

    // Sort by score
    scoredSlots.sort((a, b) => b.totalScore - a.totalScore);

    if (scoredSlots.length === 0) {
      return null;
    }

    const best = scoredSlots[0];
    const alternatives = scoredSlots.slice(1, 4).map((alt) => ({
      slot: alt.slot,
      technician: alt.technician,
      score: alt.totalScore,
      tradeoff: generateTradeoffText(best, alt),
    }));

    return {
      slot: best.slot,
      technician: best.technician,
      totalScore: best.totalScore,
      factors: best.factors,
      alternatives,
      aiPowered: false,
    };
  }, [events]);

  // Find optimal slot using Gemini AI (with local fallback)
  const findOptimalSlot = useCallback(
    async (context: SchedulingContext): Promise<AIReasoning | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { date, duration, preferredTechnicianId, preferredTimeOfDay, clientName, address, priority, requiredSkills, jobType } = context;

        // Get available slots
        const availableSlots = getAvailableSlots(date, duration);

        if (availableSlots.length === 0) {
          setError('No available slots found for this date');
          return null;
        }

        // Try Gemini AI first
        if (useGemini) {
          try {
            const { data, error: fnError } = await supabase.functions.invoke('gemini-schedule', {
              body: {
                action: 'find_optimal_slot',
                jobToSchedule: {
                  id: 'new-job',
                  title: jobType || 'Service Call',
                  clientName,
                  address,
                  duration,
                  priority,
                  requiredSkills,
                },
                preferredDate: format(date, 'yyyy-MM-dd'),
                preferredTimeOfDay,
                preferredTechnicianId,
                technicians: resources.map(r => ({
                  id: r.id,
                  name: r.title,
                  workload: events.filter(e => e.resourceId === r.id && isSameDay(new Date(e.start), date))
                    .reduce((sum, e) => sum + differenceInMinutes(new Date(e.end), new Date(e.start)), 0) / 60,
                })),
                availableSlots: availableSlots.slice(0, 30).map(s => ({
                  start: s.slot.start.toISOString(),
                  end: s.slot.end.toISOString(),
                  technicianId: s.technician.id,
                  technicianName: s.technician.title,
                })),
                skip_credits: false,
              },
            });

            if (!fnError && data?.success && data.result?.recommendedSlot) {
              const result = data.result as GeminiSlotRecommendation;

              // Map Gemini response to AIReasoning format
              const technician = resources.find(r => r.id === result.recommendedSlot.technicianId);

              return {
                slot: {
                  start: new Date(result.recommendedSlot.start),
                  end: new Date(result.recommendedSlot.end),
                },
                technician: technician || { id: result.recommendedSlot.technicianId, title: result.recommendedSlot.technicianName },
                totalScore: result.score,
                factors: result.reasoning.map((reason, i) => ({
                  name: `AI Factor ${i + 1}`,
                  score: Math.round(result.score / result.reasoning.length),
                  maxScore: 25,
                  explanation: reason,
                  icon: i === 0 ? 'sparkles' : i === 1 ? 'clock' : i === 2 ? 'user' : 'zap',
                })),
                alternatives: result.alternatives.map(alt => ({
                  slot: {
                    start: new Date(alt.slot.start),
                    end: new Date(alt.slot.end),
                  },
                  technician: resources.find(r => r.id === alt.slot.technicianId) ||
                    { id: alt.slot.technicianId, title: alt.slot.technicianName },
                  score: alt.score,
                  tradeoff: alt.tradeoff,
                })),
                aiPowered: true,
                warnings: result.warnings,
              };
            }
          } catch (aiError) {
            console.warn('Gemini AI failed, using local fallback:', aiError);
          }
        }

        // Local fallback algorithm
        return findOptimalSlotLocal(context, availableSlots);
      } catch (err) {
        console.error('AI Scheduling error:', err);
        setError(err instanceof Error ? err.message : 'Failed to find optimal slot');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [events, resources, useGemini, getAvailableSlots, findOptimalSlotLocal]
  );

  // Auto-schedule multiple jobs using Gemini AI
  const autoScheduleJobs = useCallback(
    async (
      unassignedJobs: Array<{
        id: string;
        title?: string;
        duration: number;
        jobType?: string;
        clientId?: string;
        clientName?: string;
        address?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
      }>,
      targetDate: Date
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Try Gemini AI first
        if (useGemini) {
          try {
            const { data, error: fnError } = await supabase.functions.invoke('gemini-schedule', {
              body: {
                action: 'auto_schedule',
                existingJobs: unassignedJobs.map(j => ({
                  id: j.id,
                  title: j.title || j.jobType || 'Service Call',
                  duration: j.duration,
                  clientName: j.clientName,
                  address: j.address,
                  priority: j.priority || 'normal',
                })),
                technicians: resources.map(r => ({
                  id: r.id,
                  name: r.title,
                  workload: events.filter(e => e.resourceId === r.id && isSameDay(new Date(e.start), targetDate))
                    .reduce((sum, e) => sum + differenceInMinutes(new Date(e.end), new Date(e.start)), 0) / 60,
                })),
                preferredDate: format(targetDate, 'yyyy-MM-dd'),
                skip_credits: false,
              },
            });

            if (!fnError && data?.success && data.result?.assignments) {
              return {
                results: data.result.assignments.map((a: { jobId: string; technicianId: string; suggestedStart: string; suggestedEnd: string; confidence: number }) => ({
                  jobId: a.jobId,
                  success: true,
                  slot: { start: new Date(a.suggestedStart), end: new Date(a.suggestedEnd) },
                  technicianId: a.technicianId,
                  confidence: a.confidence,
                })),
                unassignable: data.result.unassignable || [],
                summary: data.result.summary,
                aiPowered: true,
              };
            }
          } catch (aiError) {
            console.warn('Gemini auto-schedule failed, using local fallback:', aiError);
          }
        }

        // Local fallback - schedule one by one
        const results: Array<{
          jobId: string;
          success: boolean;
          slot?: TimeRange;
          technicianId?: string;
          error?: string;
        }> = [];

        const tempEvents = [...events];

        for (const job of unassignedJobs) {
          // Get available slots for this iteration
          const currentAvailableSlots = getAvailableSlots(targetDate, job.duration);

          const reasoning = findOptimalSlotLocal(
            {
              date: targetDate,
              duration: job.duration,
              jobType: job.jobType,
              clientId: job.clientId,
            },
            currentAvailableSlots
          );

          if (reasoning) {
            results.push({
              jobId: job.id,
              success: true,
              slot: reasoning.slot,
              technicianId: reasoning.technician.id,
            });

            // Add to temp events to prevent conflicts
            tempEvents.push({
              id: `temp-${job.id}`,
              title: job.title || 'Scheduled Job',
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

        return {
          results,
          aiPowered: false,
        };
      } catch (err) {
        console.error('Auto-schedule error:', err);
        setError(err instanceof Error ? err.message : 'Failed to auto-schedule jobs');
        return { results: [], aiPowered: false };
      } finally {
        setIsLoading(false);
      }
    },
    [events, resources, useGemini, findOptimalSlotLocal, getAvailableSlots]
  );

  // Optimize routes using Gemini AI
  const optimizeRoutes = useCallback(
    async (
      technicianId: string,
      date: Date,
      jobCoordinates: Map<string, { lat: number; lng: number }>
    ): Promise<RouteOptimization | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const techEvents = events
          .filter((e) => e.resourceId === technicianId && isSameDay(new Date(e.start), date))
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        if (techEvents.length < 2) {
          setError('Need at least 2 jobs to optimize routes');
          return null;
        }

        const jobs = techEvents.map((event) => {
          const coords = jobCoordinates.get(event.id) || { lat: 0, lng: 0 };
          return {
            id: event.id,
            title: event.title,
            address: event.extendedProps?.address || '',
            duration: differenceInMinutes(new Date(event.end), new Date(event.start)),
            latitude: coords.lat,
            longitude: coords.lng,
          };
        });

        // Try Gemini AI first
        if (useGemini) {
          try {
            const { data, error: fnError } = await supabase.functions.invoke('gemini-schedule', {
              body: {
                action: 'optimize_routes',
                routeDate: format(date, 'yyyy-MM-dd'),
                technicianId,
                jobs,
                skip_credits: false,
              },
            });

            if (!fnError && data?.success && data.result?.optimizedOrder) {
              const result = data.result as GeminiRouteOptimization;

              // Reorder jobs based on Gemini's optimization
              const optimizedRoute: MapJob[] = result.optimizedOrder.map((jobId, index) => {
                const event = techEvents.find(e => e.id === jobId);
                const coords = jobCoordinates.get(jobId) || { lat: 0, lng: 0 };
                const routeDetail = result.routeDetails?.find(r => r.jobId === jobId);

                return {
                  id: jobId,
                  event: event!,
                  coordinates: coords,
                  address: event?.extendedProps?.address || '',
                  routeOrder: index,
                  estimatedTravelTime: routeDetail?.travelTimeFromPrevious,
                };
              });

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

              return {
                originalRoute,
                optimizedRoute,
                timeSaved: result.timeSaved,
                distanceSaved: result.distanceSaved,
                aiPowered: true,
                suggestions: result.suggestions,
              };
            }
          } catch (aiError) {
            console.warn('Gemini route optimization failed, using local fallback:', aiError);
          }
        }

        // Local fallback - nearest neighbor algorithm
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

        const optimizedRoute = optimizeWithNearestNeighbor(originalRoute);

        const originalDistance = calculateTotalDistance(originalRoute);
        const optimizedDistance = calculateTotalDistance(optimizedRoute);
        const distanceSaved = originalDistance - optimizedDistance;
        const timeSaved = Math.round((distanceSaved / 30) * 60); // 30 km/h average

        return {
          originalRoute,
          optimizedRoute,
          timeSaved: Math.max(0, timeSaved),
          distanceSaved: Math.max(0, distanceSaved),
          aiPowered: false,
        };
      } catch (err) {
        console.error('Route optimization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to optimize routes');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [events, useGemini]
  );

  // Generate AI insights for the schedule
  const generateInsights = useCallback(
    async (date: Date): Promise<GeminiInsights | null> => {
      if (!useGemini) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const dayEvents = events.filter(e => isSameDay(new Date(e.start), date));

        const { data, error: fnError } = await supabase.functions.invoke('gemini-schedule', {
          body: {
            action: 'generate_insights',
            scheduleDate: format(date, 'yyyy-MM-dd'),
            existingJobs: dayEvents.map(e => ({
              id: e.id,
              title: e.title,
              duration: differenceInMinutes(new Date(e.end), new Date(e.start)),
              clientName: e.extendedProps?.clientName,
            })),
            technicians: resources.map(r => ({
              id: r.id,
              name: r.title,
              workload: dayEvents.filter(e => e.resourceId === r.id)
                .reduce((sum, e) => sum + differenceInMinutes(new Date(e.end), new Date(e.start)), 0) / 60,
            })),
            skip_credits: false,
          },
        });

        if (fnError) throw fnError;

        if (data?.success && data.result?.insights) {
          return data.result as GeminiInsights;
        }

        return null;
      } catch (err) {
        console.error('Generate insights error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate insights');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [events, resources, useGemini]
  );

  // Get AI-suggested time slots for highlighting
  const getHighlightedSlots = useCallback(
    (date: Date, duration: number = 60): TimeRange[] => {
      const availableSlots = getAvailableSlots(date, duration);

      // Return top 5 best slots (prioritize morning and balanced workload)
      const scored = availableSlots.map(({ slot, technician }) => {
        const techEvents = events.filter(
          (e) => e.resourceId === technician.id && isSameDay(new Date(e.start), date)
        );
        const workload = techEvents.length;
        const hour = slot.start.getHours();
        const morningBonus = hour >= 9 && hour <= 11 ? 10 : 0;
        const workloadScore = workload < 4 ? 20 : workload < 6 ? 10 : 0;

        return {
          slot,
          score: morningBonus + workloadScore,
        };
      });

      scored.sort((a, b) => b.score - a.score);

      return scored.slice(0, 5).map(s => s.slot);
    },
    [events, getAvailableSlots]
  );

  return {
    findOptimalSlot,
    autoScheduleJobs,
    optimizeRoutes,
    generateInsights,
    getHighlightedSlots,
    isLoading,
    error,
  };
}

// Helper: Generate tradeoff text
function generateTradeoffText(
  best: { technician: CalendarResource; slot: TimeRange; totalScore: number },
  alt: { technician: CalendarResource; slot: TimeRange; totalScore: number }
): string {
  const timeDiff = Math.abs(
    alt.slot.start.getHours() - best.slot.start.getHours()
  );
  const scoreDiff = best.totalScore - alt.totalScore;

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
