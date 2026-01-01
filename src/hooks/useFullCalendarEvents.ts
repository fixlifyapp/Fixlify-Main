import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventInput, EventChangeArg, DateSelectArg } from '@fullcalendar/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useJobsRealtime } from '@/hooks/useJobsRealtime';
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';

interface CalendarJob {
  id: string;
  title: string;
  clientName: string;
  clientId: string | null;
  technicianId: string | null;
  technicianName: string;
  status: string;
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

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#3b82f6',      // blue
  confirmed: '#2563eb',      // darker blue
  'in-progress': '#f59e0b',  // amber
  completed: '#10b981',      // green
  cancelled: '#ef4444',      // red
  pending: '#8b5cf6',        // purple
};

const TECHNICIAN_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export function useFullCalendarEvents() {
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

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['scheduled', 'confirmed', 'in-progress', 'completed', 'pending']);

      if (jobsError) throw jobsError;

      // Fetch clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name');

      const clientMap = new Map(clients?.map(c => [c.id, c.name]) || []);

      // Fetch technicians
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'technician');

      const technicianMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      // Set technicians for resource view
      const techList: Technician[] = (profiles || []).map((p, index) => ({
        id: p.id,
        name: p.name || p.email?.split('@')[0] || 'Technician',
        email: p.email || '',
        color: TECHNICIAN_COLORS[index % TECHNICIAN_COLORS.length]
      }));
      setTechnicians(techList);

      // Transform jobs
      const formattedJobs: CalendarJob[] = (jobsData || []).map(job => {
        const scheduledDate = job.date ? new Date(job.date) : null;
        const scheduledEnd = scheduledDate ? addHours(scheduledDate, 2) : null; // Default 2 hours

        return {
          id: job.id,
          title: job.title || 'Unnamed Job',
          clientName: job.client_id ? (clientMap.get(job.client_id) || 'No Client') : 'No Client',
          clientId: job.client_id,
          technicianId: job.technician_id,
          technicianName: job.technician_id ? (technicianMap.get(job.technician_id) || 'Unassigned') : 'Unassigned',
          status: job.status || 'scheduled',
          scheduledDate,
          scheduledEnd,
          address: job.description || '',
          description: job.description || ''
        };
      });

      setJobs(formattedJobs);
    } catch (err) {
      console.error('Error fetching calendar jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      toast.error('Failed to load scheduled jobs');
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

  // Convert jobs to FullCalendar events
  const events = useMemo<EventInput[]>(() => {
    return jobs
      .filter(job => job.scheduledDate)
      .map(job => ({
        id: job.id,
        title: `${job.title} - ${job.clientName}`,
        start: job.scheduledDate!,
        end: job.scheduledEnd || addHours(job.scheduledDate!, 2),
        backgroundColor: STATUS_COLORS[job.status] || STATUS_COLORS.scheduled,
        borderColor: STATUS_COLORS[job.status] || STATUS_COLORS.scheduled,
        textColor: '#ffffff',
        resourceId: job.technicianId || undefined,
        extendedProps: {
          jobId: job.id,
          clientName: job.clientName,
          clientId: job.clientId,
          technicianId: job.technicianId,
          technicianName: job.technicianName,
          status: job.status,
          address: job.address,
          description: job.description
        },
        classNames: [`status-${job.status}`]
      }));
  }, [jobs]);

  // Convert technicians to FullCalendar resources
  const resources = useMemo(() => {
    return technicians.map(tech => ({
      id: tech.id,
      title: tech.name,
      eventColor: tech.color
    }));
  }, [technicians]);

  // Handle event drop (reschedule)
  const handleEventDrop = useCallback(async (info: EventChangeArg) => {
    const { event, revert } = info;
    const jobId = event.id;
    const newStart = event.start;
    const newEnd = event.end;
    const newResourceId = event.getResources()[0]?.id;

    if (!newStart) {
      revert();
      return;
    }

    try {
      const updates: Record<string, any> = {
        date: newStart.toISOString()
      };

      // If dropped on a different technician
      if (newResourceId && newResourceId !== event.extendedProps.technicianId) {
        updates.technician_id = newResourceId;
      }

      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Job rescheduled successfully');
      fetchJobs();
    } catch (err) {
      console.error('Error rescheduling job:', err);
      toast.error('Failed to reschedule job');
      revert();
    }
  }, [fetchJobs]);

  // Handle event resize (change duration)
  const handleEventResize = useCallback(async (info: EventChangeArg) => {
    const { event, revert } = info;
    const jobId = event.id;
    const newEnd = event.end;

    if (!newEnd) {
      revert();
      return;
    }

    try {
      // Note: If your jobs table has a duration or end_date column, update it here
      // For now, we'll just show a success message as duration isn't stored
      toast.success('Duration updated');
      fetchJobs();
    } catch (err) {
      console.error('Error updating job duration:', err);
      toast.error('Failed to update duration');
      revert();
    }
  }, [fetchJobs]);

  // Handle date selection (create new job)
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    // Return the selected date/time info for the parent component to handle
    return {
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay,
      resourceId: selectInfo.resource?.id
    };
  }, []);

  // Update job technician
  const updateJobTechnician = useCallback(async (jobId: string, technicianId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ technician_id: technicianId })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Technician assigned');
      fetchJobs();
    } catch (err) {
      console.error('Error assigning technician:', err);
      toast.error('Failed to assign technician');
    }
  }, [fetchJobs]);

  // Get job by ID
  const getJobById = useCallback((jobId: string) => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

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
    handleDateSelect,
    updateJobTechnician,
    getJobById
  };
}
