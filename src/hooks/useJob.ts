
// Job hook for job data management
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobInfo } from '@/components/jobs/context/types';

export const useJob = (jobId: string) => {
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients:client_id(*)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data) {
        setJob({
          id: data.id,
          clientId: data.client_id,
          client: data.clients?.name || '',
          clients: data.clients,
          service: data.service || '',
          address: data.clients?.address || '',
          phone: data.clients?.phone || '',
          email: data.clients?.email || '',
          total: data.revenue || 0,
          status: data.status,
          description: data.description,
          tags: data.tags,
          technician_id: data.technician_id,
          schedule_start: data.schedule_start,
          schedule_end: data.schedule_end,
          title: data.title,
          job_type: data.job_type,
          lead_source: data.lead_source,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, isLoading, error, refetch: fetchJob };
};
