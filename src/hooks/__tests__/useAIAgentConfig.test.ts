import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAIAgentConfig } from '../useAIAgentConfig';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAIAgentConfig', () => {
  const mockAIAgentConfig = {
    id: 'config-1',
    user_id: 'user-1',
    company_name: 'Test Company',
    business_niche: 'HVAC',
    service_types: ['HVAC', 'Plumbing'],
    service_areas: ['New York', 'New Jersey'],
    diagnostic_price: 75,
    emergency_surcharge: 50,
    business_hours: {
      monday: { enabled: true, open: '08:00', close: '17:00' },
      tuesday: { enabled: true, open: '08:00', close: '17:00' },
      wednesday: { enabled: true, open: '08:00', close: '17:00' },
      thursday: { enabled: true, open: '08:00', close: '17:00' },
      friday: { enabled: true, open: '08:00', close: '17:00' },
      saturday: { enabled: false, open: '09:00', close: '15:00' },
      sunday: { enabled: false, open: '10:00', close: '14:00' }
    },
    is_active: true,
    agent_name: 'Test Agent',
    voice_id: 'alloy',
    greeting_template: 'Hello from {company_name}',
    aws_region: 'us-east-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockCompanySettings = {
    company_name: 'Test Company',
    business_type: 'HVAC'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAIAgentConfig hook initialization', () => {
    it('should initialize with default state', () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn()
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      expect(result.current.config).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.saving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return all required functions', () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn()
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      expect(typeof result.current.saveConfig).toBe('function');
      expect(typeof result.current.toggleActive).toBe('function');
      expect(typeof result.current.createDefaultConfig).toBe('function');
      expect(typeof result.current.refreshConfig).toBe('function');
      expect(typeof result.current.saveAWSCredentials).toBe('function');
    });
  });

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          })
        };
        return chainable;
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => createQueryBuilderMock())
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.config).toEqual(expect.objectContaining({
        id: 'config-1',
        company_name: 'Test Company'
      }));
      expect(result.current.error).toBeNull();
    });

    it('should handle no config found', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        };
        return chainable;
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => createQueryBuilderMock())
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.config).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle load error', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Load failed' }
          })
        };
        return chainable;
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => createQueryBuilderMock())
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.config).toBeNull();
    });

    it('should handle missing authentication', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null }
          })
        },
        from: vi.fn()
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('No authenticated user');
    });

    it('should transform service_types array', async () => {
      const configWithArray = {
        ...mockAIAgentConfig,
        service_types: ['HVAC', 'Plumbing', 'Electrical']
      };

      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: configWithArray,
            error: null
          })
        };
        return chainable;
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => createQueryBuilderMock())
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.config?.service_types)).toBe(true);
      expect(result.current.config?.service_types).toEqual(['HVAC', 'Plumbing', 'Electrical']);
    });
  });

  describe('saveConfig', () => {
    it('should save config successfully', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        };
        return chainable;
      };

      const upsertChain = {
        select: vi.fn(function() { return this; }),
        single: vi.fn().mockResolvedValue({
          data: mockAIAgentConfig,
          error: null
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn((table) => {
          if (table === 'ai_agent_configs') {
            return {
              select: vi.fn(function() { return this; }),
              eq: vi.fn(function() { return this; }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              upsert: vi.fn(() => upsertChain)
            };
          }
          return createQueryBuilderMock();
        })
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let savedConfig;
      await act(async () => {
        savedConfig = await result.current.saveConfig({
          company_name: 'Updated Company',
          business_niche: 'Electrical'
        });
      });

      expect(result.current.saving).toBe(false);
      expect(savedConfig).toEqual(expect.objectContaining({
        company_name: 'Test Company'
      }));
    });

    it('should handle save error', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        };
        return chainable;
      };

      const upsertChain = {
        select: vi.fn(function() { return this; }),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Save failed' }
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          upsert: vi.fn(() => upsertChain)
        }))
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let thrownError: any = null;
      await act(async () => {
        try {
          await result.current.saveConfig({ company_name: 'Test' });
        } catch (err) {
          thrownError = err;
        }
      });

      expect(thrownError).toBeTruthy();
      expect(thrownError).toHaveProperty('message', 'Save failed');
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          })
        };
        return chainable;
      };

      const updateChain = {
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          }),
          update: vi.fn(() => updateChain)
        }))
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.config).toBeTruthy();
      });

      const initialState = result.current.config?.is_active;

      let newActiveState;
      await act(async () => {
        newActiveState = await result.current.toggleActive();
      });

      expect(newActiveState).not.toBe(initialState);
    });

    it('should handle toggle error', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          })
        };
        return chainable;
      };

      const updateChain = {
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Toggle failed' }
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          }),
          update: vi.fn(() => updateChain)
        }))
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.config).toBeTruthy();
      });

      let caughtError = false;
      try {
        await act(async () => {
          await result.current.toggleActive();
        });
      } catch (err) {
        caughtError = true;
      }

      expect(caughtError).toBe(true);
    });
  });

  describe('createDefaultConfig', () => {
    it('should create default config', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null
          }),
          single: vi.fn().mockResolvedValue({
            data: mockCompanySettings,
            error: null
          })
        };
        return chainable;
      };

      const upsertChain = {
        select: vi.fn(function() { return this; }),
        single: vi.fn().mockResolvedValue({
          data: { ...mockAIAgentConfig, company_name: mockCompanySettings.company_name },
          error: null
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn((table) => {
          if (table === 'company_settings') {
            return {
              select: vi.fn(function() { return this; }),
              eq: vi.fn(function() { return this; }),
              single: vi.fn().mockResolvedValue({
                data: mockCompanySettings,
                error: null
              })
            };
          }
          return {
            select: vi.fn(function() { return this; }),
            eq: vi.fn(function() { return this; }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            upsert: vi.fn(() => upsertChain)
          };
        })
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdConfig;
      await act(async () => {
        createdConfig = await result.current.createDefaultConfig();
      });

      expect(createdConfig).toBeDefined();
      expect(result.current.saving).toBe(false);
    });
  });

  describe('saveAWSCredentials', () => {
    it('should save AWS credentials', async () => {
      const createQueryBuilderMock = () => {
        const chainable = {
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          })
        };
        return chainable;
      };

      const upsertChain = {
        select: vi.fn(function() { return this; }),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockAIAgentConfig,
            aws_region: 'us-west-2',
            connect_instance_arn: 'arn:aws:connect:us-west-2:123456789:instance/test'
          },
          error: null
        })
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } }
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(function() { return this; }),
          eq: vi.fn(function() { return this; }),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockAIAgentConfig,
            error: null
          }),
          upsert: vi.fn(() => upsertChain)
        }))
      };

      Object.assign(supabaseModule.supabase, mockSupabase);

      const { result } = renderHook(() => useAIAgentConfig());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let savedCredentials;
      await act(async () => {
        savedCredentials = await result.current.saveAWSCredentials({
          aws_region: 'us-west-2',
          connect_instance_arn: 'arn:aws:connect:us-west-2:123456789:instance/test'
        });
      });

      expect(savedCredentials).toBeDefined();
    });
  });
});
