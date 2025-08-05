import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  RefreshCw
} from 'lucide-react';

// Mock data for analytics
const executionData = [
  { name: 'Mon', executions: 45, success: 42, failed: 3 },
  { name: 'Tue', executions: 52, success: 48, failed: 4 },
  { name: 'Wed', executions: 38, success: 36, failed: 2 },
  { name: 'Thu', executions: 61, success: 57, failed: 4 },
  { name: 'Fri', executions: 55, success: 52, failed: 3 },
  { name: 'Sat', executions: 32, success: 30, failed: 2 },
  { name: 'Sun', executions: 28, success: 27, failed: 1 },
];

const performanceData = [
  { time: '00:00', responseTime: 1.2, throughput: 85 },
  { time: '04:00', responseTime: 0.9, throughput: 92 },
  { time: '08:00', responseTime: 2.1, throughput: 76 },
  { time: '12:00', responseTime: 1.8, throughput: 81 },
  { time: '16:00', responseTime: 1.5, throughput: 88 },
  { time: '20:00', responseTime: 1.1, throughput: 90 },
];

const triggerTypeData = [
  { name: 'Job Status', value: 35, color: '#3b82f6' },
  { name: 'Schedule', value: 25, color: '#10b981' },
  { name: 'Manual', value: 20, color: '#f59e0b' },
  { name: 'API', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const topWorkflows = [
  { name: 'Job Completed Notification', executions: 245, successRate: 98.2, avgTime: '1.2s' },
  { name: 'Follow-up Email', executions: 189, successRate: 96.8, avgTime: '2.1s' },
  { name: 'Payment Reminder', executions: 156, successRate: 94.5, avgTime: '1.8s' },
  { name: 'Appointment Confirmation', executions: 134, successRate: 99.1, avgTime: '0.9s' },
  { name: 'Invoice Sent', executions: 98, successRate: 97.6, avgTime: '1.5s' },
];

export const AutomationAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Analytics</h2>
          <p className="text-gray-600">Monitor and analyze your automation performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">96.8%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+2.1%</span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">1.5s</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">-0.2s</span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+3</span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Execution Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10b981" name="Success" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Response Time (s)" />
                <Line type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trigger Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Trigger Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={triggerTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {triggerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Workflows */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topWorkflows.map((workflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{workflow.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {workflow.executions} runs
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-gray-600">{workflow.successRate}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-600">{workflow.avgTime}</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={workflow.successRate} className="w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                time: '2 minutes ago', 
                workflow: 'Job Completed Notification', 
                status: 'success', 
                action: 'Email sent to client',
                icon: Mail
              },
              { 
                time: '5 minutes ago', 
                workflow: 'Payment Reminder', 
                status: 'success', 
                action: 'SMS sent to client',
                icon: MessageSquare
              },
              { 
                time: '12 minutes ago', 
                workflow: 'Follow-up Email', 
                status: 'failed', 
                action: 'Email delivery failed',
                icon: Mail
              },
              { 
                time: '18 minutes ago', 
                workflow: 'Appointment Confirmation', 
                status: 'success', 
                action: 'Notification sent',
                icon: Calendar
              },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      activity.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.workflow}</span>
                      <Badge 
                        variant={activity.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};