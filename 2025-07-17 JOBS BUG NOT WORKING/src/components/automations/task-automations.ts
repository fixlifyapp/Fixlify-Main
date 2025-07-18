// Task Automation Exports
export * from './TaskAutomationShowcase';

// Re-export automation trigger functions for tasks
export { 
  triggerTaskCreated,
  triggerTaskCompleted,
  triggerTaskOverdue,
  triggerTaskStatusChanged 
} from '@/utils/automationTriggers';
