import { AUTOMATION_CONFIG, logAutomationDebug } from './config';

/**
 * Tracks automation executions to prevent infinite loops and recursive execution
 */
export class AutomationExecutionTracker {
  private static executionHistory = new Map<string, Set<string>>();
  private static executionCounts = new Map<string, number>();
  private static readonly MAX_EXECUTIONS_PER_ENTITY = AUTOMATION_CONFIG.MAX_EXECUTIONS_PER_ENTITY;
  private static readonly CLEANUP_INTERVAL = AUTOMATION_CONFIG.EXECUTION_TRACKING_WINDOW;
  private static cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Check if an automation can be executed for a given entity
   */
  static canExecute(workflowId: string, entityId: string, entityType: string): boolean {
    const key = `${workflowId}-${entityType}-${entityId}`;
    const count = this.executionCounts.get(key) || 0;
    
    if (count >= this.MAX_EXECUTIONS_PER_ENTITY) {
      console.warn(`Automation ${workflowId} has reached max executions (${this.MAX_EXECUTIONS_PER_ENTITY}) for ${entityType} ${entityId}`);
      logAutomationDebug(`Max executions reached`, { workflowId, entityType, entityId, count });
      return false;
    }
    
    return true;
  }

  /**
   * Track an automation execution
   */
  static trackExecution(workflowId: string, entityId: string, entityType: string): void {
    const key = `${workflowId}-${entityType}-${entityId}`;
    const count = this.executionCounts.get(key) || 0;
    this.executionCounts.set(key, count + 1);
    
    logAutomationDebug(`Tracking execution`, { workflowId, entityType, entityId, newCount: count + 1 });
    
    // Track in history
    if (!this.executionHistory.has(workflowId)) {
      this.executionHistory.set(workflowId, new Set());
    }
    this.executionHistory.get(workflowId)!.add(`${entityType}-${entityId}`);
    
    // Start cleanup timer if not already running
    if (!this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  /**
   * Check if an entity was created by automation (to prevent cascading)
   */
  static isCreatedByAutomation(entity: any): boolean {
    const isCreated = entity.created_by_automation !== null && entity.created_by_automation !== undefined;
    if (isCreated) {
      logAutomationDebug(`Entity created by automation`, { 
        entityId: entity.id, 
        createdByAutomation: entity.created_by_automation 
      });
    }
    return isCreated;
  }

  /**
   * Clear old execution history to prevent memory leaks
   */
  private static cleanup(): void {
    // Clear execution counts older than 5 minutes
    this.executionCounts.clear();
    this.executionHistory.clear();
    
    // Stop timer if no more executions
    if (this.executionCounts.size === 0 && this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Reset all tracking (useful for testing)
   */
  static reset(): void {
    this.executionCounts.clear();
    this.executionHistory.clear();
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
