
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Mail, MailOpen, MousePointer, TrendingUp } from 'lucide-react';

interface EmailMetrics {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface EmailAnalyticsData {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

export const EmailAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for now since email_analytics table was just created
  const mockMetrics: EmailMetrics = {
    sent: 156,
    opened: 98,
    clicked: 24,
    openRate: 62.8,
    clickRate: 15.4
  };

  const mockChartData: EmailAnalyticsData[] = [
    { date: '2024-01-01', sent: 25, opened: 18, clicked: 4 },
    { date: '2024-01-02', sent: 32, opened: 22, clicked: 6 },
    { date: '2024-01-03', sent: 28, opened: 19, clicked: 3 },
    { date: '2024-01-04', sent: 35, opened: 24, clicked: 7 },
    { date: '2024-01-05', sent: 36, opened: 15, clicked: 4 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Analytics
        </h3>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{mockMetrics.sent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Opened</p>
                <p className="text-2xl font-bold">{mockMetrics.opened}</p>
              </div>
              <MailOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Links Clicked</p>
                <p className="text-2xl font-bold">{mockMetrics.clicked}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{mockMetrics.openRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{mockMetrics.clickRate.toFixed(1)}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                <Bar dataKey="opened" fill="#10b981" name="Opened" />
                <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="Opens"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Open Rate Performance</p>
                <p className="text-sm text-green-600">
                  {mockMetrics.openRate > 20 ? 
                    'Above industry average (20%)' : 
                    'Below industry average (20%)'
                  }
                </p>
              </div>
              <Badge variant={mockMetrics.openRate > 20 ? 'default' : 'secondary'}>
                {mockMetrics.openRate > 20 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Click Rate Performance</p>
                <p className="text-sm text-blue-600">
                  {mockMetrics.clickRate > 3 ? 
                    'Above industry average (3%)' : 
                    'Below industry average (3%)'
                  }
                </p>
              </div>
              <Badge variant={mockMetrics.clickRate > 3 ? 'default' : 'secondary'}>
                {mockMetrics.clickRate > 3 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
