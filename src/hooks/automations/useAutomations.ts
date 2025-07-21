// Simplified automation hooks stub

import { useState } from 'react';
import { AutomationWorkflow, AutomationRule } from './automation-stubs';

export const useAutomations = () => {
  const [workflows] = useState<AutomationWorkflow[]>([]);
  const [rules] = useState<AutomationRule[]>([]);
  const [loading] = useState(false);

  return {
    workflows,
    rules,
    loading,
    createWorkflow: async () => ({ id: 'test-workflow' }),
    updateWorkflow: async () => ({ id: 'test-workflow' }),
    deleteWorkflow: async () => true,
    refetch: () => Promise.resolve(),
    getMetrics: () => ({
      totalRules: 0,
      activeRules: 0,
      totalExecutions: 0,
      successRate: 100,
      messagesSent: 0,
      responsesReceived: 0,
      revenueGenerated: 0,
      recentExecutions: 0
    })
  };
};