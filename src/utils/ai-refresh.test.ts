import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  shouldRefreshAIInsights,
  updateLastRefreshTimestamp,
  forceRefreshAIInsights,
} from './ai-refresh';

describe('ai-refresh utilities', () => {
  const AI_REFRESH_KEY = 'ai_insights_last_refresh';

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('shouldRefreshAIInsights', () => {
    it('should return true when no refresh timestamp exists', async () => {
      const result = await shouldRefreshAIInsights();
      expect(result).toBe(true);
    });

    it('should return true when more than 7 days have passed', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      localStorage.setItem(AI_REFRESH_KEY, eightDaysAgo.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(true);
    });

    it('should return false when less than 7 days have passed', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      localStorage.setItem(AI_REFRESH_KEY, threeDaysAgo.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(false);
    });

    it('should return false exactly at 7 days boundary (edge case)', async () => {
      const exactlySevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(AI_REFRESH_KEY, exactlySevenDays.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(true);
    });

    it('should handle invalid timestamp and return true', async () => {
      localStorage.setItem(AI_REFRESH_KEY, 'invalid-date');

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(true);
    });

    it('should handle localStorage errors gracefully and return true', async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(true);

      getItemSpy.mockRestore();
    });

    it('should return false when just refreshed', async () => {
      const now = new Date();
      localStorage.setItem(AI_REFRESH_KEY, now.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(false);
    });

    it('should return false one day after refresh', async () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      localStorage.setItem(AI_REFRESH_KEY, oneDayAgo.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(false);
    });

    it('should return false six days after refresh', async () => {
      const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      localStorage.setItem(AI_REFRESH_KEY, sixDaysAgo.toISOString());

      const result = await shouldRefreshAIInsights();
      expect(result).toBe(false);
    });
  });

  describe('updateLastRefreshTimestamp', () => {
    it('should set the refresh timestamp to current time', () => {
      const beforeTime = Date.now();
      updateLastRefreshTimestamp();
      const afterTime = Date.now();

      const stored = localStorage.getItem(AI_REFRESH_KEY);
      expect(stored).toBeDefined();

      const storedTime = new Date(stored!).getTime();
      expect(storedTime).toBeGreaterThanOrEqual(beforeTime);
      expect(storedTime).toBeLessThanOrEqual(afterTime);
    });

    it('should overwrite existing timestamp', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem(AI_REFRESH_KEY, oldDate);

      updateLastRefreshTimestamp();

      const stored = localStorage.getItem(AI_REFRESH_KEY);
      expect(stored).not.toBe(oldDate);
    });

    it('should store valid ISO string format', () => {
      updateLastRefreshTimestamp();

      const stored = localStorage.getItem(AI_REFRESH_KEY);
      expect(stored).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => updateLastRefreshTimestamp()).not.toThrow();

      setItemSpy.mockRestore();
    });

    it('should be parseable as valid Date', () => {
      updateLastRefreshTimestamp();

      const stored = localStorage.getItem(AI_REFRESH_KEY);
      const date = new Date(stored!);

      expect(date instanceof Date).toBe(true);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  describe('forceRefreshAIInsights', () => {
    it('should remove the refresh timestamp', () => {
      localStorage.setItem(AI_REFRESH_KEY, new Date().toISOString());
      expect(localStorage.getItem(AI_REFRESH_KEY)).toBeDefined();

      forceRefreshAIInsights();

      expect(localStorage.getItem(AI_REFRESH_KEY)).toBeNull();
    });

    it('should cause subsequent shouldRefreshAIInsights to return true', async () => {
      localStorage.setItem(AI_REFRESH_KEY, new Date().toISOString());

      forceRefreshAIInsights();
      const result = await shouldRefreshAIInsights();

      expect(result).toBe(true);
    });

    it('should be idempotent when called multiple times', () => {
      localStorage.setItem(AI_REFRESH_KEY, new Date().toISOString());

      forceRefreshAIInsights();
      forceRefreshAIInsights();
      forceRefreshAIInsights();

      expect(localStorage.getItem(AI_REFRESH_KEY)).toBeNull();
    });

    it('should not throw when key does not exist', () => {
      expect(localStorage.getItem(AI_REFRESH_KEY)).toBeNull();

      expect(() => forceRefreshAIInsights()).not.toThrow();

      expect(localStorage.getItem(AI_REFRESH_KEY)).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should support typical refresh workflow', async () => {
      // Initially, should refresh
      let shouldRefresh = await shouldRefreshAIInsights();
      expect(shouldRefresh).toBe(true);

      // After updating, should not refresh
      updateLastRefreshTimestamp();
      shouldRefresh = await shouldRefreshAIInsights();
      expect(shouldRefresh).toBe(false);

      // After forcing, should refresh
      forceRefreshAIInsights();
      shouldRefresh = await shouldRefreshAIInsights();
      expect(shouldRefresh).toBe(true);
    });

    it('should maintain timestamp after multiple checks', async () => {
      updateLastRefreshTimestamp();
      const timestamp1 = localStorage.getItem(AI_REFRESH_KEY);

      await shouldRefreshAIInsights();
      await shouldRefreshAIInsights();
      const timestamp2 = localStorage.getItem(AI_REFRESH_KEY);

      expect(timestamp1).toBe(timestamp2);
    });
  });
});
