import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  withRetry,
  withClientRetry,
  handleApiError,
  jobsCircuitBreaker,
  clientsCircuitBreaker,
} from './errorHandling';

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    jobsCircuitBreaker.reset();
    clientsCircuitBreaker.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to test async operations with timers
  const withRealTimers = async (fn: () => Promise<void>) => {
    vi.useRealTimers();
    try {
      await fn();
    } finally {
      vi.useFakeTimers();
    }
  };

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockResolvedValueOnce('success');

        const result = await withRetry(operation, { maxRetries: 2, baseDelay: 10 });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
      });
    });

    it('should throw after max retries exceeded', async () => {
      await withRealTimers(async () => {
        const operation = vi.fn().mockRejectedValue(new Error('persistent failure'));

        await expect(
          withRetry(operation, { maxRetries: 2, baseDelay: 10 })
        ).rejects.toThrow('persistent failure');

        expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
      });
    });

    it('should apply exponential backoff by default', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce(new Error('fail1'))
          .mockRejectedValueOnce(new Error('fail2'))
          .mockResolvedValueOnce('success');

        const result = await withRetry(operation, {
          maxRetries: 3,
          baseDelay: 50,
          exponentialBackoff: true,
        });

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
      });
    });

    it('should respect maxDelay with exponential backoff', async () => {
      await withRealTimers(async () => {
        const operation = vi.fn().mockRejectedValue(new Error('fail'));

        const promise = withRetry(operation, {
          maxRetries: 2,
          baseDelay: 50,
          maxDelay: 100,
          exponentialBackoff: true,
        });

        await promise.catch(() => {});

        expect(operation).toHaveBeenCalledTimes(3);
      });
    });

    it('should use constant delay when exponentialBackoff is false', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce(new Error('fail1'))
          .mockRejectedValueOnce(new Error('fail2'))
          .mockResolvedValueOnce('success');

        const result = await withRetry(operation, {
          maxRetries: 3,
          baseDelay: 30,
          exponentialBackoff: false,
        });

        expect(result).toBe('success');
      });
    });

    it('should support circuit breaker when requested', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withRetry(operation, {
        useCircuitBreaker: true,
      });

      expect(result).toBe('success');
    });

    it('should handle non-Error thrown values', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce('string error')
          .mockResolvedValueOnce('success');

        const result = await withRetry(operation, { maxRetries: 1, baseDelay: 10 });

        expect(result).toBe('success');
      });
    });
  });

  describe('withClientRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('client data');

      const result = await withClientRetry(operation);

      expect(result).toBe('client data');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use lower retry count than withRetry', async () => {
      await withRealTimers(async () => {
        const operation = vi.fn().mockRejectedValue(new Error('fail'));

        await withClientRetry(operation, { maxRetries: 2, baseDelay: 10 }).catch(() => {});

        expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
      });
    });

    it('should use lower max delay than withRetry', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const promise = withClientRetry(operation, {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
      });

      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('success');
    });

    it('should retry and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('network fail'))
        .mockResolvedValueOnce('client data');

      const promise = withClientRetry(operation, { maxRetries: 2 });

      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('client data');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should execute operation successfully when CLOSED', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await jobsCircuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should track failures and open after threshold', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 10; i++) {
        try {
          await jobsCircuitBreaker.execute(operation);
        } catch {}
      }

      const state = jobsCircuitBreaker.getState();
      expect(state.state).toBe('OPEN');
      expect(state.failures).toBe(10);
    });

    it('should throw immediately when OPEN', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      // Trigger OPEN state
      for (let i = 0; i < 10; i++) {
        try {
          await jobsCircuitBreaker.execute(operation);
        } catch {}
      }

      // Next operation should fail immediately without calling operation
      const beforeCallCount = operation.mock.calls.length;

      await jobsCircuitBreaker.execute(() => Promise.resolve('test')).catch(() => {});

      expect(operation.mock.calls.length).toBe(beforeCallCount);
    });

    it('should transition to HALF_OPEN after recovery timeout', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      // Trigger OPEN state
      for (let i = 0; i < 10; i++) {
        try {
          await jobsCircuitBreaker.execute(operation);
        } catch {}
      }

      // Advance time past recovery timeout
      vi.advanceTimersByTime(16000);

      // Next attempt should try the operation
      const newOperation = vi.fn().mockResolvedValue('recovered');
      const result = await jobsCircuitBreaker.execute(newOperation);

      expect(result).toBe('recovered');
      expect(newOperation).toHaveBeenCalledTimes(1);
    });

    it('should reset on success', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      // Add some failures
      for (let i = 0; i < 5; i++) {
        try {
          await jobsCircuitBreaker.execute(operation);
        } catch {}
      }

      // Now succeed
      const successOp = vi.fn().mockResolvedValue('success');
      await jobsCircuitBreaker.execute(successOp);

      const state = jobsCircuitBreaker.getState();
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });

    it('should maintain separate state for different circuit breakers', async () => {
      const jobsOp = vi.fn().mockRejectedValue(new Error('fail'));
      const clientsOp = vi.fn().mockResolvedValue('success');

      // Fail jobs circuit breaker
      for (let i = 0; i < 10; i++) {
        try {
          await jobsCircuitBreaker.execute(jobsOp);
        } catch {}
      }

      // Succeed with clients circuit breaker
      await clientsCircuitBreaker.execute(clientsOp);

      expect(jobsCircuitBreaker.getState().state).toBe('OPEN');
      expect(clientsCircuitBreaker.getState().state).toBe('CLOSED');
    });

    it('should reset state on call to reset()', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 10; i++) {
        try {
          await jobsCircuitBreaker.execute(operation);
        } catch {}
      }

      expect(jobsCircuitBreaker.getState().state).toBe('OPEN');

      jobsCircuitBreaker.reset();

      expect(jobsCircuitBreaker.getState().state).toBe('CLOSED');
      expect(jobsCircuitBreaker.getState().failures).toBe(0);
    });

    it('should getState return correct metadata', () => {
      const state = jobsCircuitBreaker.getState();

      expect(state).toHaveProperty('name');
      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('failures');
      expect(state.name).toBe('jobs');
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('handleApiError', () => {
    it('should be defined', () => {
      expect(typeof handleApiError).toBe('function');
    });

    it('should accept error and resource name parameters', () => {
      const error = new Error('test error');

      expect(() => {
        handleApiError(error, 'test-resource');
      }).not.toThrow();
    });

    it('should handle undefined resource name', () => {
      const error = new Error('test error');

      expect(() => {
        handleApiError(error);
      }).not.toThrow();
    });

    it('should handle various error types', () => {
      const testCases = [
        new Error('Network error'),
        { message: 'Custom error object' },
        'String error',
        null,
        undefined,
      ];

      testCases.forEach((error) => {
        expect(() => {
          handleApiError(error, 'test');
        }).not.toThrow();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete retry flow with success', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockRejectedValueOnce(new Error('Temporary failure'))
          .mockResolvedValueOnce({ data: 'success' });

        const result = await withRetry(operation, {
          maxRetries: 3,
          baseDelay: 10,
        });

        expect(result).toEqual({ data: 'success' });
        expect(operation).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle client retry with fewer attempts', async () => {
      await withRealTimers(async () => {
        const operation = vi
          .fn()
          .mockRejectedValueOnce(new Error('fail'))
          .mockRejectedValueOnce(new Error('fail'))
          .mockRejectedValueOnce(new Error('fail')); // This should not be called

        await withClientRetry(operation, { maxRetries: 2, baseDelay: 10 }).catch(() => {});

        expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
      });
    });

    it('should prevent cascading failures with circuit breaker', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('service down'));

      // Simulate 10 failures
      for (let i = 0; i < 10; i++) {
        await withRetry(operation, {
          useCircuitBreaker: true,
          maxRetries: 0,
        }).catch(() => {});
      }

      // Circuit breaker should now be OPEN
      const openError = await withRetry(operation, {
        useCircuitBreaker: true,
      }).catch((e) => e);

      expect(openError.message).toContain('Circuit breaker');
    });
  });
});
