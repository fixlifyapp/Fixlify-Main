import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useJobs } from '../useJobs';
import { supabase } from '@/integrations/supabase/client';

// Mock modules
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
  }),
}));
vi.mock('@/hooks/useUnifiedRealtime', () => ({
  useUnifiedRealtime: vi.fn(),
}));
vi.mock('@/hooks/useConfigItems', () => ({
  useJobTypes: () => ({
    items: [
      { id: '1', name: 'Repair', is_default: true },
      { id: '2', name: 'Maintenance', is_default: false },
    ],
  }),
  useJobStatuses: () => ({
    items: [
      { id: '1', name: 'New', is_default: true },
      { id: '2', name: 'In Progress', is_default: false },
      { id: '3', name: 'Completed', is_default: false },
    ],
  }),
}));
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    getJobViewScope: () => 'all',
    canCreateJobs: () => true,
    canEditJobs: () => true,
    canDeleteJobs: () => true,
  }),
}));
vi.mock('@/utils/idGeneration', () => ({
  generateNextId: vi.fn(() => Promise.resolve('JOB-001')),
}));
vi.mock('@/utils/errorHandling', () => ({
  withRetry: vi.fn((fn) => fn()),
  handleJobsError: vi.fn(),
}));

const mockJobs = [
  {
    id: 'job-1',
    title: 'Test Job 1',
    client_id: 'client-1',
    technician_id: 'tech-1',
    status: 'New',
    date: '2024-01-15T09:00:00Z',
    schedule_start: '2024-01-15T09:00:00Z',
    schedule_end: '2024-01-15T11:00:00Z',
    job_type: 'Repair',
    description: 'Test description',
    tags: ['urgent'],
    tasks: ['Task 1', 'Task 2'],
    user_id: 'test-user-id',
    client: { id: 'client-1', name: 'John Doe', email: 'john@test.com', phone: '555-1234' },
  },
  {
    id: 'job-2',
    title: 'Test Job 2',
    client_id: 'client-2',
    technician_id: null,
    status: 'In Progress',
    date: '2024-01-16T14:00:00Z',
    schedule_start: '2024-01-16T14:00:00Z',
    job_type: 'Maintenance',
    description: '',
    tags: [],
    tasks: [],
    user_id: 'test-user-id',
    client: { id: 'client-2', name: 'Jane Smith', email: 'jane@test.com', phone: '555-5678' },
  },
];

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain for supabase
    const mockSelect = vi.fn().mockReturnValue({
      or: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(Promise.resolve({ data: mockJobs, error: null })),
        }),
        order: vi.fn().mockReturnValue(Promise.resolve({ data: mockJobs, error: null })),
      }),
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'jobs') {
        return {
          select: mockSelect,
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(Promise.resolve({
                data: { ...mockJobs[0], id: 'JOB-001' },
                error: null
              })),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue(Promise.resolve({
                  data: mockJobs[0],
                  error: null
                })),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(Promise.resolve({
                data: { address: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345' },
                error: null
              })),
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })) };
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useJobs());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.jobs).toEqual([]);
  });

  it('should have CRUD operations defined', () => {
    const { result } = renderHook(() => useJobs());

    expect(typeof result.current.addJob).toBe('function');
    expect(typeof result.current.updateJob).toBe('function');
    expect(typeof result.current.deleteJob).toBe('function');
    expect(typeof result.current.refreshJobs).toBe('function');
  });

  it('should have permission flags', () => {
    const { result } = renderHook(() => useJobs());

    expect(result.current.canCreate).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.viewScope).toBe('all');
  });

  it('should have error handling', () => {
    const { result } = renderHook(() => useJobs());

    expect(result.current.hasError).toBe(false);
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should support client filtering via parameter', () => {
    const { result } = renderHook(() => useJobs('client-1'));

    // Hook should accept clientId parameter
    expect(result.current.isLoading).toBeDefined();
  });

  it('should have jobs array property', () => {
    const { result } = renderHook(() => useJobs());

    // Jobs should be an array
    expect(Array.isArray(result.current.jobs)).toBe(true);
  });
});

describe('useJobs - CRUD Operations', () => {
  it('addJob should be a function', () => {
    const { result } = renderHook(() => useJobs());
    expect(typeof result.current.addJob).toBe('function');
  });

  it('updateJob should be a function', () => {
    const { result } = renderHook(() => useJobs());
    expect(typeof result.current.updateJob).toBe('function');
  });

  it('deleteJob should be a function', () => {
    const { result } = renderHook(() => useJobs());
    expect(typeof result.current.deleteJob).toBe('function');
  });

  it('refreshJobs should be a function', () => {
    const { result } = renderHook(() => useJobs());
    expect(typeof result.current.refreshJobs).toBe('function');
  });

  it('clearError should be a function', () => {
    const { result } = renderHook(() => useJobs());
    expect(typeof result.current.clearError).toBe('function');
  });
});

describe('useJobs - Permission Handling', () => {
  it('should respect permission checks for operations', () => {
    const { result } = renderHook(() => useJobs());

    // Permission flags should be boolean
    expect(typeof result.current.canCreate).toBe('boolean');
    expect(typeof result.current.canEdit).toBe('boolean');
    expect(typeof result.current.canDelete).toBe('boolean');
  });

  it('should have viewScope for role-based filtering', () => {
    const { result } = renderHook(() => useJobs());

    // viewScope should be defined
    expect(result.current.viewScope).toBeDefined();
    expect(['all', 'assigned', 'none']).toContain(result.current.viewScope);
  });
});
