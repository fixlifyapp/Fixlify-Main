
// Job hook for job data management
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobInfo } from '@/types/job.types';

export const useJob = (jobId: string) => {
  const [job, setJob] = useState<JobInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
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
            title: data.title
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return { job, isLoading, error };
};
