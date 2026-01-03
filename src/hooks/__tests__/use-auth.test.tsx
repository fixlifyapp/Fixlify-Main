import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// Override the setup.ts mock of use-auth to get the real implementation
vi.unmock('@/hooks/use-auth');

// Mock useAuthState to control what the useAuth hook returns
vi.mock('../useAuthState', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuthState: vi.fn()
  };
});

// Now we can safely import after the mock is set up
import { AuthProvider, useAuth } from '../use-auth';
import { useAuthState } from '../useAuthState';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should return context value when inside provider', () => {
      const mockAuthState = {
        session: { user: { id: 'test-user-id' } },
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false,
        error: null,
        isAuthenticated: true,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toEqual(mockAuthState);
    });

    it('should return defined context properties', () => {
      const mockAuthState = {
        session: { user: { id: 'test-user-id' } },
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false,
        error: null,
        isAuthenticated: true,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('signOut');
    });
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      const mockAuthState = {
        session: null,
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle authenticated state', () => {
      const mockSession = {
        user: { id: 'user-123', email: 'user@example.com' },
        access_token: 'token-123'
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        user_metadata: {}
      };

      const mockAuthState = {
        session: mockSession,
        user: mockUser,
        loading: false,
        error: null,
        isAuthenticated: true,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle error state', () => {
      const mockAuthState = {
        session: null,
        user: null,
        loading: false,
        error: 'Authentication failed',
        isAuthenticated: false,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.error).toBe('Authentication failed');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide signOut function', async () => {
      const mockSignOut = vi.fn();
      const mockAuthState = {
        session: { user: { id: 'user-123' } },
        user: { id: 'user-123', email: 'user@example.com' },
        loading: false,
        error: null,
        isAuthenticated: true,
        signOut: mockSignOut
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.signOut).toBe('function');
      expect(result.current.signOut).toBe(mockSignOut);
    });
  });

  describe('Auth state transitions', () => {
    it('should transition from loading to authenticated', () => {
      const mockAuthState = {
        session: { user: { id: 'user-123' } },
        user: { id: 'user-123', email: 'user@example.com' },
        loading: false,
        error: null,
        isAuthenticated: true,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle null session and user', () => {
      const mockAuthState = {
        session: null,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        signOut: vi.fn()
      };

      vi.mocked(useAuthState).mockReturnValue(mockAuthState as any);

      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(AuthProvider, null, children);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
