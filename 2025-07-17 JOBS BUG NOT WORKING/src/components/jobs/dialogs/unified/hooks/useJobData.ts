
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useJobData = (jobId: string) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobData = async () => {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients(*)
          `)
          .eq('id', jobId)
          .single();

        if (fetchError) throw fetchError;

        setJob(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  return { job, loading, error };
};
