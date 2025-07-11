
import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, Clock, DollarSign, Users, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AutomationAnalyticsProps {
  workflows: any[];
}

export const AutomationAnalytics = ({ workflows }: AutomationAnalyticsProps) => {
  // Mock data for demonstration - replace with real analytics
  const executionData = [
    { name: 'Mon', executions: 12, success: 11 },
    { name: 'Tue', executions: 19, success: 17 },
    { name: 'Wed', executions: 15, success: 14 },
    { name: 'Thu', executions: 22, success: 20 },
    { name: 'Fri', executions: 18, success: 16 },
    { name: 'Sat', executions: 8, success: 8 },
    { name: 'Sun', executions: 5, success: 5 }
  ];

  const categoryData = [
    { name: 'Missed Call', value: 35, color: '#8A4DD5' },
    { name: 'Appointment', value: 25, color: '#B084F9' },
    { name: 'Payment', value: 20, color: '#10B981' },
    { name: 'Review', value: 12, color: '#F59E0B' },
    { name: 'Other', value: 8, color: '#6B7280' }
  ];

  const topPerformers = [
    { name: 'Missed Call Follow-up', executions: 156, successRate: 94.2, revenue: 2450 },
    { name: 'Appointment Reminder', executions: 134, successRate: 91.8, revenue: 1890 },
    { name: 'Payment Collection', executions: 89, successRate: 87.6, revenue: 5670 },
    { name: 'Review Request', executions: 76, successRate: 85.5, revenue: 0 }
  ];

  const totalExecutions = workflows.reduce((sum, w) => sum + w.execution_count, 0);
  const totalSuccess = workflows.reduce((sum, w) => sum + w.success_count, 0);
  const avgSuccessRate = totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernCard variant="elevated" className="group hover:shadow-xl transition-all duration-300">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-3xl font-bold text-gray-900">{totalExecutions}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +23% this week
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fixlyfy to-fixlyfy-light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated" className="group hover:shadow-xl transition-all duration-300">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +5.2% this week
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated" className="group hover:shadow-xl transition-all duration-300">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-3xl font-bold text-gray-900">24.5h</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +8h this week
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        <ModernCard variant="elevated" className="group hover:shadow-xl transition-all duration-300">
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                <p className="text-3xl font-bold text-gray-900">$12.5K</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +$2.1K this week
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends */}
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Execution Trends
              </div>
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="executions" 
                  stroke="#8A4DD5" 
                  strokeWidth={3}
                  dot={{ fill: '#8A4DD5', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ModernCardContent>
        </ModernCard>

        {/* Category Distribution */}
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Automation Categories
              </div>
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Top Performers */}
      <ModernCard variant="elevated">
        <ModernCardHeader>
          <ModernCardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Performing Automations
            </div>
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {topPerformers.map((automation, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fixlyfy to-fixlyfy-light flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{automation.name}</h4>
                    <p className="text-sm text-gray-600">{automation.executions} executions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    {automation.successRate}% success
                  </Badge>
                  {automation.revenue > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      ${automation.revenue} revenue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};
