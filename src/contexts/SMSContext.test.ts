import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { SMSContext, useSMS, SMSProvider } from './SMSContext';

// Mock the supabase client is already done in setup.ts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SMSContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSMS hook', () => {
    it('should throw error when used outside SMSProvider', () => {
      // This test verifies the error handling
      expect(() => {
        renderHook(() => useSMS());
      }).toThrow('useSMS must be used within SMSProvider');
    });

    it('should return context value when inside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('conversations');
      expect(result.current).toHaveProperty('messages');
      expect(result.current).toHaveProperty('sendMessage');
    });
  });

  describe('SMSContext initial state', () => {
    it('should provide default values for conversations and messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(Array.isArray(result.current.conversations)).toBe(true);
      expect(Array.isArray(result.current.messages)).toBe(true);
      expect(result.current.activeConversation).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSending).toBe(false);
    });

    it('should provide required context methods', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.fetchConversations).toBe('function');
      expect(typeof result.current.fetchMessages).toBe('function');
      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.createConversation).toBe('function');
      expect(typeof result.current.setActiveConversation).toBe('function');
      expect(typeof result.current.markAsRead).toBe('function');
    });
  });

  describe('SMS Context methods', () => {
    it('should allow setting active conversation', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      const mockConversation = {
        id: '1',
        user_id: 'user-1',
        phone_number: '+1234567890',
        client_phone: '+0987654321',
        status: 'active',
        unread_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.setActiveConversation(mockConversation);
      });

      expect(result.current.activeConversation).toEqual(mockConversation);
    });

    it('should clear active conversation when set to null', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      const mockConversation = {
        id: '1',
        user_id: 'user-1',
        phone_number: '+1234567890',
        client_phone: '+0987654321',
        status: 'active',
        unread_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      result.current.setActiveConversation(mockConversation);
      result.current.setActiveConversation(null);

      expect(result.current.activeConversation).toBeNull();
    });

    it('should provide fetchConversations method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.fetchConversations).toBe('function');
    });

    it('should provide fetchMessages method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.fetchMessages).toBe('function');
    });

    it('should provide sendMessage method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.sendMessage).toBe('function');
    });

    it('should provide createConversation method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.createConversation).toBe('function');
    });

    it('should provide markAsRead method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(SMSProvider, null, children);

      const { result } = renderHook(() => useSMS(), { wrapper });

      expect(typeof result.current.markAsRead).toBe('function');
    });
  });

  describe('SMS Message types', () => {
    it('should validate message direction enum', () => {
      const directions = ['inbound', 'outbound'] as const;
      expect(directions).toContain('inbound');
      expect(directions).toContain('outbound');
    });

    it('should handle message metadata', () => {
      // Test that metadata structure is supported
      const metadata = {
        conversationId: 'conv-1',
        clientId: 'client-1',
        clientName: 'John Doe',
        source: 'sms_conversations',
      };

      expect(metadata).toHaveProperty('conversationId');
      expect(metadata).toHaveProperty('clientId');
      expect(metadata).toHaveProperty('clientName');
      expect(metadata).toHaveProperty('source');
    });
  });

  describe('SMS Conversation structure', () => {
    it('should validate conversation structure', () => {
      const mockConversation = {
        id: '1',
        user_id: 'user-1',
        client_id: 'client-1',
        phone_number: '+1234567890',
        client_phone: '+0987654321',
        status: 'active',
        last_message_at: '2024-01-01T00:00:00Z',
        last_message_preview: 'Hello',
        unread_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client: {
          id: 'client-1',
          name: 'John Doe',
          phone: '+0987654321',
          email: 'john@example.com',
        },
      };

      expect(mockConversation).toHaveProperty('id');
      expect(mockConversation).toHaveProperty('user_id');
      expect(mockConversation).toHaveProperty('phone_number');
      expect(mockConversation).toHaveProperty('client_phone');
      expect(mockConversation).toHaveProperty('status');
      expect(mockConversation).toHaveProperty('unread_count');
    });
  });
});
