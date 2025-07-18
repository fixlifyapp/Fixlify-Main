/**
 * Configuration for automation system to prevent issues
 */
export const AUTOMATION_CONFIG = {
  // Maximum number of times an automation can be executed for a single entity
  MAX_EXECUTIONS_PER_ENTITY: 3,
  
  // Time window for tracking executions (in milliseconds)
  EXECUTION_TRACKING_WINDOW: 5 * 60 * 1000, // 5 minutes
  
  // Delay before initializing automation triggers (in milliseconds)
  INITIALIZATION_DELAY: 1000,
  
  // Entity types that should skip automation if created by automation
  SKIP_AUTOMATION_ENTITY_TYPES: ['job', 'client', 'invoice', 'estimate'],
  
  // Debug mode - set to true to see detailed logs
  DEBUG_MODE: false,
  
  // Rate limiting settings
  RATE_LIMIT: {
    MAX_EXECUTIONS_PER_MINUTE: 10,
    MAX_EXECUTIONS_PER_HOUR: 100,
  }
};

export const isAutomationDebugMode = () => AUTOMATION_CONFIG.DEBUG_MODE;

export const logAutomationDebug = (message: string, data?: any) => {
  if (AUTOMATION_CONFIG.DEBUG_MODE) {
    console.log(`[Automation] ${message}`, data || '');
  }
};
