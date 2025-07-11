import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface AutomationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  timeSavedHours: number;
  messagesSent: number;
  deliveryRate: number;
  responseRate: number;
  revenueImpact: number;
}

export interface WorkflowPerformance {
  workflowId: string;
  workflowName: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface TimeSeriesData {
  date: string;
  executions: number;
  successes: number;
  failures: number;
  messagesSent: number;
  responsesReceived: number;
}

export const useAutomationAnalytics = (timeRange: '7d' | '30d' | '90d' = '7d') => {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    averageExecutionTime: 0,
    timeSavedHours: 0,
    messagesSent: 0,
    deliveryRate: 0,
    responseRate: 0,
    revenueImpact: 0
  });
  
  const [workflowPerformance, setWorkflowPerformance] = useState<WorkflowPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  // Calculate date range
  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const start = startOfDay(subDays(end, days));
    
    return { start, end, days };
  }, [timeRange]);

  // Fetch overall metrics
  const fetchMetrics = async () => {
    if (!organization?.id) return;

    try {
      // Get workflow counts
      const { data: workflows } = await supabase
        .from('automation_workflows')
        .select('id, status')
        .eq('organization_id', organization.id);

      const totalWorkflows = workflows?.length || 0;
      const activeWorkflows = workflows?.filter(w => w.status === 'active').length || 0;

      // Get execution data
      const { data: executions } = await supabase
        .from('automation_history')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      const totalExecutions = executions?.length || 0;
      const successfulExecutions = executions?.filter(e => e.execution_status === 'success').length || 0;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      // Calculate average execution time
      const totalTime = executions?.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) || 0;
      const averageExecutionTime = totalExecutions > 0 ? totalTime / totalExecutions : 0;

      // Get communication metrics
      const { data: communications } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('organization_id', organization.id)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .not('created_by_automation', 'is', null);

      const messagesSent = communications?.length || 0;
      const delivered = communications?.filter(c => c.status === 'delivered').length || 0;
      const deliveryRate = messagesSent > 0 ? (delivered / messagesSent) * 100 : 0;

      // Calculate response rate (simplified - would need response tracking)
      const responses = communications?.filter(c => c.response_received).length || 0;
      const responseRate = delivered > 0 ? (responses / delivered) * 100 : 0;

      // Estimate time saved (5 minutes per automated action)
      const timeSavedHours = (totalExecutions * 5) / 60;

      // Calculate revenue impact (would need job/payment data)
      const revenueImpact = await calculateRevenueImpact(organization.id, dateRange);

      setMetrics({
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        successRate,
        averageExecutionTime,
        timeSavedHours,
        messagesSent,
        deliveryRate,
        responseRate,
        revenueImpact
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Fetch workflow-level performance
  const fetchWorkflowPerformance = async () => {
    if (!organization?.id) return;

    try {
      const { data: workflows } = await supabase
        .from('automation_workflows')
        .select(`
          id,
          name,
          automation_history (
            id,
            execution_status,
            execution_time_ms,
            created_at
          )
        `)
        .eq('organization_id', organization.id)
        .gte('automation_history.created_at', dateRange.start.toISOString())
        .lte('automation_history.created_at', dateRange.end.toISOString());

      const performance: WorkflowPerformance[] = workflows?.map(workflow => {
        const history = workflow.automation_history || [];
        const executionCount = history.length;
        const successCount = history.filter(h => h.execution_status === 'success').length;
        const failureCount = history.filter(h => h.execution_status === 'failed').length;
        const successRate = executionCount > 0 ? (successCount / executionCount) * 100 : 0;
        
        const totalTime = history.reduce((sum, h) => sum + (h.execution_time_ms || 0), 0);
        const averageExecutionTime = executionCount > 0 ? totalTime / executionCount : 0;
        
        const lastExecution = history
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        // Calculate trend (simplified)
        const recentHistory = history.slice(-10);
        const recentSuccessRate = recentHistory.length > 0 
          ? (recentHistory.filter(h => h.execution_status === 'success').length / recentHistory.length) * 100
          : 0;
        const trend = recentSuccessRate > successRate ? 'up' : 
                     recentSuccessRate < successRate ? 'down' : 'stable';

        return {
          workflowId: workflow.id,
          workflowName: workflow.name,
          executionCount,
          successCount,
          failureCount,
          successRate,
          averageExecutionTime,
          lastExecuted: lastExecution ? new Date(lastExecution.created_at) : undefined,
          trend
        };
      }) || [];

      setWorkflowPerformance(performance);
    } catch (error) {
      console.error('Error fetching workflow performance:', error);
    }
  };

  // Fetch time series data
  const fetchTimeSeriesData = async () => {
    if (!organization?.id) return;

    try {
      const data: TimeSeriesData[] = [];
      
      for (let i = 0; i < dateRange.days; i++) {
        const date = subDays(dateRange.end, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        // Get executions for this day
        const { data: executions } = await supabase
          .from('automation_history')
          .select('execution_status')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        const dayExecutions = executions?.length || 0;
        const daySuccesses = executions?.filter(e => e.execution_status === 'success').length || 0;
        const dayFailures = executions?.filter(e => e.execution_status === 'failed').length || 0;

        // Get communications for this day
        const { data: communications } = await supabase
          .from('communication_logs')
          .select('status, response_received')
          .eq('organization_id', organization.id)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
          .not('created_by_automation', 'is', null);

        const dayMessages = communications?.length || 0;
        const dayResponses = communications?.filter(c => c.response_received).length || 0;

        data.unshift({
          date: format(date, 'yyyy-MM-dd'),
          executions: dayExecutions,
          successes: daySuccesses,
          failures: dayFailures,
          messagesSent: dayMessages,
          responsesReceived: dayResponses
        });
      }

      setTimeSeriesData(data);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  // Calculate revenue impact
  const calculateRevenueImpact = async (orgId: string, range: any): Promise<number> => {
    try {
      // Get jobs created or converted through automations
      const { data: jobs } = await supabase
        .from('jobs')
        .select('total')
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())
        .not('created_by_automation', 'is', null);

      const revenue = jobs?.reduce((sum, job) => sum + (job.total || 0), 0) || 0;
      return revenue;
    } catch (error) {
      console.error('Error calculating revenue impact:', error);
      return 0;
    }
  };

  // Get insights and recommendations
  const getInsights = () => {
    const insights = [];

    // Success rate insight
    if (metrics.successRate < 80) {
      insights.push({
        type: 'warning',
        title: 'Low Success Rate',
        description: `Your automation success rate is ${metrics.successRate.toFixed(1)}%. Review failing automations to improve reliability.`,
        action: 'Review Failures'
      });
    }

    // Response rate insight
    if (metrics.responseRate > 30) {
      insights.push({
        type: 'success',
        title: 'High Engagement',
        description: `Your automated messages have a ${metrics.responseRate.toFixed(1)}% response rate. Great job!`,
        action: 'View Top Performers'
      });
    }

    // Underutilized workflows
    const inactiveWorkflows = workflowPerformance.filter(w => w.executionCount === 0);
    if (inactiveWorkflows.length > 0) {
      insights.push({
        type: 'info',
        title: 'Inactive Automations',
        description: `${inactiveWorkflows.length} automation(s) haven't run in the selected period.`,
        action: 'Review Inactive'
      });
    }

    // Time saved insight
    if (metrics.timeSavedHours > 10) {
      insights.push({
        type: 'success',
        title: 'Significant Time Savings',
        description: `You've saved approximately ${Math.round(metrics.timeSavedHours)} hours through automation!`,
        action: 'See Details'
      });
    }

    return insights;
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchWorkflowPerformance(),
        fetchTimeSeriesData()
      ]);
      setLoading(false);
    };

    if (organization?.id) {
      loadData();
    }
  }, [organization?.id, timeRange]);

  return {
    metrics,
    workflowPerformance,
    timeSeriesData,
    insights: getInsights(),
    loading,
    refetch: {
      metrics: fetchMetrics,
      performance: fetchWorkflowPerformance,
      timeSeries: fetchTimeSeriesData
    }
  };
};