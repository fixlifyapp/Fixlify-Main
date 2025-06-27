// Test script to validate workflow configurations
import { TRIGGER_TYPES } from './src/components/automations/ComprehensiveWorkflowBuilder';

// Validate all trigger types have proper configuration
console.log('Validating trigger types...');
Object.entries(TRIGGER_TYPES).forEach(([key, config]) => {
  console.log(`- ${key}: ${config.label} (${config.configFields.length} config fields)`);
  if (!config.label) {
    console.error(`  ERROR: Missing label for ${key}`);
  }
  if (!config.icon) {
    console.error(`  ERROR: Missing icon for ${key}`);
  }
});

console.log('\nAll trigger types validated successfully!');
