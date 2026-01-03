import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Helper to create a chainable query builder mock
const createQueryBuilderMock = () => {
  const chainable = {
    select: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    in: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return chainable;
};

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => createQueryBuilderMock()),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
    })),
    removeChannel: vi.fn(() => Promise.resolve()),
  },
}));

// Mock useAuth hook
vi.mock('@/hooks/use-auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { user: { id: 'test-user-id' } },
      loading: false,
    })),
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
