import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useJobsRealtime } from "@/hooks/useJobsRealtime";
import { toast } from "sonner";
import { addHours } from "date-fns";
import type {
  CalendarEvent,
  CalendarResource,
} from "@/components/calendar/CalendarProvider";

interface CalendarJob {
  id: string;
  title: string;
  clientName: string;
  clientId: string | null;
  clientPhone: string | null;
  technicianId: string | null;
  technicianName: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  scheduledDate: Date | null;
  scheduledEnd: Date | null;
  address: string;
  description: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  color: string;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  new: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  scheduled: { bg: "#3b82f6", border: "#2563eb", text: "#ffffff" },
  confirmed: { bg: "#2563eb", border: "#1d4ed8", text: "#ffffff" },
  "in-progress": { bg: "#f59e0b", border: "#d97706", text: "#ffffff" },
  completed: { bg: "#10b981", border: "#059669", text: "#ffffff" },
  cancelled: { bg: "#ef4444", border: "#dc2626", text: "#ffffff" },
  pending: { bg: "#8b5cf6", border: "#7c3aed", text: "#ffffff" },
  "no-show": { bg: "#6b7280", border: "#4b5563", text: "#ffffff" },
};

const TECHNICIAN_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export function useCalendarEvents() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch jobs - include all jobs with a scheduled date (any status except cancelled)
      // This ensures jobs with "New", "Scheduled", "scheduled" etc. all appear
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .not("status", "eq", "cancelled")
        .not("date", "is", null);

      if (jobsError) throw jobsError;

      // Fetch clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, phone");

      const clientMap = new Map(
        clients?.map((c) => [c.id, { name: c.name, phone: c.phone }]) || []
      );

      // Fetch technicians
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "technician");

      const technicianMap = new Map(
        profiles?.map((p) => [p.id, p.name]) || []
      );

      // Set technicians for resource view
      const techList: Technician[] = (profiles || []).map((p, index) => ({
        id: p.id,
        name: p.name || p.email?.split("@")[0] || "Technician",
        email: p.email || "",
        color: TECHNICIAN_COLORS[index % TECHNICIAN_COLORS.length],
      }));
      setTechnicians(techList);

      // Transform jobs
      const formattedJobs: CalendarJob[] = (jobsData || []).map((job) => {
        const scheduledDate = job.date ? new Date(job.date) : null;
        const scheduledEnd = job.schedule_end
          ? new Date(job.schedule_end)
          : scheduledDate
          ? addHours(scheduledDate, 1)
          : null;

        const clientData = job.client_id ? clientMap.get(job.client_id) : null;

        // Normalize status to match our types (case-insensitive)
        const statusLower = (job.status || "").toLowerCase();
        let normalizedStatus: CalendarJob["status"] = "scheduled";
        if (statusLower === "in-progress" || statusLower === "in_progress") {
          normalizedStatus = "in-progress";
        } else if (statusLower === "completed") {
          normalizedStatus = "completed";
        } else if (statusLower === "cancelled") {
          normalizedStatus = "cancelled";
        } else if (statusLower === "no-show" || statusLower === "no_show") {
          normalizedStatus = "no-show";
        }
        // "new", "scheduled", "pending", "confirmed" and others map to "scheduled"

        return {
          id: job.id,
          title: job.title || "Unnamed Job",
          clientName: clientData?.name || "No Client",
          clientId: job.client_id,
          clientPhone: clientData?.phone || null,
          technicianId: job.technician_id,
          technicianName: job.technician_id
            ? technicianMap.get(job.technician_id) || "Unassigned"
            : "Unassigned",
          status: normalizedStatus,
          scheduledDate,
          scheduledEnd,
          address: job.description || "",
          description: job.description || "",
        };
      });

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching calendar jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      toast.error("Failed to load scheduled jobs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up realtime subscriptions
  useJobsRealtime(() => {
    fetchJobs();
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Convert jobs to custom calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return jobs
      .filter((job) => job.scheduledDate)
      .map((job) => {
        const colors = STATUS_COLORS[job.status] || STATUS_COLORS.scheduled;

        return {
          id: job.id,
          title: `${job.title} - ${job.clientName}`,
          start: job.scheduledDate!,
          end: job.scheduledEnd || addHours(job.scheduledDate!, 2),
          status: job.status,
          resourceId: job.technicianId || undefined,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text,
          extendedProps: {
            jobId: job.id,
            clientName: job.clientName,
            clientPhone: job.clientPhone || undefined,
            technicianName: job.technicianName,
            address: job.address,
            description: job.description,
          },
        };
      });
  }, [jobs]);

  // Convert technicians to calendar resources
  const resources = useMemo<CalendarResource[]>(() => {
    return technicians.map((tech) => ({
      id: tech.id,
      title: tech.name,
      color: tech.color,
    }));
  }, [technicians]);

  // Handle event drop (reschedule) - for custom calendar
  const handleEventDrop = useCallback(
    async (
      event: CalendarEvent,
      newStart: Date,
      newEnd: Date,
      newResourceId?: string
    ) => {
      const jobId = event.id;

      try {
        const updates: Record<string, any> = {
          date: newStart.toISOString(),
          schedule_start: newStart.toISOString(),
          schedule_end: newEnd.toISOString(),
        };

        // If dropped on a different technician
        // "unassigned" means no technician - set to null
        if (newResourceId !== event.resourceId) {
          if (newResourceId === "unassigned" || !newResourceId) {
            updates.technician_id = null;
          } else {
            updates.technician_id = newResourceId;
          }
        }

        const { error } = await supabase
          .from("jobs")
          .update(updates)
          .eq("id", jobId);

        if (error) throw error;

        toast.success("Job rescheduled successfully");
        fetchJobs();
      } catch (err) {
        console.error("Error rescheduling job:", err);
        toast.error("Failed to reschedule job");
      }
    },
    [fetchJobs]
  );

  // Handle event resize (change duration)
  const handleEventResize = useCallback(
    async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
      const jobId = event.id;

      try {
        const { error } = await supabase
          .from("jobs")
          .update({
            date: newStart.toISOString(),
            schedule_start: newStart.toISOString(),
            schedule_end: newEnd.toISOString(),
          })
          .eq("id", jobId);

        if (error) throw error;

        toast.success("Duration updated");
        fetchJobs();
      } catch (err) {
        console.error("Error updating job duration:", err);
        toast.error("Failed to update duration");
      }
    },
    [fetchJobs]
  );

  // Handle slot click - return info for creating new job
  const handleSlotClick = useCallback(
    (date: Date, resourceId?: string) => {
      return {
        date,
        resourceId,
        technicianName: resourceId
          ? technicians.find((t) => t.id === resourceId)?.name
          : undefined,
      };
    },
    [technicians]
  );

  // Handle date selection (create new job)
  const handleDateSelect = useCallback(
    (start: Date, end: Date, resourceId?: string) => {
      return {
        start,
        end,
        resourceId,
        technicianName: resourceId
          ? technicians.find((t) => t.id === resourceId)?.name
          : undefined,
      };
    },
    [technicians]
  );

  // Update job technician
  const updateJobTechnician = useCallback(
    async (jobId: string, technicianId: string) => {
      try {
        const { error } = await supabase
          .from("jobs")
          .update({ technician_id: technicianId })
          .eq("id", jobId);

        if (error) throw error;

        toast.success("Technician assigned");
        fetchJobs();
      } catch (err) {
        console.error("Error assigning technician:", err);
        toast.error("Failed to assign technician");
      }
    },
    [fetchJobs]
  );

  // Get job by ID
  const getJobById = useCallback(
    (jobId: string) => {
      return jobs.find((job) => job.id === jobId);
    },
    [jobs]
  );

  return {
    events,
    resources,
    technicians,
    jobs,
    loading,
    error,
    fetchJobs,
    handleEventDrop,
    handleEventResize,
    handleSlotClick,
    handleDateSelect,
    updateJobTechnician,
    getJobById,
  };
}
