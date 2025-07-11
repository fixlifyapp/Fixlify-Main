
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ComposedChart, Area, AreaChart } from "recharts";

interface RevenueAnalyticsProps {
  timeframe: string;
}

export const RevenueAnalytics = ({ timeframe }: RevenueAnalyticsProps) => {
  const revenueData = [
    { period: 'Jan', revenue: 18500, costs: 12300, profit: 6200, jobs: 47 },
    { period: 'Feb', revenue: 21200, costs: 14100, profit: 7100, jobs: 52 },
    { period: 'Mar', revenue: 19800, costs: 13200, profit: 6600, jobs: 49 },
    { period: 'Apr', revenue: 23100, costs: 15400, profit: 7700, jobs: 58 },
    { period: 'May', revenue: 25400, costs: 16900, profit: 8500, jobs: 61 },
    { period: 'Jun', revenue: 19700, costs: 13100, profit: 6600, jobs: 51 }
  ];

  const serviceRevenueData = [
    { service: 'HVAC Repair', revenue: 45200, percentage: 35.5, jobs: 115 },
    { service: 'Plumbing', revenue: 35800, percentage: 28.1, jobs: 91 },
    { service: 'Electrical', revenue: 28100, percentage: 22.1, jobs: 71 },
    { service: 'Maintenance', revenue: 18400, percentage: 14.4, jobs: 47 }
  ];

  const dailyRevenue = [
    { day: 'Mon', revenue: 4200, jobs: 11 },
    { day: 'Tue', revenue: 3800, jobs: 9 },
    { day: 'Wed', revenue: 4600, jobs: 12 },
    { day: 'Thu', revenue: 4100, jobs: 10 },
    { day: 'Fri', revenue: 4800, jobs: 13 },
    { day: 'Sat', revenue: 3200, jobs: 8 },
    { day: 'Sun', revenue: 2100, jobs: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revenue Analytics</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$127,500</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+15.3%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Costs</p>
                <p className="text-2xl font-bold">$85,000</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">+8.1%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold">$42,500</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+28.7%</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">33.3%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+3.2%</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Costs Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="profit" 
                fill="#10b981" 
                fillOpacity={0.3}
                stroke="#10b981"
                name="Profit ($)"
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar dataKey="costs" fill="#ef4444" name="Costs ($)" />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Jobs Count"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRevenueData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Service Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceRevenueData.map((service) => (
              <div key={service.service} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{service.service}</h4>
                    <Badge variant="outline">{service.percentage}%</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Revenue:</span> ${service.revenue.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Jobs:</span> {service.jobs}
                    </div>
                    <div>
                      <span className="font-medium">Avg per Job:</span> ${Math.round(service.revenue / service.jobs).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Next Month Projection</h4>
              <p className="text-2xl font-bold text-blue-600">$28,900</p>
              <p className="text-sm text-blue-700">+13.7% growth expected</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Quarter Projection</h4>
              <p className="text-2xl font-bold text-green-600">$82,500</p>
              <p className="text-sm text-green-700">Based on current trends</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Annual Projection</h4>
              <p className="text-2xl font-bold text-purple-600">$315,000</p>
              <p className="text-sm text-purple-700">12-month forecast</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
