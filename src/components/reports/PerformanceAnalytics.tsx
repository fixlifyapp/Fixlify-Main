
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";

interface PerformanceDataPoint {
  date: string;
  jobsCompleted: number;
  revenue: number;
  avgResponseTime: number;
}

interface TechnicianMetric {
  id: string;
  name: string;
  jobs: number;
  revenue: number;
  avgJobTime: number;
  efficiency: number;
}

interface ServiceMetric {
  name: string;
  value: number;
  revenue: number;
}

interface KPIs {
  avgResponseTime: number;
  responseTimeImprovement: number;
  revenuePerJob: number;
  revenuePerJobGrowth: number;
  teamUtilization: number;
  jobCompletionRate: number;
}

interface PerformanceAnalyticsProps {
  performanceData: PerformanceDataPoint[];
  technicianData: TechnicianMetric[];
  serviceData: ServiceMetric[];
  kpis: KPIs;
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  isLoading?: boolean;
}

export const PerformanceAnalytics = ({
  performanceData,
  technicianData,
  serviceData,
  kpis,
  timeRange,
  onTimeRangeChange,
  isLoading = false
}: PerformanceAnalyticsProps) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isResponseTimeImproved = kpis.responseTimeImprovement >= 0;
  const isRevenuePerJobGrowthPositive = kpis.revenuePerJobGrowth >= 0;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.avgResponseTime}h</div>
            <div className={`text-xs ${isResponseTimeImproved ? 'text-green-600' : 'text-orange-600'}`}>
              {isResponseTimeImproved ? '-' : '+'}{Math.abs(kpis.responseTimeImprovement)}% {isResponseTimeImproved ? 'faster' : 'slower'} than last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Per Job</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isRevenuePerJobGrowthPositive ? 'text-green-600' : 'text-orange-600'}`}>
              {formatCurrency(kpis.revenuePerJob)}
            </div>
            <div className={`text-xs ${isRevenuePerJobGrowthPositive ? 'text-green-600' : 'text-orange-600'}`}>
              {isRevenuePerJobGrowthPositive ? '+' : ''}{kpis.revenuePerJobGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis.teamUtilization}%</div>
            <Progress value={kpis.teamUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.jobCompletionRate >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
              {kpis.jobCompletionRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              {kpis.jobCompletionRate >= 95 ? 'Excellent' : kpis.jobCompletionRate >= 85 ? 'Good' : 'Needs improvement'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No performance data available for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'Revenue') return formatCurrency(value as number);
                  return value;
                }} />
                <Bar yAxisId="left" dataKey="jobsCompleted" fill="#8884d8" name="Jobs Completed" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Technician Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Technician Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {technicianData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No technician performance data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {technicianData.map((tech) => (
                <div key={tech.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{tech.name}</h4>
                    <Badge variant={tech.efficiency >= 90 ? "default" : "secondary"}>
                      {tech.efficiency}% efficiency
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Jobs Completed</p>
                      <p className="font-medium">{tech.jobs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-medium">{formatCurrency(tech.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Job Time</p>
                      <p className="font-medium">{tech.avgJobTime}h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Rating</p>
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                  </div>
                  <Progress value={tech.efficiency} className="h-2 mt-3" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Service Type Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No service data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceData.map((service) => (
                <div key={service.name} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{service.name}</h4>
                    <Badge variant="outline">
                      {service.value}% of jobs
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Revenue</p>
                      <p className="font-medium">{formatCurrency(service.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Satisfaction</p>
                      <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
