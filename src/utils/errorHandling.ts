interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 10, // Increased from 5 to 10
    private recoveryTimeout = 15000 // Reduced from 30s to 15s
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
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
  
  // Add reset method for debugging
  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// Global circuit breaker for job operations
export const jobsCircuitBreaker = new CircuitBreaker();

// Global function to reset circuit breaker (for debugging)
if (typeof window !== 'undefined') {
  (window as any).resetJobsCircuitBreaker = () => {
    jobsCircuitBreaker.reset();
    console.log('✅ Jobs circuit breaker reset');
  };
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true
  } = options;

  return jobsCircuitBreaker.execute(async () => {
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
        
        console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  });
};

export const handleJobsError = (error: any, context: string) => {
  console.error(`${context} error:`, error);
  
  // Import toast dynamically to avoid circular dependencies
  import('@/components/ui/sonner').then(({ toast }) => {
    const errorMessage = error?.message || 'Unknown error occurred';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      // Network connection error - log only in debug mode
      if (process.env.NODE_ENV === 'development') {
        console.debug('Network connection issue detected');
      }
    } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      toast.error('Access denied. Please check your permissions.', {
        action: {
          label: 'Contact Support',
          onClick: () => console.log('Contact support clicked')
        }
      });
    } else if (errorMessage.includes('not authenticated') || errorMessage.includes('User not authenticated')) {
      toast.error('Please log in to view jobs.', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    } else if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
      toast.error('Session expired. Please refresh the page.', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    } else if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
      toast.error('Access restricted. Please contact your administrator.', {
        action: {
          label: 'Contact Support',
          onClick: () => console.log('RLS error - contact support')
        }
      });
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
      // Timeout error - log only in debug mode
      if (process.env.NODE_ENV === 'development') {
        console.debug('Request timeout detected');
      }
    } else {
      // Only show generic error for non-network issues
      toast.error(`Failed to load jobs. Please try again.`, {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      });
    }
  });
};
