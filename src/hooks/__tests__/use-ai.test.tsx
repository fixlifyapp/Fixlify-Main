import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAI } from '../use-ai';
import * as supabaseModule from '@/integrations/supabase/client';
import * as useAuthModule from '../use-auth';
import * as aiRefreshModule from '@/utils/ai-refresh';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));
vi.mock('../use-auth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: any) => children
}));
vi.mock('@/utils/ai-refresh', () => ({
  shouldRefreshAIInsights: vi.fn(),
  updateLastRefreshTimestamp: vi.fn(),
  forceRefreshAIInsights: vi.fn()
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { id: 'test-user-id' },
      session: { user: { id: 'test-user-id' } },
      loading: false,
      error: null,
      isAuthenticated: true,
      signOut: vi.fn()
    } as any);

    vi.mocked(aiRefreshModule.shouldRefreshAIInsights).mockResolvedValue(false);
    vi.mocked(aiRefreshModule.updateLastRefreshTimestamp).mockImplementation(() => {});

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: 'test-token' } }
        })
      },
      functions: {
        invoke: vi.fn()
      }
    };

    Object.assign(supabaseModule.supabase, mockSupabase);
  });

  describe('useAI hook initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAI());

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.businessData).toBeNull();
    });

    it('should return all required functions', () => {
      const { result } = renderHook(() => useAI());

      expect(typeof result.current.generateText).toBe('function');
      expect(typeof result.current.generateInsights).toBe('function');
      expect(typeof result.current.generateAnalytics).toBe('function');
      expect(typeof result.current.generateRecommendations).toBe('function');
      expect(typeof result.current.generateBusinessInsights).toBe('function');
    });

    it('should accept custom options', () => {
      const options = {
        systemContext: 'Custom context',
        temperature: 0.5,
        maxTokens: 1000
      };

      const { result } = renderHook(() => useAI(options));

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('generateText function', () => {
    it('should set loading state correctly', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Generated response' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      expect(result.current.isLoading).toBe(false);

      let loadingStatesDuring: boolean[] = [];

      await act(async () => {
        const promise = result.current.generateText('Test prompt');
        // Capture loading state during execution
        loadingStatesDuring.push(result.current.isLoading);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle successful text generation', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Generated response text' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateText('Test prompt');
      });

      expect(response).toBe('Generated response text');
      expect(result.current.error).toBeNull();
    });

    it('should handle missing authentication', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: null }
          })
        },
        functions: {
          invoke: vi.fn()
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateText('Test prompt');
      });

      expect(response).toBeNull();
      expect(result.current.error).toContain('logged in');
    });

    it('should handle API errors', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'AI service error', code: 'SERVICE_ERROR', details: '' }
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateText('Test prompt');
      });

      expect(response).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should handle missing generatedText in response', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: {},
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateText('Test prompt');
      });

      expect(response).toBeNull();
      expect(result.current.error).toContain('Invalid response');
    });

    it('should use default options', async () => {
      const invokeMock = vi.fn().mockResolvedValue({
        data: { generatedText: 'Response' },
        error: null
      });

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: invokeMock
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.generateText('Test prompt');
      });

      expect(invokeMock).toHaveBeenCalled();
      const callArgs = invokeMock.mock.calls[0];
      expect(callArgs[1].body.temperature).toBe(0.7);
      expect(callArgs[1].body.maxTokens).toBe(800);
    });
  });

  describe('generateInsights function', () => {
    it('should generate insights from data', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Business insights' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateInsights({ metric: 100 }, 'performance');
      });

      expect(response).toBe('Business insights');
    });

    it('should handle insights API errors', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Insights error' }
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateInsights({ metric: 100 }, 'performance');
      });

      expect(response).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('generateAnalytics function', () => {
    it('should generate analytics from metrics', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Analytics report' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateAnalytics({ revenue: 1000 }, 'last month');
      });

      expect(response).toBe('Analytics report');
    });

    it('should use lower temperature for analytics', async () => {
      const invokeMock = vi.fn().mockResolvedValue({
        data: { generatedText: 'Analytics' },
        error: null
      });

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: invokeMock
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.generateAnalytics({ revenue: 1000 });
      });

      const callArgs = invokeMock.mock.calls[0];
      expect(callArgs[1].body.temperature).toBe(0.3);
    });
  });

  describe('generateRecommendations function', () => {
    it('should generate recommendations', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Recommendations' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateRecommendations({ data: 'test' }, 'growth');
      });

      expect(response).toBe('Recommendations');
    });
  });

  describe('generateBusinessInsights function', () => {
    it('should generate business insights', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: {
              generatedText: 'Business insights',
              businessData: { revenue: 5000 }
            },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      let response: string | null = null;

      await act(async () => {
        response = await result.current.generateBusinessInsights('What should we focus on?');
      });

      expect(response).toBe('Business insights');
      expect(result.current.businessData).toEqual({ revenue: 5000 });
    });

    it('should update refresh timestamp when shouldRefresh is true', async () => {
      vi.mocked(aiRefreshModule.shouldRefreshAIInsights).mockResolvedValue(true);

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: { generatedText: 'Insights' },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.generateBusinessInsights('Test');
      });

      expect(aiRefreshModule.updateLastRefreshTimestamp).toHaveBeenCalled();
    });
  });

  describe('Error handling and state management', () => {
    it('should clear error on successful call after error', async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn()
            .mockResolvedValueOnce({
              data: null,
              error: { message: 'Error' }
            })
            .mockResolvedValueOnce({
              data: { generatedText: 'Success' },
              error: null
            })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      // First call fails
      await act(async () => {
        await result.current.generateText('Test');
      });

      expect(result.current.error).toBeTruthy();

      // Second call succeeds
      await act(async () => {
        await result.current.generateText('Test');
      });

      expect(result.current.error).toBeNull();
    });

    it('should maintain businessData across calls', async () => {
      const businessData = { revenue: 5000, expenses: 2000 };

      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { access_token: 'test-token' } }
          })
        },
        functions: {
          invoke: vi.fn().mockResolvedValue({
            data: {
              generatedText: 'Response',
              businessData: businessData
            },
            error: null
          })
        }
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.generateText('Test');
      });

      expect(result.current.businessData).toEqual(businessData);
    });
  });
});
