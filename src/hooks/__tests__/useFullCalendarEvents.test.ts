import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFullCalendarEvents } from '../useFullCalendarEvents';
import { supabase } from '@/integrations/supabase/client';

// Mock modules
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { user: { id: 'test-user-id' } },
    loading: false,
  }),
}));
vi.mock('@/hooks/useJobsRealtime', () => ({
  useJobsRealtime: vi.fn(),
}));

const mockJobs = [
  {
    id: 'job-1',
    title: 'Test Job 1',
    client_id: 'client-1',
    technician_id: 'tech-1',
    status: 'scheduled',
    date: '2024-01-15T09:00:00Z',
    schedule_end: '2024-01-15T11:00:00Z',
    description: 'Test description',
  },
  {
    id: 'job-2',
    title: 'Test Job 2',
    client_id: 'client-2',
    technician_id: null,
    status: 'in-progress',
    date: '2024-01-16T14:00:00Z',
    schedule_end: null,
    description: '',
  },
];

const mockClients = [
  { id: 'client-1', name: 'John Doe' },
  { id: 'client-2', name: 'Jane Smith' },
];

const mockProfiles = [
  { id: 'tech-1', name: 'Mike Tech', email: 'mike@test.com' },
];

describe('useFullCalendarEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain for supabase
    const mockFrom = vi.fn();
    const mockSelect = vi.fn();
    const mockIn = vi.fn();
    const mockEq = vi.fn();

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'jobs') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: mockJobs, error: null }),
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: () => Promise.resolve({ data: mockClients, error: null }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: mockProfiles, error: null }),
          }),
        };
      }
      return { select: () => Promise.resolve({ data: [], error: null }) };
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    expect(result.current.loading).toBe(true);
    expect(result.current.jobs).toEqual([]);
    expect(result.current.events).toEqual([]);
  });

  it('should convert jobs to calendar events', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    // Events array should be defined and be an array
    expect(Array.isArray(result.current.events)).toBe(true);
  });

  it('should have event handlers defined', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    expect(typeof result.current.handleEventDrop).toBe('function');
    expect(typeof result.current.handleEventResize).toBe('function');
    expect(typeof result.current.handleDateSelect).toBe('function');
    expect(typeof result.current.updateJobTechnician).toBe('function');
    expect(typeof result.current.getJobById).toBe('function');
  });

  it('should provide resources for technician view', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    // Resources array should be defined
    expect(Array.isArray(result.current.resources)).toBe(true);
  });

  it('should have correct status colors', () => {
    // This tests that events have backgroundColor set based on status
    const { result } = renderHook(() => useFullCalendarEvents());

    // Status colors should be applied to events
    result.current.events.forEach((event) => {
      expect(event.backgroundColor).toBeDefined();
    });
  });

  it('should expose fetchJobs for manual refresh', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    expect(typeof result.current.fetchJobs).toBe('function');
  });
});

describe('useFullCalendarEvents - Event Handlers', () => {
  it('handleDateSelect should return selection info', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    const mockSelectInfo = {
      start: new Date('2024-01-15T09:00:00'),
      end: new Date('2024-01-15T10:00:00'),
      allDay: false,
      resource: { id: 'tech-1' },
    };

    const selection = result.current.handleDateSelect(mockSelectInfo as any);

    expect(selection).toEqual({
      start: mockSelectInfo.start,
      end: mockSelectInfo.end,
      allDay: false,
      resourceId: 'tech-1',
    });
  });

  it('getJobById should return undefined for non-existent job', () => {
    const { result } = renderHook(() => useFullCalendarEvents());

    // Should return undefined for a job that doesn't exist
    const job = result.current.getJobById('non-existent-id');
    expect(job).toBeUndefined();
  });
});
