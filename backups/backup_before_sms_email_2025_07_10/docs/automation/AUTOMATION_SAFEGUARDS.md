# Automation Safeguards Documentation

## Overview
This document explains the safeguards implemented to prevent automation loops and resource exhaustion in the Fixlify automation system.

## Problem Solved
The system was experiencing "ERR_INSUFFICIENT_RESOURCES" errors when creating jobs due to automation workflows triggering infinite loops of job creation.

## Solution Components

### 1. Execution Tracker (`/src/services/automation/execution-tracker.ts`)
- Tracks how many times an automation has been executed for a specific entity
- Prevents more than 3 executions per entity within a 5-minute window
- Automatically cleans up old tracking data to prevent memory leaks

### 2. Automation-Created Entity Detection
- Checks the `created_by_automation` field on entities
- Skips automation triggers for entities that were created by automation
- Prevents cascading automation effects

### 3. Configuration Management (`/src/services/automation/config.ts`)
- Centralized configuration for automation behavior
- Configurable limits and timeouts
- Debug mode for troubleshooting

### 4. Enhanced Trigger Service
- Added checks before executing any automation
- Logs skipped automations for debugging
- Properly handles cleanup on service shutdown

## Key Features

### Maximum Execution Limits
- Default: 3 executions per entity
- Configurable via `AUTOMATION_CONFIG.MAX_EXECUTIONS_PER_ENTITY`
- Prevents runaway automation loops

### Time-Based Cleanup
- Tracking data expires after 5 minutes
- Prevents memory leaks from long-running sessions
- Configurable via `AUTOMATION_CONFIG.EXECUTION_TRACKING_WINDOW`

### Debug Mode
- Enable with `AUTOMATION_CONFIG.DEBUG_MODE = true`
- Provides detailed logs of automation decisions
- Useful for troubleshooting automation issues

## Usage

### Testing Safeguards
```javascript
// In browser console
await testAutomationSafeguards()
```

### Monitoring Automation Execution
1. Enable debug mode in the config
2. Watch browser console for detailed logs
3. Look for "Skipping automation" messages

### Adjusting Limits
Edit `/src/services/automation/config.ts` to change:
- Maximum executions per entity
- Tracking window duration
- Debug mode settings

## Database Requirements
- Jobs table must have `created_by_automation` column (already exists)
- Other entity tables should have this column if they trigger automations

## Future Improvements
1. Add rate limiting per user/organization
2. Implement automation execution history in database
3. Add UI for monitoring automation executions
4. Create alerts for automation loops

## Troubleshooting

### Automations Not Running
1. Check if entity was created by automation
2. Verify execution count hasn't exceeded limit
3. Enable debug mode to see detailed logs

### Too Many Automations Running
1. Reduce `MAX_EXECUTIONS_PER_ENTITY`
2. Increase delay between automation checks
3. Review automation workflows for recursive patterns

### Memory Issues
1. Reduce `EXECUTION_TRACKING_WINDOW`
2. Check for memory leaks in automation workflows
3. Monitor browser memory usage

## Best Practices
1. Always test automation workflows in development first
2. Use debug mode when creating new automations
3. Monitor execution counts for popular workflows
4. Implement proper error handling in automation steps
5. Avoid creating entities in automation workflows that trigger the same workflow
