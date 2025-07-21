// Simplified automation analytics stub

import { useState } from 'react';
import { AutomationMetrics, WorkflowPerformance, TimeSeriesData } from './automation-stubs';

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