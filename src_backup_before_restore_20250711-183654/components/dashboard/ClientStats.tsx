
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { TimePeriod } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientStatsProps {
  timePeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
  isRefreshing?: boolean;
}

export const ClientStats = ({ timePeriod, dateRange, isRefreshing = false }: ClientStatsProps) => {
  const [newClients, setNewClients] = useState(0);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [repeatJobsRatio, setRepeatJobsRatio] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClientStats = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Create date filters based on time period
        let fromDate, toDate;
        const now = new Date();
        
        if (timePeriod === "custom" && dateRange.from && dateRange.to) {
          fromDate = dateRange.from.toISOString();
          toDate = dateRange.to.toISOString();
        } else {
          // Calculate date range based on selected period
          const today = new Date();
          
          if (timePeriod === "week") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            fromDate = oneWeekAgo.toISOString();
          } else if (timePeriod === "month") {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            fromDate = oneMonthAgo.toISOString();
          } else if (timePeriod === "quarter") {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(today.getDate() - 90);
            fromDate = ninetyDaysAgo.toISOString();
          }
          
          toDate = today.toISOString();
        }
        
        // Count new clients created in period
        const { count: newClientsCount, error: newClientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', fromDate)
          .lte('created_at', toDate);
          
        if (newClientsError) throw newClientsError;
        
        setNewClients(newClientsCount || 0);
        
        // Get clients with jobs and revenue
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('client_id, revenue, clients(name)')
          .not('client_id', 'is', null)
          .order('revenue', { ascending: false });
          
        if (jobsError) throw jobsError;
        
        // Calculate revenue per client
        const clientRevenues: Record<string, { revenue: number; name: string; jobCount: number }> = {};
        jobs?.forEach(job => {
          if (job.client_id) {
            if (!clientRevenues[job.client_id]) {
              clientRevenues[job.client_id] = {
                revenue: 0,
                name: job.clients?.name || 'Unknown Client',
                jobCount: 0
              };
            }
            clientRevenues[job.client_id].revenue += parseFloat(job.revenue?.toString() || '0');
            clientRevenues[job.client_id].jobCount += 1;
          }
        });
        
        // Get top clients by revenue
        const topClientsList = Object.entries(clientRevenues)
          .map(([id, data]) => ({
            id,
            name: data.name,
            revenue: data.revenue,
            jobCount: data.jobCount
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
          
        setTopClients(topClientsList);
        
        // Calculate repeat jobs ratio
        const totalJobs = jobs?.length || 0;
        const clientsWithMultipleJobs = Object.values(clientRevenues).filter(data => data.jobCount > 1).length;
        const repeatJobs = Object.values(clientRevenues).reduce((sum, client) => sum + Math.max(0, client.jobCount - 1), 0);
        
        setRepeatJobsRatio(totalJobs > 0 ? Math.round((repeatJobs / totalJobs) * 100) : 0);
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientStats();
  }, [user, timePeriod, dateRange, isRefreshing]);

  const clientChartData = topClients.map(client => ({
    name: client.name.length > 15 ? client.name.substring(0, 15) + '...' : client.name,
    revenue: client.revenue,
    jobs: client.jobCount
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isRefreshing ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-fixlyfy-text-secondary">New Clients This Period</p>
                  <p className="text-2xl font-semibold">{newClients}</p>
                </div>
                <div>
                  <p className="text-sm text-fixlyfy-text-secondary">Repeat Jobs Ratio</p>
                  <p className="text-2xl font-semibold">{repeatJobsRatio}%</p>
                  <p className="text-xs text-fixlyfy-text-secondary">of jobs are with repeat clients</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isRefreshing ? (
            <div className="h-[250px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
            </div>
          ) : topClients.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    labelFormatter={(label) => `Client: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#8A4DD5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-fixlyfy-text-secondary">
              No client revenue data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
