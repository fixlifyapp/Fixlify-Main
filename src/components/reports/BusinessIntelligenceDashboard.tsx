
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
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
  PieChart,
  Pie,
  Cell
} from "recharts";

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
}

interface KPIs {
  monthlyRevenue: number;
  revenueGrowth: number;
  activeCustomers: number;
  customerGrowth: number;
  avgResponseTime: number;
  responseTimeImprovement: number;
}

interface BusinessIntelligenceDashboardProps {
  revenueData: RevenueDataPoint[];
  serviceData: ServiceData[];
  technicianData: TechnicianData[];
  kpis: KPIs;
  isLoading?: boolean;
}

export const BusinessIntelligenceDashboard = ({
  revenueData,
  serviceData,
  technicianData,
  kpis,
  isLoading = false
}: BusinessIntelligenceDashboardProps) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRevenueGrowthPositive = kpis.revenueGrowth >= 0;
  const isCustomerGrowthPositive = kpis.customerGrowth >= 0;
  const isResponseTimeImproved = kpis.responseTimeImprovement >= 0;

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isRevenueGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(kpis.monthlyRevenue)}
            </div>
            <div className={`flex items-center gap-1 text-xs ${isRevenueGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isRevenueGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isRevenueGrowthPositive ? '+' : ''}{kpis.revenueGrowth}% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requires customer review system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeCustomers.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-xs ${isCustomerGrowthPositive ? 'text-blue-600' : 'text-red-600'}`}>
              {isCustomerGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{isCustomerGrowthPositive ? '+' : ''}{kpis.customerGrowth}% this period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgResponseTime}h</div>
            <div className={`flex items-center gap-1 text-xs ${isResponseTimeImproved ? 'text-green-600' : 'text-orange-600'}`}>
              {isResponseTimeImproved ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              <span>{isResponseTimeImproved ? '-' : '+'}{Math.abs(kpis.responseTimeImprovement)}% {isResponseTimeImproved ? 'faster' : 'slower'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue vs Target Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Actual Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#82ca9d" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Breakdown and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Service Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {serviceData.map((service, index) => (
                  <div key={service.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(service.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {technicianData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No technician data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {technicianData.map((tech) => (
                  <div key={tech.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{tech.name}</span>
                      <Badge variant={tech.efficiency >= 90 ? "default" : "secondary"}>
                        {tech.efficiency}% efficiency
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <span>{tech.jobs} jobs completed</span>
                      <span>{formatCurrency(tech.revenue)} revenue</span>
                    </div>
                    <Progress value={tech.efficiency} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Business Insights & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Revenue Insight */}
            {kpis.revenueGrowth > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Revenue Growing</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Revenue increased {kpis.revenueGrowth}% compared to last period.
                  </p>
                </div>
              </div>
            ) : kpis.revenueGrowth < 0 ? (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Revenue Attention Needed</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Revenue decreased {Math.abs(kpis.revenueGrowth)}% compared to last period.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Customer Growth Insight */}
            {kpis.customerGrowth > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Customer Growth</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Active customer base grew by {kpis.customerGrowth}% this period.
                  </p>
                </div>
              </div>
            )}

            {/* Team Efficiency Insight */}
            {technicianData.filter(t => t.efficiency < 85).length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Team Efficiency Opportunity</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {technicianData.filter(t => t.efficiency < 85).length} team member(s) below 85% efficiency.
                  </p>
                </div>
              </div>
            )}

            {/* No insights available */}
            {kpis.revenueGrowth === 0 && kpis.customerGrowth <= 0 && technicianData.filter(t => t.efficiency < 85).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No alerts at this time. Keep up the good work!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
