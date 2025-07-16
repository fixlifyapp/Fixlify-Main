import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { subDays, startOfMonth, endOfDay, startOfDay, format } from "date-fns";
import { TimeFilter, DateRange } from "./DateRangeSelector";

interface MetricsData {
  salesTotal: number;
  amountCollected: number;
  jobsCompleted: number;
  jobsCancelled: number;
  jobsCreated: number;
  openJobs: number;
  totalRevenue: number;
  previousTotalRevenue: number;
  previousOpenJobs: number;
  topTechnicians: { name: string; job_count: number; total_revenue: number }[];
}

export const useMetricsData = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('thisMonth');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    salesTotal: 0,
    amountCollected: 0,
    jobsCompleted: 0,
    jobsCancelled: 0,
    jobsCreated: 0,
    openJobs: 0,
    totalRevenue: 0,
    previousTotalRevenue: 0,
    previousOpenJobs: 0,
    topTechnicians: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Helper function to get date range based on selected filter
  const getDateRange = (): DateRange => {
    const today = new Date();
    
    switch (timeFilter) {
      case 'today':
        return {
          from: startOfDay(today),
          to: endOfDay(today)
        };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        };
      case 'last7days':
        return {
          from: startOfDay(subDays(today, 6)), // Last 7 days including today
          to: endOfDay(today)
        };
      case 'thisMonth':
        return {
          from: startOfMonth(today),
          to: endOfDay(today)
        };
      case 'custom':
        return customDateRange;
      default:
        return {
          from: startOfMonth(today),
          to: endOfDay(today)
        };
    }
  };

  // Fetch all metrics data
  const fetchMetricsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      // Calculate previous period date range for comparisons
      const periodLength = dateRange.to.getTime() - dateRange.from.getTime();
      const previousStartDate = new Date(dateRange.from.getTime() - periodLength).toISOString();
      const previousEndDate = new Date(dateRange.from.getTime() - 1).toISOString();

      // Use placeholder data for sales total instead of querying invoices table
      // This replaces the previous query to the invoices table
      const salesTotal = 5000; // Placeholder value

      // Fetch amount collected (payments)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate);

      if (paymentsError) throw paymentsError;
      
      const amountCollected = paymentsData?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;

      // Fetch jobs completed
      const { count: jobsCompleted, error: completedError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (completedError) throw completedError;

      // Fetch jobs cancelled
      const { count: jobsCancelled, error: cancelledError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (cancelledError) throw cancelledError;

      // Fetch jobs created
      const { count: jobsCreated, error: createdError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (createdError) throw createdError;

      // Fetch open jobs (scheduled or in_progress)
      const { count: openJobs, error: openJobsError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'in_progress', 'in-progress'])
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (openJobsError) throw openJobsError;

      // Fetch previous period open jobs for comparison
      const { count: previousOpenJobs } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .in('status', ['scheduled', 'in_progress', 'in-progress'])
        .gte('created_at', previousStartDate)
        .lte('created_at', previousEndDate);

      // Fetch total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('jobs')
        .select('revenue')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData?.reduce((sum, job) => sum + (Number(job.revenue) || 0), 0) || 0;

      // Fetch previous period revenue for comparison
      const { data: previousRevenueData } = await supabase
        .from('jobs')
        .select('revenue')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate)
        .lte('created_at', previousEndDate);
        
      const previousTotalRevenue = previousRevenueData?.reduce((sum, job) => sum + (Number(job.revenue) || 0), 0) || 0;

      // Fetch top technicians by completed jobs
      const { data: technicianData, error: techError } = await supabase
        .from('jobs')
        .select(`
          technician_id,
          revenue
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
        
      if (techError) throw techError;
      
      // Process technician data to get top performers
      let topTechnicians: { name: string; job_count: number; total_revenue: number }[] = [];
      
      if (technicianData && technicianData.length > 0) {
        // Get unique technician IDs
        const techIds = Array.from(
          new Set(technicianData.filter(job => job.technician_id).map(job => job.technician_id)) as Set<string>
        );
        
        if (techIds.length > 0) {
          // Fetch technician names
          const { data: techProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', techIds);
            
          if (profilesError) throw profilesError;
          
          // Create a map of technician IDs to their names
          const techNameMap: Record<string, string> = {};
          if (techProfiles) {
            techProfiles.forEach(profile => {
              if (profile.id) {
                techNameMap[profile.id] = profile.name || 'Unknown';
              }
            });
          }
          
          // Calculate metrics per technician
          const techStats: Record<string, { name: string; job_count: number; total_revenue: number }> = {};
          
          technicianData.forEach(job => {
            if (job.technician_id && techNameMap[job.technician_id]) {
              const techId = job.technician_id;
              
              if (!techStats[techId]) {
                techStats[techId] = {
                  name: techNameMap[techId],
                  job_count: 0,
                  total_revenue: 0
                };
              }
              
              techStats[techId].job_count += 1;
              techStats[techId].total_revenue += Number(job.revenue) || 0;
            }
          });
          
          // Sort by revenue and get top 5
          topTechnicians = Object.values(techStats)
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, 5);
        }
      }

      setMetrics({
        salesTotal,
        amountCollected,
        jobsCompleted: jobsCompleted || 0,
        jobsCancelled: jobsCancelled || 0,
        jobsCreated: jobsCreated || 0,
        openJobs: openJobs || 0,
        totalRevenue,
        previousTotalRevenue,
        previousOpenJobs: previousOpenJobs || 1, // Avoid division by zero
        topTechnicians
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsData();
  }, [user, timeFilter, customDateRange]);

  // Handle time filter change
  const handleTimeFilterChange = (value: TimeFilter) => {
    setTimeFilter(value);
  };

  // Handle custom date range selection
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setCustomDateRange({
        from: range.from,
        to: range.to
      });
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date): string => {
    return format(date, 'MMM d, yyyy');
  };

  const getFilterLabel = (): string => {
    const range = getDateRange();
    
    switch (timeFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      case 'thisMonth':
        return 'This Month';
      case 'custom':
        if (range.from && range.to) {
          if (format(range.from, 'MMM yyyy') === format(range.to, 'MMM yyyy')) {
            return `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`;
          }
          return `${formatDate(range.from)} - ${formatDate(range.to)}`;
        }
        return 'Custom Range';
      default:
        return 'This Month';
    }
  };

  const calculateRevenueChange = () => {
    if (metrics.previousTotalRevenue === 0) return 0;
    return Math.round(((metrics.totalRevenue - metrics.previousTotalRevenue) / metrics.previousTotalRevenue) * 100);
  };

  const calculateOpenJobsChange = () => {
    if (metrics.previousOpenJobs === 0) return 0;
    return Math.round(((metrics.openJobs - metrics.previousOpenJobs) / metrics.previousOpenJobs) * 100);
  };

  return {
    metrics,
    isLoading,
    timeFilter,
    customDateRange,
    getFilterLabel,
    handleTimeFilterChange,
    handleDateRangeChange,
    formatValue,
    fetchMetricsData,
    calculateRevenueChange,
    calculateOpenJobsChange
  };
};
