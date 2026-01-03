import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TimeRange, CalendarResource } from "../CalendarProvider";

export interface AISchedulingInput {
  jobType?: string;
  estimatedDuration?: number; // minutes
  clientAddress?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  preferredTechnicianId?: string;
}

export interface AIRecommendation {
  slot: {
    start: Date;
    end: Date;
  };
  technician: {
    id: string;
    name: string;
  };
  score: number; // 0-100
  reasoning: string[];
}

export interface TechnicianWorkload {
  technician: {
    id: string;
    name: string;
  };
  jobCount: number;
  totalHours: number;
  scheduled: number;
  inProgress: number;
  completed: number;
}

interface UseAISchedulingReturn {
  // State
  isLoading: boolean;
  error: string | null;
  recommendations: AIRecommendation[];
  highlightedSlots: TimeRange[];
  topRecommendation: AIRecommendation | null;
  technicianWorkload: TechnicianWorkload[];

  // Actions
  getRecommendations: (input: AISchedulingInput) => Promise<void>;
  getAvailableSlots: (
    dateRange: { start: Date; end: Date },
    estimatedDuration?: number
  ) => Promise<Record<string, Record<string, string[]>>>;
  getTechnicianWorkload: (dateRange?: { start: Date; end: Date }) => Promise<void>;
  clearRecommendations: () => void;
}

export function useAIScheduling(): UseAISchedulingReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [technicianWorkload, setTechnicianWorkload] = useState<TechnicianWorkload[]>([]);

  // Transform recommendations into highlighted slots for the calendar
  const highlightedSlots: TimeRange[] = recommendations.map((rec) => ({
    start: rec.slot.start,
    end: rec.slot.end,
  }));

  // Get the top recommendation (highest score)
  const topRecommendation = recommendations.length > 0 ? recommendations[0] : null;

  /**
   * Get AI scheduling recommendations
   */
  const getRecommendations = useCallback(
    async (input: AISchedulingInput) => {
      if (!user) {
        setError("User not authenticated");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          "ai-scheduling-assistant",
          {
            body: {
              action: "get_recommendations",
              organization_id: user.id, // Using user ID as org ID for now
              date_range: input.dateRange
                ? {
                    start: input.dateRange.start.toISOString(),
                    end: input.dateRange.end.toISOString(),
                  }
                : undefined,
              job_type: input.jobType,
              estimated_duration: input.estimatedDuration || 60,
              client_address: input.clientAddress,
              preferred_technician_id: input.preferredTechnicianId,
            },
          }
        );

        if (invokeError) {
          throw new Error(invokeError.message || "Failed to get recommendations");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        // Transform the response into AIRecommendation format
        const recs: AIRecommendation[] = (data?.recommendations || []).map(
          (rec: any) => ({
            slot: {
              start: new Date(rec.slot.start),
              end: new Date(rec.slot.end),
            },
            technician: rec.technician,
            score: rec.score,
            reasoning: rec.reasoning,
          })
        );

        setRecommendations(recs);
      } catch (err) {
        console.error("AI Scheduling Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Get available slots for a date range
   */
  const getAvailableSlots = useCallback(
    async (
      dateRange: { start: Date; end: Date },
      estimatedDuration: number = 60
    ): Promise<Record<string, Record<string, string[]>>> => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error: invokeError } = await supabase.functions.invoke(
        "ai-scheduling-assistant",
        {
          body: {
            action: "get_available_slots",
            organization_id: user.id,
            date_range: {
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString(),
            },
            estimated_duration: estimatedDuration,
          },
        }
      );

      if (invokeError || data?.error) {
        throw new Error(invokeError?.message || data?.error || "Failed to get slots");
      }

      return data?.available_slots || {};
    },
    [user]
  );

  /**
   * Get technician workload data
   */
  const getTechnicianWorkload = useCallback(
    async (dateRange?: { start: Date; end: Date }) => {
      if (!user) {
        setError("User not authenticated");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          "ai-scheduling-assistant",
          {
            body: {
              action: "get_technician_workload",
              organization_id: user.id,
              date_range: dateRange
                ? {
                    start: dateRange.start.toISOString(),
                    end: dateRange.end.toISOString(),
                  }
                : undefined,
            },
          }
        );

        if (invokeError || data?.error) {
          throw new Error(
            invokeError?.message || data?.error || "Failed to get workload"
          );
        }

        const workload: TechnicianWorkload[] = (data?.workload || []).map(
          (w: any) => ({
            technician: w.technician,
            jobCount: w.job_count,
            totalHours: w.total_hours,
            scheduled: w.scheduled,
            inProgress: w.in_progress,
            completed: w.completed,
          })
        );

        setTechnicianWorkload(workload);
      } catch (err) {
        console.error("Workload Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Clear all recommendations
   */
  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    recommendations,
    highlightedSlots,
    topRecommendation,
    technicianWorkload,
    getRecommendations,
    getAvailableSlots,
    getTechnicianWorkload,
    clearRecommendations,
  };
}
