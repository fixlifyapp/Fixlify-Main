import { getCurrentTimeInTimezone } from './timezones';

interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
    enabled: boolean;
  };
}

interface BusinessHoursSettings {
  enabled: boolean;
  start: string;
  end: string;
  days?: string[];
}

/**
 * Check if current time is within business hours
 * @param businessHoursSettings - Business hours settings from workflow
 * @param timezone - Timezone to check against (e.g., 'America/Toronto')
 * @returns boolean indicating if current time is within business hours
 */
export const isWithinBusinessHours = (
  businessHoursSettings: BusinessHoursSettings | null,
  timezone: string = 'America/Toronto'
): boolean => {
  // If business hours are not enabled, always return true
  if (!businessHoursSettings?.enabled) {
    return true;
  }

  try {
    // Get current date/time in the specified timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short'
    });

    const parts = formatter.formatToParts(now);
    const currentTime = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}`;
    const currentDay = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() || '';

    // Map short day names to full names
    const dayMap: Record<string, string> = {
      'mon': 'monday',
      'tue': 'tuesday',
      'wed': 'wednesday',
      'thu': 'thursday',
      'fri': 'friday',
      'sat': 'saturday',
      'sun': 'sunday'
    };

    const fullDayName = dayMap[currentDay] || currentDay;

    // Check if current day is in allowed days
    if (businessHoursSettings.days && !businessHoursSettings.days.includes(fullDayName)) {
      return false;
    }

    // Compare times
    const start = businessHoursSettings.start || '09:00';
    const end = businessHoursSettings.end || '17:00';

    return currentTime >= start && currentTime <= end;
  } catch (error) {
    console.error('Error checking business hours:', error);
    // If there's an error, default to allowing the action
    return true;
  }
};

/**
 * Check if current time is within business hours using company settings
 * @param companyBusinessHours - Business hours from company settings
 * @param timezone - Timezone to check against
 * @returns boolean indicating if current time is within business hours
 */
export const isWithinCompanyBusinessHours = (
  companyBusinessHours: BusinessHours | null,
  timezone: string = 'America/Toronto'
): boolean => {
  if (!companyBusinessHours) {
    return true;
  }

  try {
    // Get current date/time in the specified timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'long'
    });

    const parts = formatter.formatToParts(now);
    const currentTime = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}`;
    const currentDay = parts.find(p => p.type === 'weekday')?.value?.toLowerCase() || '';

    // Get business hours for current day
    const dayHours = companyBusinessHours[currentDay];
    
    if (!dayHours || !dayHours.enabled) {
      return false;
    }

    // Compare times
    return currentTime >= dayHours.open && currentTime <= dayHours.close;
  } catch (error) {
    console.error('Error checking company business hours:', error);
    // If there's an error, default to allowing the action
    return true;
  }
};

/**
 * Get the next available time slot within business hours
 * @param businessHoursSettings - Business hours settings
 * @param timezone - Timezone to use
 * @returns Date object for next available time, or null if business hours not enabled
 */
export const getNextBusinessHourSlot = (
  businessHoursSettings: BusinessHoursSettings | null,
  timezone: string = 'America/Toronto'
): Date | null => {
  if (!businessHoursSettings?.enabled) {
    return null;
  }

  try {
    const now = new Date();
    
    // If currently within business hours, return now
    if (isWithinBusinessHours(businessHoursSettings, timezone)) {
      return now;
    }

    // Otherwise, calculate next business day at start time
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set to start of business hours
    const [hours, minutes] = (businessHoursSettings.start || '09:00').split(':');
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return tomorrow;
  } catch (error) {
    console.error('Error calculating next business hour slot:', error);
    return null;
  }
};
