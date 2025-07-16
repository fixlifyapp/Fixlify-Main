
import { supabase } from "@/integrations/supabase/client";

export interface JobsSummary {
  date: string;
  total_revenue: number;
  total_cost: number;
  job_count: number;
}

export interface TechnicianPerformance {
  date: string;
  revenue: number;
  cost: number;
  jobs_closed: number;
}

export const reportsDataService = {
  async getJobsSummary(startDate: string, endDate: string): Promise<JobsSummary[]> {
    try {
      const { data, error } = await supabase
        .from('fact_jobs')
        .select('date_day, revenue')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Aggregate data by date
      const aggregated = data.reduce((acc, row) => {
        const date = row.date_day;
        if (!acc[date]) {
          acc[date] = {
            date,
            total_revenue: 0,
            total_cost: 0,
            job_count: 0
          };
        }
        acc[date].total_revenue += row.revenue || 0;
        acc[date].job_count += 1;
        return acc;
      }, {} as Record<string, JobsSummary>);

      return Object.values(aggregated);
    } catch (error) {
      console.error('Error fetching jobs summary:', error);
      return [];
    }
  },

  async getTechnicianPerformance(
    technicianId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TechnicianPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('fact_jobs')
        .select('date_day, revenue, status')
        .eq('technician_id', technicianId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Aggregate data by date
      const aggregated = data.reduce((acc, row) => {
        const date = row.date_day;
        if (!acc[date]) {
          acc[date] = {
            date,
            revenue: 0,
            cost: 0,
            jobs_closed: 0
          };
        }
        acc[date].revenue += row.revenue || 0;
        if (row.status === 'completed') {
          acc[date].jobs_closed += 1;
        }
        return acc;
      }, {} as Record<string, TechnicianPerformance>);

      return Object.values(aggregated);
    } catch (error) {
      console.error('Error fetching technician performance:', error);
      return [];
    }
  }
};
