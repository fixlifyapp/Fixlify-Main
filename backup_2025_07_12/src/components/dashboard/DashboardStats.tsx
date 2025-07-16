
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export const DashboardStats = () => {
  const [stats, setStats] = useState({
    clientCount: 0,
    jobCount: 0,
    revenue: 0,
    completionRate: 0,
    isLoading: true
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch clients count
        const { count: clientCount, error: clientError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
          
        if (clientError) throw clientError;
        
        // Fetch jobs data
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('status, revenue');
          
        if (jobsError) throw jobsError;
        
        // Calculate stats from jobs data
        const totalJobs = jobs ? jobs.length : 0;
        const completedJobs = jobs ? jobs.filter(job => job.status === 'completed').length : 0;
        const totalRevenue = jobs ? jobs.reduce((sum, job) => 
          sum + (typeof job.revenue === 'number' ? job.revenue : parseFloat(job.revenue || '0')), 0) : 0;
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;
        
        setStats({
          clientCount: clientCount || 0,
          jobCount: totalJobs,
          revenue: totalRevenue,
          completionRate,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchStats();
  }, [user]);

  // Calculate monthly change percentages (mocked for now)
  // In a real app, you would compare with historical data
  const getChangePercent = (value: number, base: number) => {
    return Math.round(((value - base) / base) * 100) || 0;
  };

  // Format stats for display
  const formattedStats = [
    {
      name: 'Total Clients',
      value: stats.clientCount.toString(),
      change: getChangePercent(stats.clientCount, stats.clientCount * 0.95),
      isPositive: true
    },
    {
      name: 'Active Jobs',
      value: stats.jobCount.toString(),
      change: getChangePercent(stats.jobCount, stats.jobCount * 0.92),
      isPositive: true
    },
    {
      name: 'Revenue',
      value: `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: getChangePercent(stats.revenue, stats.revenue * 0.89),
      isPositive: true
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate.toFixed(1)}%`,
      change: getChangePercent(stats.completionRate, stats.completionRate * 0.97),
      isPositive: true
    }
  ];

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Business Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {stats.isLoading ? (
          // Show loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-28 bg-gray-200 rounded my-1"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          formattedStats.map((stat, index) => (
            <div key={index}>
              <p className="text-fixlyfy-text-secondary text-sm">{stat.name}</p>
              <p className="text-2xl font-semibold my-1">{stat.value}</p>
              <div className="flex items-center">
                <div className={cn(
                  "flex items-center text-xs mr-2",
                  stat.isPositive ? "text-fixlyfy-success" : "text-fixlyfy-error"
                )}>
                  {stat.isPositive ? 
                    <ArrowUpIcon size={12} className="mr-1" /> : 
                    <ArrowDownIcon size={12} className="mr-1" />
                  }
                  {stat.change}%
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">vs last month</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
