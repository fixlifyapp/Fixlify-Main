
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AutomationExecution {
  id: string;
  workflow_id: string;
  execution_status: string;
  created_at: string;
  execution_time_ms: number;
  actions_executed: any;
  error_details: any;
  variables_used: any;
  trigger_id: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  enabled: boolean;
  category: string;
  execution_count: number;
  success_count: number;
  last_executed_at: string;
}

export default function FixlifyAutomationAnalytics() {
  const { data: executions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['automation-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AutomationExecution[];
    }
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['automation-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AutomationWorkflow[];
    }
  });

  // Calculate metrics
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(ex => ex.execution_status === 'success').length;
  const failedExecutions = executions.filter(ex => ex.execution_status === 'failed').length;
  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
  const avgExecutionTime = executions.length > 0 
    ? executions.reduce((sum, ex) => sum + (ex.execution_time_ms || 0), 0) / executions.length 
    : 0;

  // Prepare chart data
  const dailyExecutions = executions.reduce((acc, execution) => {
    const date = new Date(execution.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const executionData = Object.entries(dailyExecutions)
    .slice(-7)
    .map(([date, count]) => ({ date, executions: count }));

  const statusData = [
    { name: 'Success', value: successfulExecutions, color: '#10B981' },
    { name: 'Failed', value: failedExecutions, color: '#EF4444' },
    { name: 'Pending', value: executions.filter(ex => ex.execution_status === 'pending').length, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  const categoryData = workflows.reduce((acc, workflow) => {
    const category = workflow.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  if (executionsLoading || workflowsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium text-gray-500">Total Executions</div>
            </div>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium text-gray-500">Success Rate</div>
            </div>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium text-gray-500">Avg Response Time</div>
            </div>
            <div className="text-2xl font-bold">{avgExecutionTime.toFixed(0)}ms</div>
            <p className="text-xs text-gray-500">Average execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div className="text-sm font-medium text-gray-500">Active Workflows</div>
            </div>
            <div className="text-2xl font-bold">{workflows.filter(w => w.enabled).length}</div>
            <p className="text-xs text-gray-500">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="executions" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execution Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.slice(0, 10).map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {execution.execution_status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : execution.execution_status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">Workflow {execution.workflow_id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(execution.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={execution.execution_status === 'success' ? 'default' : 'destructive'}>
                        {execution.execution_status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {execution.execution_time_ms}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${workflow.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-gray-500">Category: {workflow.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{workflow.execution_count || 0} executions</p>
                      <p className="text-sm text-gray-500">
                        {workflow.success_count || 0} successful
                      </p>
                      {workflow.last_executed_at && (
                        <p className="text-xs text-gray-400">
                          Last: {new Date(workflow.last_executed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
