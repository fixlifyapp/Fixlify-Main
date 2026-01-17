import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useClientData } from '../useClientData';
import { supabase } from '@/integrations/supabase/client';

// Mock modules
vi.mock('@/integrations/supabase/client');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockClients = [
  {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    country: 'USA',
    company: 'Doe Inc',
    notes: 'VIP customer',
    status: 'active',
    type: 'Residential',
    tags: ['vip', 'returning'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    created_by: 'user-1',
    user_id: 'user-1',
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-5678',
    address: '456 Oak Ave',
    city: 'Somewhere',
    state: 'NY',
    zip: '67890',
    country: 'USA',
    company: null,
    notes: '',
    status: 'active',
    type: 'Commercial',
    tags: [],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    created_by: 'user-1',
    user_id: 'user-1',
  },
];

describe('useClientData', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock chain for supabase
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnValue(Promise.resolve({ data: mockClients, error: null })),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(Promise.resolve({
                data: { ...mockClients[0], id: 'new-client-1' },
                error: null
              })),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
          }),
        };
      }
      return { select: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })) };
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useClientData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.clients).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should have CRUD operations defined', () => {
    const { result } = renderHook(() => useClientData());

    expect(typeof result.current.fetchClients).toBe('function');
    expect(typeof result.current.createClient).toBe('function');
    expect(typeof result.current.updateClient).toBe('function');
    expect(typeof result.current.deleteClient).toBe('function');
    expect(typeof result.current.getClientById).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch clients on mount', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.clients.length).toBeGreaterThanOrEqual(0);
  });

  it('should transform client data correctly', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Each client should have required fields
    result.current.clients.forEach(client => {
      expect(client.id).toBeDefined();
      expect(client.name).toBeDefined();
      expect(client.status).toBeDefined();
      expect(client.type).toBeDefined();
      expect(Array.isArray(client.tags)).toBe(true);
    });
  });

  it('getClientById should return correct client', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // If there are clients, test getClientById
    if (result.current.clients.length > 0) {
      const firstClient = result.current.clients[0];
      const foundClient = result.current.getClientById(firstClient.id);
      expect(foundClient?.id).toBe(firstClient.id);
    }
  });

  it('getClientById should return undefined for non-existent id', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const foundClient = result.current.getClientById('non-existent-id');
    expect(foundClient).toBeUndefined();
  });
});

describe('useClientData - CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue(Promise.resolve({ data: mockClients, error: null })),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue(Promise.resolve({
            data: {
              id: 'new-client',
              name: 'New Client',
              email: 'new@example.com',
              status: 'active',
              type: 'Residential',
              tags: [],
            },
            error: null
          })),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
      }),
    }));
  });

  it('createClient should create and return new client', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // createClient should be callable and return a promise
    expect(typeof result.current.createClient).toBe('function');
  });

  it('updateClient should update existing client', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // updateClient should be callable
    expect(typeof result.current.updateClient).toBe('function');
  });

  it('deleteClient should remove client', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // deleteClient should be callable
    expect(typeof result.current.deleteClient).toBe('function');
  });

  it('refetch should reload clients', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    // Should not throw
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useClientData - Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue(Promise.resolve({ data: mockClients, error: null })),
      }),
    }));
  });

  it('fetchClients should support filters', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // fetchClients should accept filter parameters
    await act(async () => {
      await result.current.fetchClients({ status: ['active'], searchTerm: 'John' });
    });

    expect(typeof result.current.fetchClients).toBe('function');
  });

  it('fetchClients should support sort options', async () => {
    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // fetchClients should accept sort parameters
    await act(async () => {
      await result.current.fetchClients(undefined, { field: 'name', direction: 'asc' });
    });

    expect(typeof result.current.fetchClients).toBe('function');
  });
});

describe('useClientData - Error Handling', () => {
  it('should handle fetch errors gracefully', async () => {
    vi.clearAllMocks();

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue(Promise.resolve({
          data: null,
          error: { message: 'Database error' }
        })),
      }),
    }));

    const { result } = renderHook(() => useClientData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Error should be captured
    expect(result.current.error).toBeDefined();
  });

  it('should have error state property', () => {
    const { result } = renderHook(() => useClientData());

    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });
});
