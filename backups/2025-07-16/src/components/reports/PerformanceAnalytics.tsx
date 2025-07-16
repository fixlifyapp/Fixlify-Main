
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useState } from "react";

export const PerformanceAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");

  // Mock performance data
  const performanceData = [
    { date: 'Week 1', jobsCompleted: 28, revenue: 21500, avgResponseTime: 2.8, customerSat: 92 },
    { date: 'Week 2', jobsCompleted: 32, revenue: 24800, avgResponseTime: 2.5, customerSat: 94 },
    { date: 'Week 3', jobsCompleted: 29, revenue: 22300, avgResponseTime: 2.1, customerSat: 96 },
    { date: 'Week 4', jobsCompleted: 35, revenue: 28200, avgResponseTime: 1.9, customerSat: 95 }
  ];

  const technicianMetrics = [
    { 
      name: 'John Smith', 
      jobsCompleted: 24, 
      revenue: 18500, 
      avgJobTime: 3.2, 
      customerRating: 4.8,
      efficiency: 92 
    },
    { 
      name: 'Sarah Johnson', 
      jobsCompleted: 22, 
      revenue: 17200, 
      avgJobTime: 3.5, 
      customerRating: 4.6,
      efficiency: 88 
    },
    { 
      name: 'Mike Wilson', 
      jobsCompleted: 20, 
      revenue: 15800, 
      avgJobTime: 4.1, 
      customerRating: 4.4,
      efficiency: 85 
    },
    { 
      name: 'Lisa Brown', 
      jobsCompleted: 18, 
      revenue: 14200, 
      avgJobTime: 3.8, 
      customerRating: 4.7,
      efficiency: 82 
    }
  ];

  const serviceMetrics = [
    { service: 'HVAC Repair', avgTime: 2.5, revenue: 42000, satisfaction: 96 },
    { service: 'Plumbing', avgTime: 1.8, revenue: 30000, satisfaction: 94 },
    { service: 'Electrical', avgTime: 3.2, revenue: 24000, satisfaction: 92 },
    { service: 'Appliance', avgTime: 2.1, revenue: 18000, satisfaction: 88 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
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
            <div className="text-2xl font-bold text-blue-600">2.3h</div>
            <div className="text-xs text-muted-foreground">
              18% faster than last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Per Job</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$748</div>
            <div className="text-xs text-muted-foreground">
              +12% from target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <Progress value={87} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-xs text-muted-foreground">
              Excellent performance
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
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="jobsCompleted" fill="#8884d8" name="Jobs Completed" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="customerSat" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Customer Satisfaction %"
              />
            </ComposedChart>
          </ResponsiveContainer>
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
          <div className="space-y-4">
            {technicianMetrics.map((tech) => (
              <div key={tech.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">{tech.name}</h4>
                  <Badge variant={tech.efficiency >= 90 ? "default" : "secondary"}>
                    {tech.efficiency}% efficiency
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jobs Completed</p>
                    <p className="font-medium">{tech.jobsCompleted}</p>
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
                    <p className="font-medium">{tech.customerRating}/5.0</p>
                  </div>
                </div>
                <Progress value={tech.efficiency} className="h-2 mt-3" />
              </div>
            ))}
          </div>
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
          <div className="space-y-4">
            {serviceMetrics.map((service) => (
              <div key={service.service} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">{service.service}</h4>
                  <Badge variant="outline">
                    {service.satisfaction}% satisfaction
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-medium">{service.avgTime}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Revenue</p>
                    <p className="font-medium">{formatCurrency(service.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer Satisfaction</p>
                    <Progress value={service.satisfaction} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
