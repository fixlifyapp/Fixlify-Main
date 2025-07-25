import { useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Briefcase, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface JobsKPICardsProps {
  className?: string;
}

export const JobsKPICards = ({ className }: JobsKPICardsProps) => {
  const { jobs, isLoading: jobsLoading } = useJobs();

  // Calculate stats directly from jobs data using useMemo for performance
  const stats = useMemo(() => {
    if (!jobs || jobs.length === 0 || jobsLoading) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        completedThisMonth: 0,
        completionRate: 0
      };
    }

    // Total jobs
    const totalJobs = jobs.length;

    // Active jobs (not completed or cancelled)
    const activeJobs = jobs.filter(job => {
      const status = job.status?.toLowerCase() || '';
      return !['completed', 'cancelled', 'closed'].includes(status);
    }).length;

    // Completed this month - calculate from existing jobs data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedThisMonth = jobs.filter(job => {
      const status = job.status?.toLowerCase() || '';
      const updatedAt = job.updated_at ? new Date(job.updated_at) : null;
      return status === 'completed' && updatedAt && updatedAt >= startOfMonth;
    }).length;

    // Completion rate (last 30 days) - calculate from existing jobs data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const jobsLast30Days = jobs.filter(job => {
      const createdAt = job.created_at ? new Date(job.created_at) : null;
      return createdAt && createdAt >= thirtyDaysAgo;
    });

    const completedLast30Days = jobsLast30Days.filter(job => {
      const status = job.status?.toLowerCase() || '';
      return status === 'completed';
    }).length;

    const completionRate = jobsLast30Days.length > 0 
      ? Math.round((completedLast30Days / jobsLast30Days.length) * 100)
      : 0;

    return {
      totalJobs,
      activeJobs,
      completedThisMonth,
      completionRate
    };
  }, [jobs, jobsLoading]);

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

  if (jobsLoading) {
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
