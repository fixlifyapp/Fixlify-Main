
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useJob(jobId: string) {
  const queryResult = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  return {
    ...queryResult,
    job: queryResult.data,
    loading: queryResult.isLoading,
    error: queryResult.error?.message || '',
    jobData: queryResult.data,
    clientInfo: queryResult.data?.client,
    jobAddress: queryResult.data?.address
  };
}
