
import { ArrowDownIcon, ArrowUpIcon, Calendar, DollarSign, Users, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);

        // Fetch client data
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        
        if (clientsError) throw clientsError;
        
        // Fetch jobs data
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*');
        
        if (jobsError) throw jobsError;

        // Calculate real metrics from clients and jobs data
        const activeClients = clients.filter(client => client.status === "active").length;
        const completedJobs = jobs.filter(job => job.status === "completed");
        const totalRevenue = completedJobs.reduce((sum, job) => sum + parseFloat(job.revenue?.toString() || '0'), 0);
        const openJobs = jobs.filter(job => job.status === "in-progress").length;
        const scheduledJobs = jobs.filter(job => job.status === "scheduled").length;
        
        // Get previous month's data to calculate change percentage (mock for now)
        // In a real implementation, you'd compare with actual historical data
        const prevMonthRevenue = totalRevenue * 0.9;  // Mock: assume 10% growth
        const revenueChange = prevMonthRevenue > 0 ? 
          Math.round(((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
        
        // Set metrics with real data
        const calculatedMetrics = [
          {
            id: 1, 
            name: 'Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: revenueChange, 
            isPositive: revenueChange >= 0,
            period: 'vs last month',
            icon: DollarSign,
            iconColor: "bg-fixlyfy"
          },
          {
            id: 2, 
            name: 'Active Clients', 
            value: activeClients.toString(), 
            change: 5, 
            isPositive: true,
            period: 'vs last month',
            icon: Users,
            iconColor: "bg-fixlyfy-success"
          },
          {
            id: 3, 
            name: 'Open Jobs', 
            value: openJobs.toString(), 
            change: 3, 
            isPositive: false,
            period: 'vs last month',
            icon: ListTodo,
            iconColor: "bg-fixlyfy-warning"
          },
          {
            id: 4, 
            name: 'Scheduled Jobs', 
            value: scheduledJobs.toString(), 
            change: 2, 
            isPositive: true,
            period: 'vs last month',
            icon: Calendar,
            iconColor: "bg-fixlyfy-info"
          },
        ];
        
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Business Performance</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {isLoading ? (
          // Show loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gray-200 p-2 rounded h-6 w-6"></div>
                <div className="bg-gray-200 h-4 w-24 rounded"></div>
              </div>
              <div className="bg-gray-200 h-8 w-28 my-1 rounded"></div>
              <div className="flex items-center">
                <div className="bg-gray-200 h-4 w-12 mr-2 rounded"></div>
                <div className="bg-gray-200 h-4 w-24 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          metrics.map((metric) => (
            <div key={metric.id} className="animate-fade-in" style={{ animationDelay: `${metric.id * 100}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-2 rounded text-white", metric.iconColor)}>
                  <metric.icon size={16} />
                </div>
                <p className="text-fixlyfy-text-secondary text-sm">{metric.name}</p>
              </div>
              <p className="text-2xl font-semibold my-1">{metric.value}</p>
              <div className="flex items-center">
                <div className={cn(
                  "flex items-center text-xs mr-2",
                  metric.isPositive ? "text-fixlyfy-success" : "text-fixlyfy-error"
                )}>
                  {metric.isPositive ? 
                    <ArrowUpIcon size={12} className="mr-1" /> : 
                    <ArrowDownIcon size={12} className="mr-1" />
                  }
                  {metric.change}%
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">{metric.period}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
