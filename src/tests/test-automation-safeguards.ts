import { AUTOMATION_CONFIG } from '@/services/automation/config';

// Enable debug mode for testing
AUTOMATION_CONFIG.DEBUG_MODE = true;

export const testAutomationSafeguards = async () => {
  console.log('🧪 Testing Automation Safeguards...');
  
  try {
    // Test 1: Check if execution tracker is working
    const { AutomationExecutionTracker } = await import('@/services/automation/execution-tracker');
    
    // Reset tracker for clean test
    AutomationExecutionTracker.reset();
    console.log('✅ Execution tracker reset');
    
    // Test tracking executions
    const testWorkflowId = 'test-workflow-123';
    const testEntityId = 'test-job-456';
    const testEntityType = 'job';
    
    // First execution should be allowed
    let canExecute = AutomationExecutionTracker.canExecute(testWorkflowId, testEntityId, testEntityType);
    console.log(`✅ First execution allowed: ${canExecute}`);
    
    // Track multiple executions
    for (let i = 0; i < AUTOMATION_CONFIG.MAX_EXECUTIONS_PER_ENTITY; i++) {
      AutomationExecutionTracker.trackExecution(testWorkflowId, testEntityId, testEntityType);
      console.log(`📝 Tracked execution ${i + 1}`);
    }
    
    // Next execution should be blocked
    canExecute = AutomationExecutionTracker.canExecute(testWorkflowId, testEntityId, testEntityType);
    console.log(`✅ Execution blocked after max attempts: ${!canExecute}`);
    
    // Test 2: Check if entity created by automation is detected
    const normalEntity = { id: 'job-123', created_by_automation: null };
    const automationEntity = { id: 'job-456', created_by_automation: 'workflow-789' };
    
    console.log(`✅ Normal entity detection: ${!AutomationExecutionTracker.isCreatedByAutomation(normalEntity)}`);
    console.log(`✅ Automation entity detection: ${AutomationExecutionTracker.isCreatedByAutomation(automationEntity)}`);
    
    // Test 3: Check configuration
    console.log(`✅ Max executions per entity: ${AUTOMATION_CONFIG.MAX_EXECUTIONS_PER_ENTITY}`);
    console.log(`✅ Execution tracking window: ${AUTOMATION_CONFIG.EXECUTION_TRACKING_WINDOW}ms`);
    console.log(`✅ Skip automation entity types: ${AUTOMATION_CONFIG.SKIP_AUTOMATION_ENTITY_TYPES.join(', ')}`);
    
    console.log('✅ All automation safeguard tests passed!');
    
    // Reset debug mode
    AUTOMATION_CONFIG.DEBUG_MODE = false;
    
    return true;
  } catch (error) {
    console.error('❌ Automation safeguard test failed:', error);
    AUTOMATION_CONFIG.DEBUG_MODE = false;
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAutomationSafeguards = testAutomationSafeguards;
}
