// Main automation hooks
export { useAutomations } from './useAutomations';
export { useAutomationBuilder } from './useAutomationBuilder';
export { useAutomationTemplates } from './useAutomationTemplates';
export { useAutomationExecution } from './useAutomationExecution';
export { useAutomationAnalytics } from './useAutomationAnalytics';

// Re-export types
export type {
  AutomationWorkflow,
  AutomationTemplate,
  AutomationHistory
} from './useAutomations';

export type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowBuilder
} from './useAutomationBuilder';

export type {
  TemplateCategory
} from './useAutomationTemplates';

export type {
  ExecutionStep,
  ExecutionContext
} from './useAutomationExecution';

export type {
  AutomationMetrics,
  WorkflowPerformance,
  TimeSeriesData
} from './useAutomationAnalytics';