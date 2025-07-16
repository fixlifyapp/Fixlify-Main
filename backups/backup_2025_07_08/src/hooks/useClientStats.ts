
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientStats {
  totalJobs: number;
  totalRevenue: number;
  lastServiceDate?: string;
  averageJobValue: number;
  jobsThisYear: number;
  revenueThisYear: number;
}

export const useClientStats = (clientId?: string) => {
  const [stats, setStats] = useState<ClientStats>({
    totalJobs: 0,
    totalRevenue: 0,
    averageJobValue: 0,
    jobsThisYear: 0,
    revenueThisYear: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const fetchClientStats = async () => {
      setIsLoading(true);
      try {
        // Get all jobs for this client with real revenue data
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, revenue, date, created_at, status')
          .eq('client_id', clientId);

        if (error) throw error;

        const currentYear = new Date().getFullYear();
        const totalJobs = jobs?.length || 0;
        
        // Calculate total revenue from job.revenue field (which comes from paid invoices)
        const totalRevenue = jobs?.reduce((sum, job) => {
          const revenue = Number(job.revenue) || 0;
          return sum + revenue;
        }, 0) || 0;
        
        // Jobs and revenue this year
        const jobsThisYear = jobs?.filter(job => {
          const jobYear = new Date(job.date || job.created_at).getFullYear();
          return jobYear === currentYear;
        }).length || 0;

        const revenueThisYear = jobs?.filter(job => {
          const jobYear = new Date(job.date || job.created_at).getFullYear();
          return jobYear === currentYear;
        }).reduce((sum, job) => {
          const revenue = Number(job.revenue) || 0;
          return sum + revenue;
        }, 0) || 0;

        // Last service date (only for completed jobs)
        const completedJobs = jobs?.filter(job => job.status === 'completed') || [];
        const lastServiceDate = completedJobs.length > 0 
          ? completedJobs.sort((a, b) => 
              new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
            )[0]?.date
          : undefined;

        // Average job value based on actual revenue
        const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

        setStats({
          totalJobs,
          totalRevenue,
          lastServiceDate,
          averageJobValue,
          jobsThisYear,
          revenueThisYear
        });
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientStats();

    // Set up real-time subscription for job updates
    const channel = supabase
      .channel(`client-stats-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `client_id=eq.${clientId}`
        },
        () => {
          console.log('Real-time job update detected for client stats');
          fetchClientStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          console.log('Real-time invoice update detected for client stats');
          fetchClientStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          console.log('Real-time payment update detected for client stats');
          fetchClientStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return { stats, isLoading };
};
