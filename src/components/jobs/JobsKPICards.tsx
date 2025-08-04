import { useMemo } from "react";
import { Briefcase, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import type { Job } from "@/types/job";

interface JobsKPICardsProps {
  className?: string;
  jobs?: Job[];
  isLoading?: boolean;
}

export const JobsKPICards = ({ className, jobs: propJobs, isLoading: propLoading }: JobsKPICardsProps) => {
  // Use useJobs only if jobs not provided as props
  const hookData = propJobs === undefined ? useJobs() : null;
  const jobs = propJobs || hookData?.jobs || [];
  const isLoading = propLoading !== undefined ? propLoading : (hookData?.isLoading || false);

  // Calculate stats directly from jobs data using useMemo for performance
  const stats = useMemo(() => {
    if (!jobs || jobs.length === 0 || isLoading) {
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
  }, [jobs, isLoading]);

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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-6 transition-all duration-300 hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {isLoading ? '-' : card.value}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};