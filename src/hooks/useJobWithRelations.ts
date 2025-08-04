// Example hook showing how to use database-enhanced types
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  JobWithDatabaseRelations, 
  databaseJobToJob 
} from '@/types/core/job-database';
import type { Database } from '@/integrations/supabase/types';

// Type-safe Supabase query
type JobsQuery = Database['public']['Tables']['jobs']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null;
  technician: Database['public']['Tables']['profiles']['Row'] | null;
};

export function useJobWithRelations(jobId: string) {
  const [job, setJob] = useState<JobWithDatabaseRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setIsLoading(true);
        
        // Type-safe query with proper joins
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(*),
            technician:profiles(*)
          `)
          .eq('id', jobId)
          .single<JobsQuery>();
          
        if (error) throw error;
        
        // Convert to our enhanced type
        const enhancedJob: JobWithDatabaseRelations = {
          ...databaseJobToJob(data),
          client: data.client || undefined,
          technician: data.technician || undefined,
        };
        
        // Fetch related data
        const [estimatesResult, invoicesResult, paymentsResult] = await Promise.all([
          supabase.from('estimates').select('*').eq('job_id', jobId),
          supabase.from('invoices').select('*').eq('job_id', jobId),
          supabase.from('payments').select('*').eq('job_id', jobId),
        ]);
        
        // Add relations
        enhancedJob.estimates = estimatesResult.data || [];
        enhancedJob.invoices = invoicesResult.data || [];
        enhancedJob.payments = paymentsResult.data || [];
        
        setJob(enhancedJob);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchJob();
  }, [jobId]);
  
  return { job, isLoading, error };
}

// Example of type-safe database operations
export async function createJobInDatabase(jobData: Partial<JobWithDatabaseRelations>) {
  // TypeScript ensures we only send valid database fields
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: jobData.title,
      client_id: jobData.client_id,
      status: jobData.status,
      revenue: jobData.revenue || 0,
      // TypeScript will error if you try to include non-database fields
      // estimates: jobData.estimates, // ❌ Error: 'estimates' doesn't exist in Insert type
    })
    .select()
    .single();
    
  if (error) throw error;
  return databaseJobToJob(data);
}
