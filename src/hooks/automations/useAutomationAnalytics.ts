// Simplified automation analytics stub

import { useState } from 'react';

export interface AutomationMetrics {
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface WorkflowPerformance {
  workflowId: string;
  metrics: AutomationMetrics;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export const useAutomationAnalytics = () => {
  const [metrics] = useState<AutomationMetrics>({
    totalExecutions: 0,
    successRate: 100,
    avgExecutionTime: 0
  });

  const [performance] = useState<WorkflowPerformance[]>([]);
  const [timeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading] = useState(false);

  return {
    metrics,
    performance,
    timeSeriesData,
    loading,
    refetch: () => Promise.resolve()
  };
};