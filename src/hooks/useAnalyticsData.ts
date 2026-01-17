import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./use-organization";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, subWeeks, format, parseISO, differenceInHours } from "date-fns";

interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
}

interface ServiceData {
  name: string;
  value: number;
  revenue: number;
}

interface TechnicianData {
  id: string;
  name: string;
  jobs: number;
  revenue: number;
  efficiency: number;
  avgJobTime: number;
}

interface PerformanceDataPoint {
  date: string;
  jobsCompleted: number;
  revenue: number;
  avgResponseTime: number;
}

interface KPIs {
  monthlyRevenue: number;
  revenueGrowth: number;
  activeCustomers: number;
  customerGrowth: number;
  avgResponseTime: number;
  responseTimeImprovement: number;
  revenuePerJob: number;
  revenuePerJobGrowth: number;
  teamUtilization: number;
  jobCompletionRate: number;
}

interface AnalyticsData {
  revenueData: RevenueDataPoint[];
  serviceData: ServiceData[];
  technicianData: TechnicianData[];
  performanceData: PerformanceDataPoint[];
  kpis: KPIs;
  isLoading: boolean;
  error: Error | null;
}

export function useAnalyticsData(timeRange: string = "30d"): AnalyticsData {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  // Calculate date ranges based on timeRange
  const dateRanges = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (timeRange) {
      case "7d":
        startDate = subWeeks(now, 1);
        previousStartDate = subWeeks(now, 2);
        previousEndDate = subWeeks(now, 1);
        break;
      case "90d":
        startDate = subMonths(now, 3);
        previousStartDate = subMonths(now, 6);
        previousEndDate = subMonths(now, 3);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        previousStartDate = subMonths(now, 24);
        previousEndDate = subMonths(now, 12);
        break;
      case "30d":
      default:
        startDate = subMonths(now, 1);
        previousStartDate = subMonths(now, 2);
        previousEndDate = subMonths(now, 1);
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      previousStartDate: previousStartDate.toISOString(),
      previousEndDate: previousEndDate.toISOString()
    };
  }, [timeRange]);

  // Fetch jobs data
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ["analytics-jobs", orgId, timeRange],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("jobs")
        .select("id, status, revenue, service, technician_id, client_id, created_at, schedule_start, schedule_end")
        .eq("organization_id", orgId)
        .gte("created_at", dateRanges.startDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId
  });

  // Fetch previous period jobs for comparison
  const { data: previousJobsData } = useQuery({
    queryKey: ["analytics-jobs-previous", orgId, timeRange],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("jobs")
        .select("id, status, revenue, service, technician_id, client_id, created_at")
        .eq("organization_id", orgId)
        .gte("created_at", dateRanges.previousStartDate)
        .lt("created_at", dateRanges.previousEndDate);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId
  });

  // Fetch technicians/profiles
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ["analytics-profiles", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, avatar_url")
        .eq("organization_id", orgId)
        .in("role", ["technician", "admin", "manager"]);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId
  });

  // Fetch active clients
  const { data: clientsData } = useQuery({
    queryKey: ["analytics-clients", orgId, timeRange],
    queryFn: async () => {
      if (!orgId) return { current: 0, previous: 0 };

      // Get unique clients from current period jobs
      const currentClients = new Set(jobsData?.map(j => j.client_id).filter(Boolean) || []);
      const previousClients = new Set(previousJobsData?.map(j => j.client_id).filter(Boolean) || []);

      return {
        current: currentClients.size,
        previous: previousClients.size
      };
    },
    enabled: !!orgId && !!jobsData
  });

  // Calculate all analytics
  const analyticsData = useMemo((): AnalyticsData => {
    const defaultKPIs: KPIs = {
      monthlyRevenue: 0,
      revenueGrowth: 0,
      activeCustomers: 0,
      customerGrowth: 0,
      avgResponseTime: 0,
      responseTimeImprovement: 0,
      revenuePerJob: 0,
      revenuePerJobGrowth: 0,
      teamUtilization: 0,
      jobCompletionRate: 0
    };

    if (!jobsData || jobsData.length === 0) {
      return {
        revenueData: [],
        serviceData: [],
        technicianData: [],
        performanceData: [],
        kpis: defaultKPIs,
        isLoading: jobsLoading || profilesLoading,
        error: jobsError as Error | null
      };
    }

    // Calculate revenue by month (last 6 months)
    const revenueByMonth = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, "MMM");
      revenueByMonth.set(monthKey, 0);
    }

    jobsData.forEach(job => {
      if (job.status === "completed" && job.revenue) {
        const monthKey = format(parseISO(job.created_at), "MMM");
        if (revenueByMonth.has(monthKey)) {
          revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + job.revenue);
        }
      }
    });

    const revenueData: RevenueDataPoint[] = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({
      month,
      revenue,
      target: Math.round(revenue * 1.1) // Target 10% higher
    }));

    // Calculate revenue by service type
    const serviceRevenue = new Map<string, { revenue: number; count: number }>();
    jobsData.forEach(job => {
      if (job.status === "completed") {
        const service = job.service || "Other";
        const current = serviceRevenue.get(service) || { revenue: 0, count: 0 };
        serviceRevenue.set(service, {
          revenue: current.revenue + (job.revenue || 0),
          count: current.count + 1
        });
      }
    });

    const totalJobs = jobsData.filter(j => j.status === "completed").length;
    const serviceData: ServiceData[] = Array.from(serviceRevenue.entries())
      .map(([name, data]) => ({
        name,
        value: totalJobs > 0 ? Math.round((data.count / totalJobs) * 100) : 0,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Calculate technician performance
    const techPerformance = new Map<string, { jobs: number; revenue: number; totalHours: number }>();
    jobsData.forEach(job => {
      if (job.technician_id && job.status === "completed") {
        const current = techPerformance.get(job.technician_id) || { jobs: 0, revenue: 0, totalHours: 0 };
        let jobHours = 2; // Default 2 hours
        if (job.schedule_start && job.schedule_end) {
          jobHours = differenceInHours(parseISO(job.schedule_end), parseISO(job.schedule_start)) || 2;
        }
        techPerformance.set(job.technician_id, {
          jobs: current.jobs + 1,
          revenue: current.revenue + (job.revenue || 0),
          totalHours: current.totalHours + jobHours
        });
      }
    });

    const technicianData: TechnicianData[] = (profilesData || [])
      .filter(p => techPerformance.has(p.id))
      .map(profile => {
        const perf = techPerformance.get(profile.id)!;
        const avgJobTime = perf.jobs > 0 ? perf.totalHours / perf.jobs : 0;
        // Efficiency based on jobs per day (assuming 8 hour workday, 22 work days)
        const maxPossibleJobs = (22 * 8) / Math.max(avgJobTime, 1);
        const efficiency = Math.min(Math.round((perf.jobs / maxPossibleJobs) * 100), 100);

        return {
          id: profile.id,
          name: profile.name || "Unknown",
          jobs: perf.jobs,
          revenue: perf.revenue,
          efficiency: efficiency || 75,
          avgJobTime: Math.round(avgJobTime * 10) / 10
        };
      })
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 4);

    // Calculate weekly performance data
    const performanceData: PerformanceDataPoint[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekEnd = endOfWeek(subWeeks(now, i));
      const weekJobs = jobsData.filter(job => {
        const jobDate = parseISO(job.created_at);
        return jobDate >= weekStart && jobDate <= weekEnd && job.status === "completed";
      });

      const weekRevenue = weekJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);

      // Calculate avg response time for the week
      const responseTimes = weekJobs
        .filter(j => j.created_at && j.schedule_start)
        .map(j => differenceInHours(parseISO(j.schedule_start), parseISO(j.created_at)));
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      performanceData.push({
        date: `Week ${4 - i}`,
        jobsCompleted: weekJobs.length,
        revenue: weekRevenue,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10
      });
    }

    // Calculate KPIs
    const completedJobs = jobsData.filter(j => j.status === "completed");
    const previousCompletedJobs = (previousJobsData || []).filter(j => j.status === "completed");

    const currentRevenue = completedJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);
    const previousRevenue = previousCompletedJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);

    const revenueGrowth = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    const currentCustomers = clientsData?.current || 0;
    const previousCustomers = clientsData?.previous || 0;
    const customerGrowth = previousCustomers > 0
      ? Math.round(((currentCustomers - previousCustomers) / previousCustomers) * 100)
      : 0;

    // Calculate average response time
    const responseTimes = completedJobs
      .filter(j => j.created_at && j.schedule_start)
      .map(j => differenceInHours(parseISO(j.schedule_start), parseISO(j.created_at)));
    const avgResponseTime = responseTimes.length > 0
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10
      : 0;

    const previousResponseTimes = previousCompletedJobs
      .filter(j => j.created_at && j.schedule_start)
      .map(j => differenceInHours(parseISO(j.schedule_start), parseISO(j.created_at)));
    const previousAvgResponseTime = previousResponseTimes.length > 0
      ? previousResponseTimes.reduce((a, b) => a + b, 0) / previousResponseTimes.length
      : avgResponseTime;

    const responseTimeImprovement = previousAvgResponseTime > 0
      ? Math.round(((previousAvgResponseTime - avgResponseTime) / previousAvgResponseTime) * 100)
      : 0;

    const revenuePerJob = completedJobs.length > 0
      ? Math.round(currentRevenue / completedJobs.length)
      : 0;
    const previousRevenuePerJob = previousCompletedJobs.length > 0
      ? previousRevenue / previousCompletedJobs.length
      : revenuePerJob;
    const revenuePerJobGrowth = previousRevenuePerJob > 0
      ? Math.round(((revenuePerJob - previousRevenuePerJob) / previousRevenuePerJob) * 100)
      : 0;

    // Team utilization (based on scheduled vs available hours)
    const scheduledHours = completedJobs.reduce((sum, job) => {
      if (job.schedule_start && job.schedule_end) {
        return sum + differenceInHours(parseISO(job.schedule_end), parseISO(job.schedule_start));
      }
      return sum + 2; // Default 2 hours per job
    }, 0);
    const technicianCount = (profilesData || []).filter(p => ["technician", "admin"].includes(p.role || "")).length || 1;
    const availableHours = technicianCount * 22 * 8; // 22 work days, 8 hours
    const teamUtilization = Math.min(Math.round((scheduledHours / availableHours) * 100), 100);

    // Job completion rate
    const totalJobsInPeriod = jobsData.length;
    const jobCompletionRate = totalJobsInPeriod > 0
      ? Math.round((completedJobs.length / totalJobsInPeriod) * 100 * 10) / 10
      : 0;

    return {
      revenueData,
      serviceData,
      technicianData,
      performanceData,
      kpis: {
        monthlyRevenue: currentRevenue,
        revenueGrowth,
        activeCustomers: currentCustomers,
        customerGrowth,
        avgResponseTime,
        responseTimeImprovement,
        revenuePerJob,
        revenuePerJobGrowth,
        teamUtilization,
        jobCompletionRate
      },
      isLoading: jobsLoading || profilesLoading,
      error: jobsError as Error | null
    };
  }, [jobsData, previousJobsData, profilesData, clientsData, jobsLoading, profilesLoading, jobsError]);

  return analyticsData;
}
