
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Download, 
  TrendingUp,
  Eye,
  Clock,
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
  PieChart,
  Pie,
  Cell
} from "recharts";

export const ReportAnalytics = () => {
  const reportUsageData = [
    { month: 'Sep', generated: 45, downloaded: 38, viewed: 42 },
    { month: 'Oct', generated: 52, downloaded: 41, viewed: 48 },
    { month: 'Nov', generated: 48, downloaded: 35, viewed: 44 },
    { month: 'Dec', generated: 61, downloaded: 52, viewed: 58 },
    { month: 'Jan', generated: 58, downloaded: 49, viewed: 55 }
  ];

  const templatePopularity = [
    { name: 'Executive Summary', usage: 35, color: '#3b82f6' },
    { name: 'Financial Report', usage: 28, color: '#10b981' },
    { name: 'Operational Metrics', usage: 22, color: '#f59e0b' },
    { name: 'Customer Insights', usage: 15, color: '#ef4444' }
  ];

  const userEngagement = [
    { user: 'Sarah Johnson', reports: 24, avgTime: '4.2 min', lastAccess: '2024-01-15' },
    { user: 'Mike Chen', reports: 18, avgTime: '3.8 min', lastAccess: '2024-01-15' },
    { user: 'Emily Rodriguez', reports: 15, avgTime: '5.1 min', lastAccess: '2024-01-14' },
    { user: 'David Wilson', reports: 12, avgTime: '2.9 min', lastAccess: '2024-01-14' },
    { user: 'Lisa Wang', reports: 9, avgTime: '3.6 min', lastAccess: '2024-01-13' }
  ];

  const exportFormats = [
    { format: 'PDF', count: 145, percentage: 58 },
    { format: 'Excel', count: 72, percentage: 29 },
    { format: 'CSV', count: 23, percentage: 9 },
    { format: 'PNG', count: 10, percentage: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Report Analytics</h2>
        <p className="text-muted-foreground">Usage statistics and performance insights for your reports</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">284</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">215</div>
            <div className="text-xs text-muted-foreground">75.7% conversion rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">47</div>
            <div className="text-xs text-muted-foreground">Across all departments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg View Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3.8 min</div>
            <div className="text-xs text-muted-foreground">Per report session</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="generated" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Generated"
                />
                <Line 
                  type="monotone" 
                  dataKey="downloaded" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Downloaded"
                />
                <Line 
                  type="monotone" 
                  dataKey="viewed" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Viewed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={templatePopularity}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="usage"
                  label={({ name, usage }) => `${name}: ${usage}%`}
                >
                  {templatePopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userEngagement.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{user.user}</h4>
                    <p className="text-sm text-muted-foreground">Last access: {user.lastAccess}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{user.reports}</p>
                    <p className="text-muted-foreground">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{user.avgTime}</p>
                    <p className="text-muted-foreground">Avg Time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Format Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Export Format Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportFormats.map((format, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{format.format}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{format.count} exports</span>
                    <Badge variant="outline">{format.percentage}%</Badge>
                  </div>
                </div>
                <Progress value={format.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
