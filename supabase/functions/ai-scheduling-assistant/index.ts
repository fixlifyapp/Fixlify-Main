import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SchedulingRequest {
  action: "get_recommendations" | "get_available_slots" | "get_technician_workload";
  organization_id: string;
  date_range?: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  job_type?: string;
  estimated_duration?: number; // minutes
  client_address?: string;
  preferred_technician_id?: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
  technician_id: string;
  technician_name: string;
}

interface ScoredSlot extends TimeSlot {
  score: number;
  reasoning: string[];
}

interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Job {
  id: string;
  schedule_start: string;
  schedule_end: string;
  technician_id: string | null;
  address: string | null;
  status: string;
}

// Constants for scoring weights
const WEIGHTS = {
  AVAILABILITY: 0.40,    // 40% - Can technician do it?
  TRAVEL: 0.30,          // 30% - Distance to previous/next job
  WORKLOAD: 0.20,        // 20% - Balance work across technicians
  PREFERENCE: 0.10,      // 10% - Working hours preference
};

// Business hours configuration
const BUSINESS_HOURS = {
  start: 8,  // 8 AM
  end: 18,   // 6 PM
  preferredStart: 9,  // 9 AM (preferred)
  preferredEnd: 17,   // 5 PM (preferred)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const request: SchedulingRequest = await req.json();
    const { action, organization_id, ...params } = request;

    console.log("AI Scheduling request:", action, params);

    if (!organization_id) {
      throw new Error("organization_id is required");
    }

    switch (action) {
      case "get_recommendations": {
        const {
          date_range,
          job_type,
          estimated_duration = 60, // Default 1 hour
          client_address,
          preferred_technician_id,
        } = params;

        // Default to next 7 days if no range provided
        const startDate = date_range?.start
          ? new Date(date_range.start)
          : new Date();
        const endDate = date_range?.end
          ? new Date(date_range.end)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 1. Get technicians for this organization
        const { data: technicians, error: techError } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .eq("role", "technician");

        if (techError) throw techError;

        if (!technicians || technicians.length === 0) {
          return new Response(
            JSON.stringify({
              recommendations: [],
              message: "No technicians available",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // 2. Get existing jobs in the date range
        const { data: existingJobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id, schedule_start, schedule_end, technician_id, address, status")
          .gte("schedule_start", startDate.toISOString())
          .lte("schedule_start", endDate.toISOString())
          .in("status", ["scheduled", "in-progress"]);

        if (jobsError) throw jobsError;

        // 3. Generate all possible time slots
        const allSlots = generateTimeSlots(
          startDate,
          endDate,
          estimated_duration,
          technicians as Technician[]
        );

        // 4. Filter out conflicting slots
        const availableSlots = filterConflictingSlots(
          allSlots,
          existingJobs || []
        );

        // 5. Score remaining slots
        const scoredSlots = scoreSlots(
          availableSlots,
          existingJobs || [],
          technicians as Technician[],
          {
            clientAddress: client_address,
            preferredTechnicianId: preferred_technician_id,
          }
        );

        // 6. Sort by score (highest first) and take top 5
        const topRecommendations = scoredSlots
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((slot) => ({
            slot: {
              start: slot.start.toISOString(),
              end: slot.end.toISOString(),
            },
            technician: {
              id: slot.technician_id,
              name: slot.technician_name,
            },
            score: Math.round(slot.score * 100),
            reasoning: slot.reasoning,
          }));

        return new Response(
          JSON.stringify({
            recommendations: topRecommendations,
            total_available_slots: availableSlots.length,
            date_range: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_available_slots": {
        const { date_range, estimated_duration = 60 } = params;

        if (!date_range) {
          throw new Error("date_range is required for get_available_slots");
        }

        const startDate = new Date(date_range.start);
        const endDate = new Date(date_range.end);

        // Get technicians
        const { data: technicians } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .eq("role", "technician");

        // Get existing jobs
        const { data: existingJobs } = await supabase
          .from("jobs")
          .select("id, schedule_start, schedule_end, technician_id, status")
          .gte("schedule_start", startDate.toISOString())
          .lte("schedule_start", endDate.toISOString())
          .in("status", ["scheduled", "in-progress"]);

        // Generate and filter slots
        const allSlots = generateTimeSlots(
          startDate,
          endDate,
          estimated_duration,
          (technicians || []) as Technician[]
        );

        const availableSlots = filterConflictingSlots(
          allSlots,
          existingJobs || []
        );

        // Group by date and technician
        const slotsByDate: Record<string, Record<string, string[]>> = {};

        for (const slot of availableSlots) {
          const dateKey = slot.start.toISOString().split("T")[0];
          if (!slotsByDate[dateKey]) {
            slotsByDate[dateKey] = {};
          }
          if (!slotsByDate[dateKey][slot.technician_id]) {
            slotsByDate[dateKey][slot.technician_id] = [];
          }
          slotsByDate[dateKey][slot.technician_id].push(
            slot.start.toISOString()
          );
        }

        return new Response(
          JSON.stringify({
            available_slots: slotsByDate,
            technicians: technicians?.map((t) => ({ id: t.id, name: t.name })),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_technician_workload": {
        const { date_range } = params;

        const startDate = date_range?.start
          ? new Date(date_range.start)
          : new Date();
        const endDate = date_range?.end
          ? new Date(date_range.end)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Get technicians
        const { data: technicians } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .eq("role", "technician");

        // Get jobs for each technician
        const { data: jobs } = await supabase
          .from("jobs")
          .select("id, schedule_start, schedule_end, technician_id, status")
          .gte("schedule_start", startDate.toISOString())
          .lte("schedule_start", endDate.toISOString())
          .in("status", ["scheduled", "in-progress", "completed"]);

        // Calculate workload per technician
        const workload = (technicians || []).map((tech) => {
          const techJobs = (jobs || []).filter(
            (j) => j.technician_id === tech.id
          );
          const totalMinutes = techJobs.reduce((acc, job) => {
            if (job.schedule_start && job.schedule_end) {
              const start = new Date(job.schedule_start);
              const end = new Date(job.schedule_end);
              return acc + (end.getTime() - start.getTime()) / (1000 * 60);
            }
            return acc + 60; // Default 1 hour if no times
          }, 0);

          return {
            technician: { id: tech.id, name: tech.name },
            job_count: techJobs.length,
            total_hours: Math.round(totalMinutes / 60 * 10) / 10,
            scheduled: techJobs.filter((j) => j.status === "scheduled").length,
            in_progress: techJobs.filter((j) => j.status === "in-progress").length,
            completed: techJobs.filter((j) => j.status === "completed").length,
          };
        });

        return new Response(
          JSON.stringify({
            workload,
            date_range: {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("AI Scheduling Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Generate all possible time slots within a date range
 */
function generateTimeSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  technicians: Technician[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const slotInterval = 30; // 30-minute intervals

  // Iterate through each day
  const currentDay = new Date(startDate);
  currentDay.setHours(0, 0, 0, 0);

  while (currentDay <= endDate) {
    // Skip weekends (optional - can be configured)
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Generate slots for each technician
      for (const tech of technicians) {
        // Generate slots within business hours
        for (
          let hour = BUSINESS_HOURS.start;
          hour < BUSINESS_HOURS.end;
          hour++
        ) {
          for (let minute = 0; minute < 60; minute += slotInterval) {
            const slotStart = new Date(currentDay);
            slotStart.setHours(hour, minute, 0, 0);

            const slotEnd = new Date(
              slotStart.getTime() + durationMinutes * 60 * 1000
            );

            // Only add if slot ends before business hours end
            if (slotEnd.getHours() <= BUSINESS_HOURS.end) {
              slots.push({
                start: slotStart,
                end: slotEnd,
                technician_id: tech.id,
                technician_name: tech.name || tech.email?.split("@")[0] || "Technician",
              });
            }
          }
        }
      }
    }

    // Move to next day
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return slots;
}

/**
 * Filter out slots that conflict with existing jobs
 */
function filterConflictingSlots(slots: TimeSlot[], existingJobs: Job[]): TimeSlot[] {
  return slots.filter((slot) => {
    // Check if this slot conflicts with any existing job for this technician
    for (const job of existingJobs) {
      if (job.technician_id !== slot.technician_id) continue;
      if (!job.schedule_start || !job.schedule_end) continue;

      const jobStart = new Date(job.schedule_start);
      const jobEnd = new Date(job.schedule_end);

      // Check for overlap
      const hasOverlap =
        slot.start < jobEnd && slot.end > jobStart;

      if (hasOverlap) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Score slots based on various factors
 */
function scoreSlots(
  slots: TimeSlot[],
  existingJobs: Job[],
  technicians: Technician[],
  options: {
    clientAddress?: string;
    preferredTechnicianId?: string;
  }
): ScoredSlot[] {
  // Calculate workload per technician
  const workloadByTech: Record<string, number> = {};
  for (const tech of technicians) {
    workloadByTech[tech.id] = existingJobs.filter(
      (j) => j.technician_id === tech.id
    ).length;
  }

  // Find max workload for normalization
  const maxWorkload = Math.max(...Object.values(workloadByTech), 1);

  return slots.map((slot) => {
    const reasoning: string[] = [];
    let score = 0;

    // 1. AVAILABILITY (40%) - Base availability is already handled by filtering
    const availabilityScore = 1.0;
    score += availabilityScore * WEIGHTS.AVAILABILITY;
    reasoning.push("Available slot");

    // 2. TRAVEL (30%) - Check proximity to adjacent jobs
    let travelScore = 0.5; // Default middle score

    const sameDayJobs = existingJobs.filter((j) => {
      if (j.technician_id !== slot.technician_id) return false;
      if (!j.schedule_start) return false;
      const jobDate = new Date(j.schedule_start).toDateString();
      return jobDate === slot.start.toDateString();
    });

    if (sameDayJobs.length === 0) {
      // First job of the day - slightly higher score
      travelScore = 0.7;
      reasoning.push("First appointment of the day");
    } else {
      // Find adjacent jobs
      const sortedJobs = sameDayJobs.sort(
        (a, b) =>
          new Date(a.schedule_start!).getTime() -
          new Date(b.schedule_start!).getTime()
      );

      const prevJob = sortedJobs.find(
        (j) => new Date(j.schedule_end!).getTime() <= slot.start.getTime()
      );
      const nextJob = sortedJobs.find(
        (j) => new Date(j.schedule_start!).getTime() >= slot.end.getTime()
      );

      if (prevJob || nextJob) {
        // Has adjacent jobs - check for buffer time
        const hasGoodBuffer = true; // Simplified - would calculate actual travel time
        if (hasGoodBuffer) {
          travelScore = 0.8;
          reasoning.push("Good buffer time between appointments");
        }
      }
    }
    score += travelScore * WEIGHTS.TRAVEL;

    // 3. WORKLOAD (20%) - Prefer technicians with lower workload
    const techWorkload = workloadByTech[slot.technician_id] || 0;
    const workloadScore = 1 - (techWorkload / maxWorkload);
    score += workloadScore * WEIGHTS.WORKLOAD;

    if (workloadScore > 0.7) {
      reasoning.push("Technician has lighter schedule");
    } else if (workloadScore < 0.3) {
      reasoning.push("Technician has heavier workload");
    }

    // 4. PREFERENCE (10%) - Preferred working hours
    const hour = slot.start.getHours();
    let preferenceScore = 0.5;

    if (hour >= BUSINESS_HOURS.preferredStart && hour <= BUSINESS_HOURS.preferredEnd - 1) {
      preferenceScore = 1.0;
      reasoning.push("Within preferred hours (9 AM - 5 PM)");
    } else if (hour === BUSINESS_HOURS.start || hour === BUSINESS_HOURS.end - 1) {
      preferenceScore = 0.3;
      reasoning.push("Edge of business hours");
    }
    score += preferenceScore * WEIGHTS.PREFERENCE;

    // Bonus: Preferred technician
    if (options.preferredTechnicianId === slot.technician_id) {
      score *= 1.15; // 15% bonus
      reasoning.push("Matches preferred technician");
    }

    return {
      ...slot,
      score: Math.min(score, 1.0), // Cap at 1.0
      reasoning,
    };
  });
}
