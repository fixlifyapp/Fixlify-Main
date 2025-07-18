import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface ClientValueData {
  id: string;
  name: string;
  totalRevenue: number;
  jobCount: number;
  lastJobDate: Date | null;
  daysSinceLastJob: number;
  averageJobValue: number;
  churnRisk: 'low' | 'medium' | 'high';
  lifetimeValue: number;
}

export interface QuoteConversionData {
  sent: number;
  approved: number;
  ignored: number;
  rejected: number;
  approvedRevenue: number;
  conversionRate: number;
}

export const useClientAnalytics = () => {
  const [clientValueData, setClientValueData] = useState<ClientValueData[]>([]);
  const [quoteConversionData, setQuoteConversionData] = useState<QuoteConversionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) {
        console.log('useClientAnalytics: No user found, skipping fetch');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('useClientAnalytics: Starting data fetch');
        setIsLoading(true);
        
        // Fetch clients with their job data
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*');
          
        if (clientsError) {
          console.error('useClientAnalytics: Error fetching clients:', clientsError);
          throw clientsError;
        }
        
        // Fetch jobs data
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*');
          
        if (jobsError) {
          console.error('useClientAnalytics: Error fetching jobs:', jobsError);
          throw jobsError;
        }
        
        // Fetch estimates data for conversion tracking
        const { data: estimates, error: estimatesError } = await supabase
          .from('estimates')
          .select('*');
          
        if (estimatesError) {
          console.error('useClientAnalytics: Error fetching estimates:', estimatesError);
          throw estimatesError;
        }
        
        console.log('useClientAnalytics: Raw data fetched', { 
          clientsCount: clients?.length || 0, 
          jobsCount: jobs?.length || 0,
          estimatesCount: estimates?.length || 0
        });
        
        // Process client value data
        const clientAnalytics: ClientValueData[] = (clients || []).map(client => {
          const clientJobs = (jobs || []).filter(job => job.client_id === client.id);
          const completedJobs = clientJobs.filter(job => job.status === 'completed');
          
          const totalRevenue = completedJobs.reduce((sum, job) => {
            const revenue = typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0');
            return sum + revenue;
          }, 0);
          
          const jobCount = completedJobs.length;
          const averageJobValue = jobCount > 0 ? totalRevenue / jobCount : 0;
          
          // Find last job date
          const sortedJobs = clientJobs.sort((a, b) => 
            new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
          );
          
          const lastJobDate = sortedJobs.length > 0 ? new Date(sortedJobs[0].updated_at || sortedJobs[0].created_at) : null;
          const daysSinceLastJob = lastJobDate ? Math.floor((Date.now() - lastJobDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
          
          // Calculate churn risk
          let churnRisk: 'low' | 'medium' | 'high' = 'low';
          if (daysSinceLastJob > 180) churnRisk = 'high';
          else if (daysSinceLastJob > 90) churnRisk = 'medium';
          
          // Calculate lifetime value (simple: total revenue + predicted future value)
          const lifetimeValue = totalRevenue + (averageJobValue * 0.5); // Simple prediction
          
          return {
            id: client.id,
            name: client.name,
            totalRevenue,
            jobCount,
            lastJobDate,
            daysSinceLastJob,
            averageJobValue,
            churnRisk,
            lifetimeValue
          };
        });
        
        // Process quote conversion data
        const totalEstimates = estimates?.length || 0;
        const approvedEstimates = estimates?.filter(est => est.status === 'approved') || [];
        const rejectedEstimates = estimates?.filter(est => est.status === 'rejected') || [];
        const draftEstimates = estimates?.filter(est => est.status === 'draft') || [];
        
        const approvedRevenue = approvedEstimates.reduce((sum, est) => {
          const total = typeof est.total === 'number' ? est.total : parseFloat(est.total || '0');
          return sum + total;
        }, 0);
        
        const conversionData: QuoteConversionData = {
          sent: totalEstimates,
          approved: approvedEstimates.length,
          ignored: draftEstimates.length,
          rejected: rejectedEstimates.length,
          approvedRevenue,
          conversionRate: totalEstimates > 0 ? (approvedEstimates.length / totalEstimates) * 100 : 0
        };
        
        console.log('useClientAnalytics: Processed data', { 
          clientAnalyticsCount: clientAnalytics.length,
          conversionData
        });
        
        setClientValueData(clientAnalytics.sort((a, b) => b.lifetimeValue - a.lifetimeValue));
        setQuoteConversionData(conversionData);
        
      } catch (error) {
        console.error('useClientAnalytics: Error in fetchAnalytics:', error);
        // Set empty data on error instead of keeping loading state
        setClientValueData([]);
        setQuoteConversionData({
          sent: 0,
          approved: 0,
          ignored: 0,
          rejected: 0,
          approvedRevenue: 0,
          conversionRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user]);
  
  return {
    clientValueData,
    quoteConversionData,
    isLoading
  };
};
