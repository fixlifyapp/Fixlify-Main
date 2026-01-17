import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SchedulingRequest {
  action: "get_recommendations" | "get_available_slots" | "get_technician_workload" | "get_smart_suggestions";
  organization_id: string;
  date_range?: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  job_type?: string;
  job_type_id?: string; // For skill matching
  estimated_duration?: number; // minutes
  client_address?: string;
  property_coords?: {
    lat: number;
    lng: number;
  };
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
  skill_match_score?: number;
  travel_score?: number;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
  skills?: string[];
  schedule_color?: string;
}

interface JobType {
  id: string;
  name: string;
  required_skills?: string[];
}

interface Job {
  id: string;
  schedule_start: string;
  schedule_end: string;
  technician_id: string | null;
  address: string | null;
  status: string;
}

// Constants for scoring weights - Updated with skill matching
const WEIGHTS = {
  SKILL_MATCH: 0.35,   // 35% - Technician skills match job requirements
  TRAVEL: 0.25,        // 25% - Distance to previous/next job
  AVAILABILITY: 0.20,  // 20% - Can technician do it?
  WORKLOAD: 0.15,      // 15% - Balance work across technicians
  PREFERENCE: 0.05,    // 5% - Working hours preference
};

// Business hours configuration
const BUSINESS_HOURS = {
  start: 8,  // 8 AM
  end: 18,   // 6 PM
  preferredStart: 9,  // 9 AM (preferred)
  preferredEnd: 17,   // 5 PM (preferred)
};

