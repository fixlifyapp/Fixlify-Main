interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  useCircuitBreaker?: boolean;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private name: string,
    private failureThreshold = 10,
    private recoveryTimeout = 15000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit breaker [${this.name}] is OPEN - too many failures, waiting to recover`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failures };
  }
}

// Separate circuit breakers for different resources
export const jobsCircuitBreaker = new CircuitBreaker('jobs', 10, 15000);
export const clientsCircuitBreaker = new CircuitBreaker('clients', 10, 15000);

// Global function to reset circuit breakers (for debugging)
if (typeof window !== 'undefined') {
  (window as any).resetCircuitBreakers = () => {
    jobsCircuitBreaker.reset();
    clientsCircuitBreaker.reset();
    console.log('All circuit breakers reset');
  };
  (window as any).getCircuitBreakerStatus = () => {
    console.log('Jobs:', jobsCircuitBreaker.getState());
    console.log('Clients:', clientsCircuitBreaker.getState());
  };
}

// Generic retry function - no circuit breaker by default
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true,
    useCircuitBreaker = false
  } = options;

  const executeWithRetry = async () => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        let delay = exponentialBackoff ? baseDelay * Math.pow(2, attempt) : baseDelay;
        delay = Math.min(delay, maxDelay);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  };

  // Only use circuit breaker if explicitly requested
  if (useCircuitBreaker) {
    return jobsCircuitBreaker.execute(executeWithRetry);
  }

  return executeWithRetry();
};

// Specialized retry for clients
export const withClientRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<Omit<RetryOptions, 'useCircuitBreaker'>> = {}
): Promise<T> => {
  const {
    maxRetries = 2,
    baseDelay = 1000,
    maxDelay = 5000,
    exponentialBackoff = true
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      let delay = exponentialBackoff ? baseDelay * Math.pow(2, attempt) : baseDelay;
      delay = Math.min(delay, maxDelay);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Generic error handler that works for any resource type
export const handleApiError = (error: any, resourceName: string = 'data') => {
  import('@/components/ui/sonner').then(({ toast }) => {
    const errorMessage = error?.message || 'Unknown error occurred';

    // Network errors - silent in production
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Network connection issue for ${resourceName}`);
      }
      return;
    }

    // Circuit breaker errors - silent, let UI show retry button
    if (errorMessage.includes('Circuit breaker')) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Circuit breaker open for ${resourceName}`);
      }
      return;
    }

    // Timeout errors - silent in production
    if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Request timeout for ${resourceName}`);
      }
      return;
    }

    // Auth errors
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      toast.error('Access denied. Please check your permissions.');
      return;
    }

    if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
      toast.error(`Please log in to view ${resourceName}.`, {
        action: { label: 'Refresh', onClick: () => window.location.reload() }
      });
      return;
    }

    if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
      toast.error('Session expired. Please refresh the page.', {
        action: { label: 'Refresh', onClick: () => window.location.reload() }
      });
      return;
    }

    if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
      toast.error('Access restricted. Please contact your administrator.');
      return;
    }

    // Generic error - only show if not a common transient error
    toast.error(`Failed to load ${resourceName}. Please try again.`, {
      action: { label: 'Retry', onClick: () => window.location.reload() }
    });
  });
};

// Backwards compatible - uses generic handler with 'jobs' as resource
export const handleJobsError = (error: any, context: string) => {
  handleApiError(error, 'jobs');
};

// Client-specific error handler
export const handleClientsError = (error: any, context: string) => {
  handleApiError(error, 'clients');
};
