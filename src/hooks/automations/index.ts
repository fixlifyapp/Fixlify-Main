// Main automation hooks
export { useAutomations } from './useAutomations';
export { useAutomationBuilder } from './useAutomationBuilder';
export { useAutomationTemplates } from './useAutomationTemplates';
export { useAutomationExecution } from './useAutomationExecution';
export { useAutomationAnalytics } from './useAutomationAnalytics';

// Export types from stubs  
export type { 
  AutomationWorkflow, 
  AutomationTemplate, 
  AutomationHistory,
  AutomationRule,
  TemplateCategory
} from './automation-stubs';

export type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowBuilder
} from './useAutomationBuilder';


export type {
  ExecutionStep,
  ExecutionContext
} from './useAutomationExecution';

export type {
  AutomationMetrics,
  WorkflowPerformance,
  TimeSeriesData
} from './useAutomationAnalytics';