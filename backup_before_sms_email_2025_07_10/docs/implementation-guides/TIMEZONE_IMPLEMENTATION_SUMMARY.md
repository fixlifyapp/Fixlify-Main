# Timezone Implementation for Workflow SMS and Email Steps

## Summary of Changes

We've successfully implemented timezone-aware date and time formatting for SMS and email workflow steps in Fixlify. The system now uses the user's configured timezone instead of displaying times in the browser's local timezone.

## Key Changes Made:

### 1. **automation-execution.ts**
- Added timezone support to the main automation execution service
- Implemented `getUserTimezone()` method to fetch timezone from user profile
- Updated `interpolateVariables()` to use timezone-aware formatting
- Modified `formatDate()` and `formatTime()` to use `date-fns-tz` for proper timezone conversion
- Added backward compatibility method `executeAutomation()` for existing code

### 2. **automation-execution-service.ts**
- Added timezone parameter to workflow execution methods
- Updated `resolveVariables()` to include timezone-aware date/time variables
- Modified `replaceVariables()` to handle timezone formatting
- Updated `sendSMS()` and `sendEmail()` methods to pass timezone context

### 3. **useAutomationExecution.ts hook**
- Imported `date-fns-tz` for timezone handling
- Added `useCompanySettings()` to get user timezone
- Updated `interpolateVariables()` function to format dates/times in user's timezone
- Added special handling for date/time variables like:
  - `{{current_date}}` - Current date in user's timezone
  - `{{current_time}}` - Current time in user's timezone
  - `{{scheduled_date}}`/`{{appointment_date}}` - Job scheduled date in user's timezone
  - `{{scheduled_time}}`/`{{appointment_time}}` - Job scheduled time in user's timezone
  - `{{tomorrow_date}}` - Tomorrow's date in user's timezone

### 4. **Dependencies**
- Installed `date-fns-tz` package for timezone conversions

## How It Works:

1. When a workflow is executed, the system fetches the user's timezone from their profile settings
2. All date/time variables in SMS and email templates are converted from UTC to the user's timezone
3. The formatted date/time strings use consistent formatting:
   - Dates: "EEE, MMM d, yyyy" (e.g., "Mon, Jan 15, 2025")
   - Times: "h:mm a" (e.g., "2:30 PM")

## Timezone Source:

The timezone is retrieved from the `profiles` table in the database, which stores each user's timezone preference. If no timezone is set, it defaults to 'America/New_York'.

## Example:

If a user in Pacific Time (America/Los_Angeles) has a job scheduled for 2025-01-15 20:00:00 UTC:
- Before: Would show as browser's local time
- After: Shows as "Wed, Jan 15, 2025" and "12:00 PM" (correctly converted to PST)

## Files Modified:

1. `/src/services/automation-execution.ts` - Main execution service
2. `/src/services/automation-execution-service.ts` - Static execution service
3. `/src/hooks/automations/useAutomationExecution.ts` - React hook for UI
4. `package.json` - Added date-fns-tz dependency

## Testing:

To test the implementation:
1. Set different timezones in user profiles
2. Create workflows with SMS/email steps containing time variables
3. Execute the workflows and verify times are displayed in the user's timezone

The implementation ensures that all automated messages display times that are meaningful to the recipient based on their location settings.
