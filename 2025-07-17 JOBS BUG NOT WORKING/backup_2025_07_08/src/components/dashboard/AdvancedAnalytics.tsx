
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TimePeriod } from "@/types/dashboard";

interface AdvancedAnalyticsProps {
  timePeriod: TimePeriod;
  dateRange: { from: Date | undefined; to: Date | undefined };
}

export const AdvancedAnalytics = ({ timePeriod, dateRange }: AdvancedAnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState({
    revenueGrowth: {
      current: 45280,
      previous: 38650,
      trend: 17.2,
      forecast: 52000
    },
    customerMetrics: {
      acquisition: 23,
      retention: 87.5,
      lifetime_value: 1247,
      churn_rate: 3.2
    },
    operationalEfficiency: {
      job_completion_rate: 94.8,
      response_time: 2.3,
      technician_utilization: 78.5,
      customer_satisfaction: 4.6
    },
    revenueByService: [
      { name: 'HVAC', value: 35, amount: 15848 },
      { name: 'Plumbing', value: 28, amount: 12678 },
      { name: 'Electrical', value: 22, amount: 9962 },
      { name: 'General', value: 15, amount: 6792 }
    ],
    monthlyTrends: [
      { month: 'Jan', revenue: 32000, jobs: 89, customers: 76 },
      { month: 'Feb', revenue: 35200, jobs: 94, customers: 82 },
      { month: 'Mar', revenue: 38600, jobs: 108, customers: 91 },
      { month: 'Apr', revenue: 42100, jobs: 115, customers: 98 },
      { month: 'May', revenue: 45280, jobs: 127, customers: 105 }
    ]
  });

  const [insights, setInsights] = useState([
    {
      type: 'opportunity',
      title: 'Peak Season Approaching',
      description: 'HVAC demand typically increases 40% in summer months. Consider staff adjustments.',
      impact: 'revenue'
    },
    {
      type: 'warning',
      title: 'Technician Capacity',
      description: 'Current utilization at 78.5%. May need additional resources for growth.',
      impact: 'operations'
    },
    {
      type: 'success',
      title: 'Customer Retention Strong',
      description: 'Retention rate improved 5% this quarter. Keep up the excellent service.',
      impact: 'customer'
    }
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold">{analyticsData.revenueGrowth.trend}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={analyticsData.revenueGrowth.trend} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">vs previous period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Retention</p>
                <p className="text-2xl font-bold">{analyticsData.customerMetrics.retention}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={analyticsData.customerMetrics.retention} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">excellent retention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Completion</p>
                <p className="text-2xl font-bold">{analyticsData.operationalEfficiency.job_completion_rate}%</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={analyticsData.operationalEfficiency.job_completion_rate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">on-time delivery</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{analyticsData.operationalEfficiency.customer_satisfaction}/5</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={(analyticsData.operationalEfficiency.customer_satisfaction / 5) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">customer rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : name === 'jobs' ? 'Jobs' : 'Customers'
                ]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="jobs" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.revenueByService}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.revenueByService.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'opportunity' ? 'bg-green-100' :
                  insight.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {insight.type === 'opportunity' ? (
                    <TrendingUp className={`h-4 w-4 ${
                      insight.type === 'opportunity' ? 'text-green-600' : ''
                    }`} />
                  ) : insight.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
