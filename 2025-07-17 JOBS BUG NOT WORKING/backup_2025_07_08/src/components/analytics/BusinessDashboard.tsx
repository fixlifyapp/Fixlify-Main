
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Award
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface BusinessDashboardProps {
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const BusinessDashboard = ({ timeframe, onTimeframeChange }: BusinessDashboardProps) => {
  const [kpis, setKpis] = useState({
    totalRevenue: 127500,
    revenueGrowth: 15.3,
    totalJobs: 324,
    jobsGrowth: 8.7,
    avgJobValue: 395,
    avgJobGrowth: 12.1,
    customerSatisfaction: 4.8,
    satisfactionTrend: 0.2,
    completionRate: 94.5,
    completionTrend: 2.1,
    responseTime: 18,
    responseTimeTrend: -15.2
  });

  const revenueData = [
    { month: 'Jan', revenue: 18500, jobs: 47 },
    { month: 'Feb', revenue: 21200, jobs: 52 },
    { month: 'Mar', revenue: 19800, jobs: 49 },
    { month: 'Apr', revenue: 23100, jobs: 58 },
    { month: 'May', revenue: 25400, jobs: 61 },
    { month: 'Jun', revenue: 19700, jobs: 51 }
  ];

  const serviceBreakdown = [
    { name: 'HVAC Repair', value: 35, color: '#3b82f6' },
    { name: 'Plumbing', value: 28, color: '#10b981' },
    { name: 'Electrical', value: 22, color: '#f59e0b' },
    { name: 'General Maintenance', value: 15, color: '#ef4444' }
  ];

  const KPICard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    format = 'number',
    suffix = '' 
  }: {
    title: string;
    value: number;
    trend: number;
    icon: any;
    format?: 'number' | 'currency' | 'percentage';
    suffix?: string;
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      return val.toString();
    };

    const isPositive = trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">
                {formatValue(value)}{suffix}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}% vs last period
                </span>
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Business Overview</h2>
        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="last90days">Last 90 Days</SelectItem>
            <SelectItem value="last12months">Last 12 Months</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={kpis.totalRevenue}
          trend={kpis.revenueGrowth}
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title="Total Jobs"
          value={kpis.totalJobs}
          trend={kpis.jobsGrowth}
          icon={Calendar}
        />
        <KPICard
          title="Average Job Value"
          value={kpis.avgJobValue}
          trend={kpis.avgJobGrowth}
          icon={Target}
          format="currency"
        />
        <KPICard
          title="Customer Satisfaction"
          value={kpis.customerSatisfaction}
          trend={kpis.satisfactionTrend}
          icon={Award}
          suffix="/5"
        />
        <KPICard
          title="Job Completion Rate"
          value={kpis.completionRate}
          trend={kpis.completionTrend}
          icon={CheckCircle}
          format="percentage"
        />
        <KPICard
          title="Avg Response Time"
          value={kpis.responseTime}
          trend={kpis.responseTimeTrend}
          icon={Clock}
          suffix=" min"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Jobs Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Jobs Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goals and Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Goals & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Revenue Goal</span>
                <span className="text-sm text-muted-foreground">$127.5K / $150K</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">85% of monthly goal</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Jobs Completed</span>
                <span className="text-sm text-muted-foreground">324 / 350</span>
              </div>
              <Progress value={92.6} className="h-2" />
              <p className="text-xs text-muted-foreground">93% of monthly goal</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm text-muted-foreground">4.8 / 4.5</span>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">Goal exceeded!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Revenue Growth</p>
                  <p className="text-xs text-muted-foreground">15.3% increase compared to last month</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Response Time Improved</p>
                  <p className="text-xs text-muted-foreground">Average response time reduced by 15%</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Peak Hours Analysis</p>
                  <p className="text-xs text-muted-foreground">Most jobs scheduled between 9-11 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Retention</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  92%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First-Time Fix Rate</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  87%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technician Efficiency</span>
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  95%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Revenue per Technician</span>
                <Badge variant="default" className="bg-orange-100 text-orange-800">
                  $42.5K
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
