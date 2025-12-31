
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { TimePeriod } from "@/types/dashboard";
import { toast } from "sonner";
import { DollarSign, CheckCircle, CalendarClock, Users } from "lucide-react";

interface KpiData {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  gradient: string;
  loading: boolean;
}

interface EnhancedKpiCardsProps {
  timePeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
  isRefreshing?: boolean;
}

export const EnhancedKpiCards = ({ timePeriod, dateRange, isRefreshing = false }: EnhancedKpiCardsProps) => {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Create date filters based on time period
        let fromDate, toDate;
        
        if (timePeriod === "custom" && dateRange.from && dateRange.to) {
          fromDate = dateRange.from.toISOString();
          toDate = dateRange.to.toISOString();
        } else {
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
        
        // Fetch revenue from payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .gte('date', fromDate)
          .lte('date', toDate);
          
        if (paymentsError) throw paymentsError;
        
        const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
        
        // Fetch jobs data
        const { data: completedJobsData, error: completedJobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('status', 'completed')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);
          
        if (completedJobsError) throw completedJobsError;
        
        const { data: openJobsData, error: openJobsError } = await supabase
          .from('jobs')
          .select('id')
          .in('status', ['scheduled', 'in-progress'])
          .gte('created_at', fromDate)
          .lte('created_at', toDate);
          
        if (openJobsError) throw openJobsError;

        // Fetch active clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id')
          .eq('status', 'active');
          
        if (clientsError) throw clientsError;
        
        const completedJobs = completedJobsData?.length || 0;
        const openJobs = openJobsData?.length || 0;
        const activeClients = clientsData?.length || 0;
        
        // Mock change percentages (in real app, compare with previous period)
        setKpis([
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            change: 12.5,
            isPositive: true,
            icon: DollarSign,
            iconColor: 'text-emerald-600',
            gradient: 'from-emerald-500 to-teal-600',
            loading: false
          },
          {
            title: 'Jobs Completed',
            value: completedJobs.toString(),
            change: 8.3,
            isPositive: true,
            icon: CheckCircle,
            iconColor: 'text-green-600',
            gradient: 'from-green-500 to-emerald-600',
            loading: false
          },
          {
            title: 'Open Jobs',
            value: openJobs.toString(),
            change: -2.1,
            isPositive: false,
            icon: CalendarClock,
            iconColor: 'text-amber-600',
            gradient: 'from-amber-500 to-orange-600',
            loading: false
          },
          {
            title: 'Active Clients',
            value: activeClients.toString(),
            change: 15.7,
            isPositive: true,
            icon: Users,
            iconColor: 'text-blue-600',
            gradient: 'from-blue-500 to-indigo-600',
            loading: false
          }
        ]);
      } catch (error) {
        console.error('Error fetching KPI data:', error);
        toast.error('Failed to load KPI data');
        
        // Set placeholder data if there's an error
        setKpis([
          {
            title: 'Total Revenue',
            value: '$0',
            change: 0,
            isPositive: true,
            icon: DollarSign,
            iconColor: 'text-emerald-600',
            gradient: 'from-emerald-500 to-teal-600',
            loading: false
          },
          {
            title: 'Jobs Completed',
            value: '0',
            change: 0,
            isPositive: true,
            icon: CheckCircle,
            iconColor: 'text-green-600',
            gradient: 'from-green-500 to-emerald-600',
            loading: false
          },
          {
            title: 'Open Jobs',
            value: '0',
            change: 0,
            isPositive: true,
            icon: CalendarClock,
            iconColor: 'text-amber-600',
            gradient: 'from-amber-500 to-orange-600',
            loading: false
          },
          {
            title: 'Active Clients',
            value: '0',
            change: 0,
            isPositive: true,
            icon: Users,
            iconColor: 'text-blue-600',
            gradient: 'from-blue-500 to-indigo-600',
            loading: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [user, timePeriod, dateRange, isRefreshing]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {isLoading || isRefreshing
        ? Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        : kpis.map((kpi, index) => (
            <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-0">
                {/* 3D Header with Gradient */}
                <div className={cn(
                  "h-32 bg-gradient-to-br relative overflow-hidden",
                  `bg-gradient-to-br ${kpi.gradient}`
                )}>
                  {/* 3D Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full"></div>
                  </div>
                  
                  {/* Icon Container */}
                  <div className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                    <kpi.icon className="text-white w-6 h-6" />
                  </div>
                  
                  {/* Value Display */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-2xl font-bold leading-none">{kpi.value}</p>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">{kpi.title}</h3>
                  
                  {/* Change Indicator */}
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex items-center text-sm font-semibold",
                        kpi.isPositive ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {kpi.isPositive ? (
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                    <span className="text-xs text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
};
