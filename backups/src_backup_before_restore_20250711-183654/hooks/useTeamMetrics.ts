
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TechnicianMetric {
  id: string;
  name: string;
  job_count: number;
  total_revenue: number;
  avatar?: string;
}

export const useTeamMetrics = (dateRange?: { start: string; end: string }) => {
  const [technicians, setTechnicians] = useState<TechnicianMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First get all technicians from profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url');
          
        if (profilesError) throw profilesError;
        
        // Then get jobs data to calculate metrics
        let query = supabase
          .from('jobs')
          .select(`
            id,
            revenue,
            technician_id
          `);
          
        // Filter by date range if provided
        if (dateRange) {
          query = query.gte('date', dateRange.start)
            .lte('date', dateRange.end);
        }
        
        // Only include completed jobs for revenue calculations
        query = query.eq('status', 'completed');
          
        const { data: jobs, error: jobsError } = await query;
        
        if (jobsError) throw jobsError;
        
        // Initialize metrics for all technicians
        const techMetricsMap = new Map<string, TechnicianMetric>();
        
        // Initialize all technicians with 0 metrics
        profiles.forEach(profile => {
          techMetricsMap.set(profile.id, {
            id: profile.id,
            name: profile.name || 'Unknown',
            job_count: 0,
            total_revenue: 0,
            avatar: profile.avatar_url
          });
        });
        
        // Update metrics based on jobs data
        (jobs || []).forEach(job => {
          if (job.technician_id && techMetricsMap.has(job.technician_id)) {
            const current = techMetricsMap.get(job.technician_id)!;
            techMetricsMap.set(job.technician_id, {
              ...current,
              job_count: current.job_count + 1,
              total_revenue: current.total_revenue + (job.revenue || 0)
            });
          }
        });
        
        // Convert to array and sort by revenue
        const techMetricsArray = Array.from(techMetricsMap.values())
          .sort((a, b) => b.total_revenue - a.total_revenue);
        
        setTechnicians(techMetricsArray);
      } catch (error: any) {
        console.error("Error fetching team metrics:", error);
        setError("Failed to load team metrics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMetrics();
  }, [dateRange]);
  
  return {
    technicians,
    isLoading,
    error
  };
};
