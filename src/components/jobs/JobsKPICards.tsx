import { useEffect, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Briefcase, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface JobsKPICardsProps {
  className?: string;
}

export const JobsKPICards = ({ className }: JobsKPICardsProps) => {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedThisMonth: 0,
    completionRate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!user?.id || jobsLoading) return;
    fetchStats();
  }, [user?.id, jobs, jobsLoading]);

  const fetchStats = async () => {
    if (!user?.id) return;

    setIsLoadingStats(true);
    try {
      console.log('Fetching job stats for user:', user.id);
      console.log('Current jobs:', jobs);
      
      // Total jobs
      const totalJobs = jobs.length;

      // Log all unique statuses to debug
      const uniqueStatuses = [...new Set(jobs.map(job => job.status))];
      console.log('Unique job statuses in data:', uniqueStatuses);

      // Active jobs (in-progress, scheduled, not-started)
      const activeJobs = jobs.filter(job => {
        const isActive = ['in-progress', 'scheduled', 'not-started', 'pending'].includes(job.status?.toLowerCase() || '');
        console.log(`Job ${job.id} status: ${job.status}, isActive: ${isActive}`);
        return isActive;
      }).length;

      // Completed this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      console.log('Date range for this month:', {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      });

      const { count: completedThisMonth, error: completedError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .ilike('status', 'completed')
        .gte('updated_at', startOfMonth.toISOString());

      if (completedError) {
        console.error('Error fetching completed jobs:', completedError);
      }

      // Completion rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: totalLast30, error: totalError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (totalError) {
        console.error('Error fetching total jobs last 30 days:', totalError);
      }

      const { count: completedLast30, error: completedLast30Error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .ilike('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (completedLast30Error) {
        console.error('Error fetching completed jobs last 30 days:', completedLast30Error);
      }

      const completionRate = totalLast30 > 0 
        ? Math.round((completedLast30 || 0) / totalLast30 * 100)
        : 0;

      // If no jobs exist, show demo data for visualization
      const finalStats = totalJobs === 0 ? {
        totalJobs: 0,
        activeJobs: 0,
        completedThisMonth: 0,
        completionRate: 0
      } : {
        totalJobs,
        activeJobs,
        completedThisMonth: completedThisMonth || 0,
        completionRate
      };

      console.log('Stats calculated:', finalStats);

      setStats(finalStats);
    } catch (error) {
      console.error('Error fetching job stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const kpiCards = [
    {
      title: "Total",
      value: stats.totalJobs,
      label: "Total Jobs",
      icon: Briefcase,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Active",
      value: stats.activeJobs,
      label: "Active Jobs",
      icon: Clock,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Completed",
      value: stats.completedThisMonth,
      label: "Completed This Month",
      icon: CheckCircle,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      label: "30-Day Completion",
      icon: TrendingUp,
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      borderColor: "border-pink-200"
    }
  ];

  if (isLoadingStats || jobsLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6 animate-pulse"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl border ${card.borderColor} ${card.bgColor} p-6 transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  <p className={`text-sm font-medium ${card.iconColor}`}>
                    {card.title}
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="text-sm text-gray-600">
                  {card.label}
                </p>
              </div>
            </div>
            {/* Decorative background element */}
            <div 
              className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${card.bgColor} opacity-50`}
            />
          </div>
        );
      })}
    </div>
  );
};
