/**
 * Schedule date/time validation utilities
 * Ensures end date/time is never before start date/time
 */

export interface ScheduleValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that end date is not before start date
 * Returns isValid: true if dates are valid or if either is null
 */
export function validateScheduleDates(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): ScheduleValidation {
  if (!startDate || !endDate) {
    return { isValid: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: true }; // Don't block on invalid date parsing
  }

  if (end < start) {
    return {
      isValid: false,
      error: "End date/time cannot be before start date/time"
    };
  }

  return { isValid: true };
}

/**
 * Auto-corrects end date to be after start date
 * If end date is before start date, returns start + defaultDuration
 */
export function autoCorrectEndDate(
  startDate: Date | string,
  endDate: Date | string | null | undefined,
  defaultDurationMinutes: number = 60
): Date {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // If no end date or end is before start, correct it
  if (!end || isNaN(end.getTime()) || end < start) {
    return new Date(start.getTime() + defaultDurationMinutes * 60000);
  }

  return end;
}

/**
 * Checks if dates need correction and returns corrected end date if needed
 * Returns null if no correction is needed
 */
export function getCorrectedEndDate(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  defaultDurationMinutes: number = 60
): Date | null {
  if (!startDate || !endDate) {
    return null;
  }

  const validation = validateScheduleDates(startDate, endDate);

  if (!validation.isValid) {
    return autoCorrectEndDate(startDate, endDate, defaultDurationMinutes);
  }

  return null;
}