// Haversine formula for calculating distance between two coordinates
function haversineDistance(
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate travel distance using Google Routes API with Haversine fallback
async function calculateTravelDistance(
  techCoords: { lat: number; lng: number },
  jobCoords: { lat: number; lng: number }
): Promise<{ distance_km: number; duration_min: number; source: string }> {
  const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

  if (googleApiKey) {
    try {
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: techCoords.lat, longitude: techCoords.lng } } },
            destination: { location: { latLng: { latitude: jobCoords.lat, longitude: jobCoords.lng } } },
            travelMode: 'DRIVE'
          })
        }
      );

      const data = await response.json();
      if (data.routes?.[0]) {
        const durationStr = data.routes[0].duration || '0s';
        const durationSec = parseInt(durationStr.replace('s', '')) || 0;
        return {
          distance_km: (data.routes[0].distanceMeters || 0) / 1000,
          duration_min: Math.round(durationSec / 60),
          source: 'google_routes'
        };
      }
    } catch (e) {
      console.log('Google Routes API failed, using Haversine:', e.message);
    }
  }

  // Haversine fallback
  const distance_km = haversineDistance(techCoords, jobCoords);
  return {
    distance_km,
    duration_min: Math.round(distance_km * 2 + 5), // ~2min/km + 5min parking
    source: 'haversine'
  };
}

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
      // NEW: Smart suggestions with skill matching
      case "get_smart_suggestions": {
        const {
          job_type_id,
          job_type,
          property_coords,
          estimated_duration = 60,
          preferred_technician_id,
          date_range,
        } = params;

        // Default to next 7 days if no range provided
        const startDate = date_range?.start
          ? new Date(date_range.start)
          : new Date();
        const endDate = date_range?.end
          ? new Date(date_range.end)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // 1. Get job type with required skills
        let requiredSkills: string[] = [];
        let jobTypeName = job_type || "General";

        console.log("Looking up job_type_id:", job_type_id);

        if (job_type_id) {
          const { data: jobTypeData, error: jobTypeError } = await supabase
            .from("job_types")
            .select("id, name, required_skills")
            .eq("id", job_type_id)
            .single();

          console.log("Job type lookup result:", { jobTypeData, jobTypeError });

          if (jobTypeData) {
            requiredSkills = jobTypeData.required_skills || [];
            jobTypeName = jobTypeData.name;
            console.log("Found job type:", jobTypeName, "with skills:", requiredSkills);
          }
        }

        // 2. Get technicians with their skills and home coordinates (include admins/managers who can also be assigned)
        const { data: technicians, error: techError } = await supabase
          .from("profiles")
          .select("id, name, email, role, skills, schedule_color, home_latitude, home_longitude, max_travel_distance_km")
          .in("role", ["technician", "manager", "admin"]);

        if (techError) throw techError;

        if (!technicians || technicians.length === 0) {
          return new Response(
            JSON.stringify({
              suggestions: [],
              message: "No technicians available",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // 3. Get existing jobs in the date range for workload calculation (include coordinates for travel)
        const { data: existingJobs } = await supabase
          .from("jobs")
          .select("id, schedule_start, schedule_end, technician_id, address, status, latitude, longitude")
          .gte("schedule_start", startDate.toISOString())
          .lte("schedule_start", endDate.toISOString())
          .in("status", ["scheduled", "in-progress"]);

        // 4. Score each technician based on skills, workload, and availability
        // Using Promise.all since travel calculation is async
        const scoredTechnicians = await Promise.all(technicians.map(async (tech) => {
          const reasoning: string[] = [];
          let totalScore = 0;

          // 4a. SKILL MATCH (35%)
          let skillScore = 0.5; // Default for no skills required
          if (requiredSkills.length > 0) {
            const techSkills = (tech.skills || []).map(s => s.toLowerCase());
            const matchingSkills = requiredSkills.filter(req =>
              techSkills.some(ts => ts.includes(req.toLowerCase()) || req.toLowerCase().includes(ts))
            );
            skillScore = matchingSkills.length / requiredSkills.length;

            if (skillScore >= 0.75) {
              reasoning.push(`Expert in ${jobTypeName}`);
            } else if (skillScore >= 0.5) {
              reasoning.push(`Skilled in related areas`);
            } else if (skillScore > 0) {
              reasoning.push(`Some relevant experience`);
            } else {
              reasoning.push(`Learning ${jobTypeName}`);
            }

            // Add specific matched skills to reasoning
            if (matchingSkills.length > 0) {
              reasoning.push(`Skills: ${matchingSkills.slice(0, 3).join(", ")}`);
            }
          } else {
            reasoning.push("General job - any technician");
          }
          totalScore += skillScore * WEIGHTS.SKILL_MATCH;

          // 4b. WORKLOAD (15%)
          const techJobs = (existingJobs || []).filter(j => j.technician_id === tech.id);
          const maxJobsPerWeek = 40; // Assume max 40 jobs per week
          const workloadScore = Math.max(0, 1 - (techJobs.length / maxJobsPerWeek));
          totalScore += workloadScore * WEIGHTS.WORKLOAD;

          if (workloadScore > 0.7) {
            reasoning.push("Light schedule today");
          } else if (workloadScore < 0.3) {
            reasoning.push("Busy schedule");
          }

          // 4c. AVAILABILITY (20%)
          // Find first available slot
          const availableSlot = findFirstAvailableSlot(
            tech.id,
            existingJobs || [],
            startDate,
            endDate,
            estimated_duration
          );

          const availabilityScore = availableSlot ? 1.0 : 0.0;
          totalScore += availabilityScore * WEIGHTS.AVAILABILITY;

          if (availableSlot) {
            const slotDate = new Date(availableSlot.start);
            const isToday = slotDate.toDateString() === new Date().toDateString();
            if (isToday) {
              reasoning.push("Available today");
              totalScore *= 1.1; // 10% bonus for today availability
            } else {
              reasoning.push(`Next available: ${slotDate.toLocaleDateString()}`);
            }
          } else {
            reasoning.push("No availability this week");
          }

          // 4d. TRAVEL (25%) - Real distance calculation using Google Routes API
          let travelScore = 0.5; // Default when no location data
          let travelDistance: number | null = null;
          let travelDuration: number | null = null;

          if (property_coords && property_coords.lat && property_coords.lng) {
            // Find technician's starting location
            // Priority: last completed job with coordinates → home base → skip
            const completedJobs = techJobs
              .filter(j => j.schedule_end && new Date(j.schedule_end) < new Date())
              .sort((a, b) => new Date(b.schedule_end!).getTime() - new Date(a.schedule_end!).getTime());

            const lastJobWithCoords = completedJobs.find(j => j.latitude && j.longitude);

            let techStartCoords: { lat: number; lng: number } | null = null;

            if (lastJobWithCoords?.latitude && lastJobWithCoords?.longitude) {
              techStartCoords = { lat: lastJobWithCoords.latitude, lng: lastJobWithCoords.longitude };
            } else if (tech.home_latitude && tech.home_longitude) {
              techStartCoords = { lat: tech.home_latitude, lng: tech.home_longitude };
            }

            if (techStartCoords) {
              try {
                const travel = await calculateTravelDistance(techStartCoords, property_coords);
                travelDistance = travel.distance_km;
                travelDuration = travel.duration_min;

                // Score based on distance (closer = better)
                // 0-10km = 1.0, 10-25km = 0.8, 25-50km = 0.6, 50+km = 0.3
                if (travel.distance_km <= 10) {
                  travelScore = 1.0;
                  reasoning.push(`${Math.round(travel.distance_km)}km away (~${travel.duration_min}min)`);
                } else if (travel.distance_km <= 25) {
                  travelScore = 0.8;
                  reasoning.push(`${Math.round(travel.distance_km)}km (~${travel.duration_min}min drive)`);
                } else if (travel.distance_km <= 50) {
                  travelScore = 0.6;
                  reasoning.push(`${Math.round(travel.distance_km)}km travel`);
                } else {
                  travelScore = 0.3;
                  reasoning.push(`Far: ${Math.round(travel.distance_km)}km`);
                }

                // Check if exceeds max travel distance preference
                if (tech.max_travel_distance_km && travel.distance_km > tech.max_travel_distance_km) {
                  travelScore *= 0.5; // Penalize if exceeds preference
                  reasoning.push(`Exceeds preferred travel (${tech.max_travel_distance_km}km)`);
                }

                console.log(`Travel calc for ${tech.name}: ${travel.distance_km.toFixed(1)}km via ${travel.source}`);
              } catch (e) {
                console.log(`Travel calc failed for ${tech.name}:`, e.message);
                // Fall back to default score
                reasoning.push("Distance unknown");
              }
            } else {
              // No start location available
              reasoning.push("Location not available");
            }
          }
          totalScore += travelScore * WEIGHTS.TRAVEL;

          // 4e. PREFERENCE (5%)
          if (preferred_technician_id === tech.id) {
            totalScore *= 1.15; // 15% bonus for preferred
            reasoning.push("Preferred technician");
          }
          totalScore += 0.5 * WEIGHTS.PREFERENCE;

          return {
            technician: {
              id: tech.id,
              name: tech.name || tech.email?.split("@")[0] || "Technician",
              skills: tech.skills || [],
              color: tech.schedule_color,
            },
            score: Math.round(Math.min(totalScore, 1.0) * 100),
            reasoning,
            skillMatchScore: Math.round(skillScore * 100),
            availableSlot,
            jobsToday: techJobs.filter(j =>
              new Date(j.schedule_start).toDateString() === new Date().toDateString()
            ).length,
            travelDistance,
            travelDuration,
          };
        }));

        // Sort by score (highest first)
        const suggestions = scoredTechnicians
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return new Response(
          JSON.stringify({
            suggestions,
            job_type: jobTypeName,
            required_skills: requiredSkills,
            total_technicians: technicians.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_recommendations": {
        const {
          date_range,
          job_type,
          job_type_id,
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

        // Get job type with required skills if job_type_id provided
        let requiredSkills: string[] = [];
        if (job_type_id) {
          const { data: jobTypeData } = await supabase
            .from("job_types")
            .select("id, name, required_skills")
            .eq("id", job_type_id)
            .single();

          if (jobTypeData) {
            requiredSkills = jobTypeData.required_skills || [];
          }
        }

        // 1. Get technicians for this organization with skills
        const { data: technicians, error: techError } = await supabase
          .from("profiles")
          .select("id, name, email, role, skills")
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

        // 5. Score remaining slots WITH skill matching
        const scoredSlots = scoreSlotsWithSkills(
          availableSlots,
          existingJobs || [],
          technicians as Technician[],
          {
            clientAddress: client_address,
            preferredTechnicianId: preferred_technician_id,
            requiredSkills,
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
          .select("id, name, email, role, skills")
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
            technicians: technicians?.map((t) => ({
              id: t.id,
              name: t.name,
              skills: t.skills || [],
            })),
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

        // Get technicians with skills
        const { data: technicians } = await supabase
          .from("profiles")
          .select("id, name, email, role, skills")
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
            technician: {
              id: tech.id,
              name: tech.name,
              skills: tech.skills || [],
            },
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
 * Find first available slot for a technician
 */
function findFirstAvailableSlot(
  technicianId: string,
  existingJobs: Job[],
  startDate: Date,
  endDate: Date,
  durationMinutes: number
): { start: string; end: string } | null {
  const slotInterval = 30; // 30-minute intervals
  const now = new Date();

  // Start from now if startDate is in the past
  const effectiveStart = startDate < now ? now : startDate;
  const currentDay = new Date(effectiveStart);
  currentDay.setHours(0, 0, 0, 0);

  while (currentDay <= endDate) {
    // Skip weekends
    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Check each slot
      for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotStart = new Date(currentDay);
          slotStart.setHours(hour, minute, 0, 0);

          // Skip if slot is in the past
          if (slotStart < now) continue;

          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

          // Check if slot ends before business hours end
          if (slotEnd.getHours() > BUSINESS_HOURS.end) continue;

          // Check for conflicts
          const hasConflict = existingJobs.some((job) => {
            if (job.technician_id !== technicianId) return false;
            if (!job.schedule_start || !job.schedule_end) return false;

            const jobStart = new Date(job.schedule_start);
            const jobEnd = new Date(job.schedule_end);

            return slotStart < jobEnd && slotEnd > jobStart;
          });

          if (!hasConflict) {
            return {
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
            };
          }
        }
      }
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  return null;
}

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
 * Score slots with skill matching
 */
function scoreSlotsWithSkills(
  slots: TimeSlot[],
  existingJobs: Job[],
  technicians: Technician[],
  options: {
    clientAddress?: string;
    preferredTechnicianId?: string;
    requiredSkills?: string[];
  }
): ScoredSlot[] {
  // Create lookup for technician skills
  const techSkillsMap: Record<string, string[]> = {};
  for (const tech of technicians) {
    techSkillsMap[tech.id] = (tech.skills || []).map(s => s.toLowerCase());
  }

  // Calculate workload per technician
  const workloadByTech: Record<string, number> = {};
  for (const tech of technicians) {
    workloadByTech[tech.id] = existingJobs.filter(
      (j) => j.technician_id === tech.id
    ).length;
  }

  // Find max workload for normalization
  const maxWorkload = Math.max(...Object.values(workloadByTech), 1);

  const requiredSkills = (options.requiredSkills || []).map(s => s.toLowerCase());

  return slots.map((slot) => {
    const reasoning: string[] = [];
    let score = 0;

    // 1. SKILL MATCH (35%)
    let skillScore = 0.5; // Default for no skills required
    if (requiredSkills.length > 0) {
      const techSkills = techSkillsMap[slot.technician_id] || [];
      const matchingSkills = requiredSkills.filter(req =>
        techSkills.some(ts => ts.includes(req) || req.includes(ts))
      );
      skillScore = matchingSkills.length / requiredSkills.length;

      if (skillScore >= 0.75) {
        reasoning.push("Excellent skill match");
      } else if (skillScore >= 0.5) {
        reasoning.push("Good skill match");
      } else if (skillScore > 0) {
        reasoning.push("Partial skill match");
      }
    }
    score += skillScore * WEIGHTS.SKILL_MATCH;

    // 2. TRAVEL (25%) - Check proximity to adjacent jobs
    let travelScore = 0.5; // Default middle score

    const sameDayJobs = existingJobs.filter((j) => {
      if (j.technician_id !== slot.technician_id) return false;
      if (!j.schedule_start) return false;
      const jobDate = new Date(j.schedule_start).toDateString();
      return jobDate === slot.start.toDateString();
    });

    if (sameDayJobs.length === 0) {
      travelScore = 0.7;
      reasoning.push("First appointment of the day");
    } else {
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
        travelScore = 0.8;
        reasoning.push("Good buffer time");
      }
    }
    score += travelScore * WEIGHTS.TRAVEL;

    // 3. AVAILABILITY (20%) - Base availability is already handled by filtering
    const availabilityScore = 1.0;
    score += availabilityScore * WEIGHTS.AVAILABILITY;
    reasoning.push("Available slot");

    // 4. WORKLOAD (15%) - Prefer technicians with lower workload
    const techWorkload = workloadByTech[slot.technician_id] || 0;
    const workloadScore = 1 - (techWorkload / maxWorkload);
    score += workloadScore * WEIGHTS.WORKLOAD;

    if (workloadScore > 0.7) {
      reasoning.push("Light schedule");
    }

    // 5. PREFERENCE (5%) - Preferred working hours
    const hour = slot.start.getHours();
    let preferenceScore = 0.5;

    if (hour >= BUSINESS_HOURS.preferredStart && hour <= BUSINESS_HOURS.preferredEnd - 1) {
      preferenceScore = 1.0;
      reasoning.push("Preferred hours");
    }
    score += preferenceScore * WEIGHTS.PREFERENCE;

    // Bonus: Preferred technician
    if (options.preferredTechnicianId === slot.technician_id) {
      score *= 1.15;
      reasoning.push("Preferred technician");
    }

    return {
      ...slot,
      score: Math.min(score, 1.0),
      reasoning,
      skill_match_score: skillScore,
      travel_score: travelScore,
    };
  });
}
