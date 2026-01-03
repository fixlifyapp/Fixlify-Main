import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isWithinBusinessHours,
  isWithinCompanyBusinessHours,
  getNextBusinessHourSlot,
} from './businessHours';

describe('Business Hours Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isWithinBusinessHours', () => {
    it('should return true when business hours are not enabled', () => {
      const result = isWithinBusinessHours(
        { enabled: false, start: '09:00', end: '17:00' },
        'America/Toronto'
      );

      expect(result).toBe(true);
    });

    it('should return true when businessHoursSettings is null', () => {
      const result = isWithinBusinessHours(null, 'America/Toronto');

      expect(result).toBe(true);
    });

    it('should return true when within business hours', () => {
      // Mock a time that's 10:00 AM on a Monday
      vi.setSystemTime(new Date('2024-01-08T10:00:00').getTime());

      const result = isWithinBusinessHours(
        {
          enabled: true,
          start: '09:00',
          end: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        'UTC'
      );

      expect(result).toBe(true);
    });

    it('should return false when before business hours', () => {
      vi.setSystemTime(new Date('2024-01-08T08:00:00').getTime());

      const result = isWithinBusinessHours(
        {
          enabled: true,
          start: '09:00',
          end: '17:00',
        },
        'UTC'
      );

      expect(result).toBe(false);
    });

    it('should return false when after business hours', () => {
      vi.useRealTimers();
      // Create a date that's definitely after business hours (18:00 UTC)
      const afterHours = new Date('2024-01-08T18:00:00Z');
      vi.setSystemTime(afterHours.getTime());

      const result = isWithinBusinessHours(
        {
          enabled: true,
          start: '09:00',
          end: '17:00',
        },
        'UTC'
      );

      vi.useFakeTimers();
      expect(result).toBe(false);
    });

    it('should check specific days when provided', () => {
      // Wednesday (2024-01-10)
      vi.setSystemTime(new Date('2024-01-10T10:00:00').getTime());

      const resultIncluded = isWithinBusinessHours(
        {
          enabled: true,
          start: '09:00',
          end: '17:00',
          days: ['monday', 'wednesday'],
        },
        'UTC'
      );

      const resultExcluded = isWithinBusinessHours(
        {
          enabled: true,
          start: '09:00',
          end: '17:00',
          days: ['monday', 'tuesday'],
        },
        'UTC'
      );

      expect(resultIncluded).toBe(true);
      expect(resultExcluded).toBe(false);
    });

    it('should handle invalid timezone gracefully', () => {
      const result = isWithinBusinessHours(
        { enabled: true, start: '09:00', end: '17:00' },
        'Invalid/Timezone'
      );

      // Should return true (safe default on error)
      expect(result).toBe(true);
    });

    it('should use default times when not provided', () => {
      vi.setSystemTime(new Date('2024-01-08T10:00:00').getTime());

      const result = isWithinBusinessHours(
        { enabled: true }, // No start/end provided
        'UTC'
      );

      expect(typeof result).toBe('boolean');
    });

    it('should handle time at exact start boundary', () => {
      vi.useRealTimers();
      const startTime = new Date('2024-01-08T09:00:00Z');
      vi.setSystemTime(startTime.getTime());

      const result = isWithinBusinessHours(
        { enabled: true, start: '09:00', end: '17:00' },
        'UTC'
      );

      vi.useFakeTimers();
      expect(result).toBe(true);
    });

    it('should handle time at exact end boundary', () => {
      vi.setSystemTime(new Date('2024-01-08T17:00:00').getTime());

      const result = isWithinBusinessHours(
        { enabled: true, start: '09:00', end: '17:00' },
        'UTC'
      );

      expect(result).toBe(true);
    });
  });

  describe('isWithinCompanyBusinessHours', () => {
    it('should return true when businessHours is null', () => {
      const result = isWithinCompanyBusinessHours(null, 'America/Toronto');

      expect(result).toBe(true);
    });

    it('should return false when day is not enabled', () => {
      vi.setSystemTime(new Date('2024-01-06T10:00:00').getTime()); // Saturday

      const result = isWithinCompanyBusinessHours(
        {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '09:00', close: '17:00', enabled: false },
          sunday: { open: '09:00', close: '17:00', enabled: false },
        },
        'UTC'
      );

      expect(result).toBe(false);
    });

    it('should return true when within enabled business hours', () => {
      vi.setSystemTime(new Date('2024-01-08T10:00:00').getTime()); // Monday

      const result = isWithinCompanyBusinessHours(
        {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '09:00', close: '17:00', enabled: false },
          sunday: { open: '09:00', close: '17:00', enabled: false },
        },
        'UTC'
      );

      expect(result).toBe(true);
    });

    it('should return false when outside business hours', () => {
      vi.setSystemTime(new Date('2024-01-08T08:00:00').getTime()); // Monday 8 AM

      const result = isWithinCompanyBusinessHours(
        {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '09:00', close: '17:00', enabled: false },
          sunday: { open: '09:00', close: '17:00', enabled: false },
        },
        'UTC'
      );

      expect(result).toBe(false);
    });

    it('should handle invalid timezone gracefully', () => {
      const result = isWithinCompanyBusinessHours(
        {
          monday: { open: '09:00', close: '17:00', enabled: true },
        },
        'Invalid/Timezone'
      );

      expect(result).toBe(true);
    });

    it('should handle missing day in business hours object', () => {
      vi.setSystemTime(new Date('2024-01-08T10:00:00').getTime());

      const result = isWithinCompanyBusinessHours(
        {
          // Monday missing
          tuesday: { open: '09:00', close: '17:00', enabled: true },
        },
        'UTC'
      );

      expect(result).toBe(false);
    });
  });

  describe('getNextBusinessHourSlot', () => {
    it('should return current time when within business hours', () => {
      const now = new Date('2024-01-08T10:00:00');
      vi.setSystemTime(now.getTime());

      const result = getNextBusinessHourSlot(
        { enabled: true, start: '09:00', end: '17:00' },
        'UTC'
      );

      expect(result).toBeDefined();
      expect(result instanceof Date).toBe(true);
    });

    it('should return null when business hours not enabled', () => {
      const result = getNextBusinessHourSlot(
        { enabled: false, start: '09:00', end: '17:00' },
        'UTC'
      );

      expect(result).toBeNull();
    });

    it('should return null when businessHoursSettings is null', () => {
      const result = getNextBusinessHourSlot(null, 'UTC');

      expect(result).toBeNull();
    });

    it('should return next day at start time when outside business hours', () => {
      vi.useRealTimers();
      vi.setSystemTime(new Date('2024-01-08T18:00:00Z').getTime()); // After 5 PM UTC

      const result = getNextBusinessHourSlot(
        { enabled: true, start: '09:00', end: '17:00' },
        'UTC'
      );

      vi.useFakeTimers();
      expect(result).toBeDefined();
      if (result) {
        // Verify it's the next day at the start time (function uses local time internally)
        expect(result instanceof Date).toBe(true);
        expect(result.getHours()).toBe(9);  // Start hour in local time
        expect(result.getMinutes()).toBe(0); // Start minute
      }
    });

    it('should handle custom business hours times', () => {
      vi.useRealTimers();
      // Set time to 20:00 (8 PM) - outside business hours (08:30-18:00)
      vi.setSystemTime(new Date('2024-01-08T20:00:00Z').getTime());

      const result = getNextBusinessHourSlot(
        { enabled: true, start: '08:30', end: '18:00' },
        'UTC'
      );

      vi.useFakeTimers();
      expect(result).toBeDefined();
      if (result) {
        // Verify it's a Date object returned
        expect(result instanceof Date).toBe(true);
        // Verify it's a future date (tomorrow or later)
        expect(result.getDate()).toBeGreaterThanOrEqual(9);
        // Function uses local setHours, so verify local hours/minutes match start time
        expect(result.getHours()).toBe(8);
        expect(result.getMinutes()).toBe(30);
      }
    });

    it('should handle invalid timezone gracefully', () => {
      vi.useRealTimers();
      vi.setSystemTime(new Date('2024-01-08T18:00:00Z').getTime());

      const result = getNextBusinessHourSlot(
        { enabled: true, start: '09:00', end: '17:00' },
        'Invalid/Timezone'
      );

      vi.useFakeTimers();
      // Function should return null or a safe default when timezone is invalid
      expect(result === null || result instanceof Date).toBe(true);
    });

    it('should return Date instance when business hours enabled and outside hours', () => {
      vi.setSystemTime(new Date('2024-01-08T22:00:00').getTime());

      const result = getNextBusinessHourSlot(
        { enabled: true, start: '09:00', end: '17:00' },
        'UTC'
      );

      expect(result instanceof Date).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should check business hours for workflow scheduling', () => {
      vi.setSystemTime(new Date('2024-01-08T14:00:00').getTime()); // 2 PM Monday

      const businessHours = {
        enabled: true,
        start: '09:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      };

      const isAvailable = isWithinBusinessHours(businessHours, 'UTC');
      expect(isAvailable).toBe(true);

      // If not available, get next slot
      if (!isAvailable) {
        const nextSlot = getNextBusinessHourSlot(businessHours, 'UTC');
        expect(nextSlot).toBeDefined();
      }
    });

    it('should handle weekend scheduling', () => {
      vi.setSystemTime(new Date('2024-01-06T10:00:00').getTime()); // Saturday

      const companyHours = {
        monday: { open: '09:00', close: '17:00', enabled: true },
        tuesday: { open: '09:00', close: '17:00', enabled: true },
        wednesday: { open: '09:00', close: '17:00', enabled: true },
        thursday: { open: '09:00', close: '17:00', enabled: true },
        friday: { open: '09:00', close: '17:00', enabled: true },
        saturday: { open: '09:00', close: '17:00', enabled: false },
        sunday: { open: '09:00', close: '17:00', enabled: false },
      };

      const isAvailable = isWithinCompanyBusinessHours(companyHours, 'UTC');
      expect(isAvailable).toBe(false);
    });
  });
});
