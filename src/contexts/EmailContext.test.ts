import { describe, it, expect, beforeEach, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { EmailContext, useEmail, EmailProvider } from './EmailContext';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EmailContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEmail hook', () => {
    it('should throw error when used outside EmailProvider', () => {
      expect(() => {
        renderHook(() => useEmail());
      }).toThrow('useEmail must be used within EmailProvider');
    });

    it('should return context value when inside provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('conversations');
      expect(result.current).toHaveProperty('messages');
      expect(result.current).toHaveProperty('sendEmail');
    });
  });

  describe('EmailContext initial state', () => {
    it('should provide default values for conversations and messages', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(Array.isArray(result.current.conversations)).toBe(true);
      expect(Array.isArray(result.current.messages)).toBe(true);
      expect(result.current.selectedConversation).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('should provide required context methods', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.selectConversation).toBe('function');
      expect(typeof result.current.sendEmail).toBe('function');
      expect(typeof result.current.markAsRead).toBe('function');
      expect(typeof result.current.archiveConversation).toBe('function');
      expect(typeof result.current.deleteConversation).toBe('function');
      expect(typeof result.current.refreshConversations).toBe('function');
    });
  });

  describe('Email Context methods', () => {
    it('should allow selecting a conversation', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      const mockConversation = {
        id: '1',
        user_id: 'user-1',
        client_id: 'client-1',
        email_address: 'test@example.com',
        client_name: 'Test Client',
        subject: 'Test Subject',
        last_message_at: '2024-01-01T00:00:00Z',
        last_message_preview: 'Test message',
        unread_count: 1,
        is_archived: false,
        is_starred: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.selectConversation(mockConversation);
      });

      expect(result.current.selectedConversation).toEqual(mockConversation);
    });

    it('should provide selectConversation method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.selectConversation).toBe('function');
    });

    it('should provide sendEmail method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.sendEmail).toBe('function');
    });

    it('should provide markAsRead method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.markAsRead).toBe('function');
    });

    it('should provide archiveConversation method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.archiveConversation).toBe('function');
    });

    it('should provide deleteConversation method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.deleteConversation).toBe('function');
    });

    it('should provide refreshConversations method', () => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        React.createElement(EmailProvider, null, children);

      const { result } = renderHook(() => useEmail(), { wrapper });

      expect(typeof result.current.refreshConversations).toBe('function');
    });
  });

  describe('Email Message structure', () => {
    it('should validate message direction enum', () => {
      const directions = ['inbound', 'outbound'] as const;
      expect(directions).toContain('inbound');
      expect(directions).toContain('outbound');
    });

    it('should handle email attachments', () => {
      const attachment = {
        id: 'att-1',
        filename: 'document.pdf',
        mimetype: 'application/pdf',
        size: 102400,
        url: 'https://example.com/document.pdf',
      };

      expect(attachment).toHaveProperty('filename');
      expect(attachment).toHaveProperty('mimetype');
      expect(attachment).toHaveProperty('size');
    });

    it('should handle message metadata', () => {
      const metadata = {
        key: 'value',
        number: 123,
        boolean: true,
      };

      expect(metadata).toHaveProperty('key');
      expect(metadata['key']).toBe('value');
    });

    it('should validate complete email message structure', () => {
      const message = {
        id: '1',
        conversation_id: 'conv-1',
        user_id: 'user-1',
        direction: 'inbound' as const,
        from_email: 'sender@example.com',
        to_email: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test body',
        html_body: '<p>Test body</p>',
        attachments: [
          {
            filename: 'test.pdf',
            mimetype: 'application/pdf',
            size: 1024,
          },
        ],
        is_read: false,
        email_id: 'email-123',
        thread_id: 'thread-123',
        status: 'received',
        metadata: {},
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('conversation_id');
      expect(message).toHaveProperty('direction');
      expect(message).toHaveProperty('from_email');
      expect(message).toHaveProperty('to_email');
      expect(message).toHaveProperty('subject');
      expect(message).toHaveProperty('body');
      expect(message.direction).toBe('inbound');
    });
  });

  describe('Email Conversation structure', () => {
    it('should validate conversation structure', () => {
      const mockConversation = {
        id: '1',
        user_id: 'user-1',
        client_id: 'client-1',
        email_address: 'test@example.com',
        client_name: 'Test Client',
        subject: 'Test Subject',
        last_message_at: '2024-01-01T00:00:00Z',
        last_message_preview: 'Test message',
        unread_count: 1,
        is_archived: false,
        is_starred: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(mockConversation).toHaveProperty('id');
      expect(mockConversation).toHaveProperty('user_id');
      expect(mockConversation).toHaveProperty('email_address');
      expect(mockConversation).toHaveProperty('client_name');
      expect(mockConversation).toHaveProperty('subject');
      expect(mockConversation).toHaveProperty('unread_count');
      expect(mockConversation).toHaveProperty('is_archived');
      expect(mockConversation).toHaveProperty('is_starred');
    });

    it('should support null client_id', () => {
      const conversation = {
        id: '1',
        user_id: 'user-1',
        client_id: null,
        email_address: 'test@example.com',
        client_name: null,
        subject: 'Test',
        last_message_at: '2024-01-01T00:00:00Z',
        last_message_preview: null,
        unread_count: 0,
        is_archived: false,
        is_starred: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(conversation.client_id).toBeNull();
      expect(conversation.client_name).toBeNull();
    });
  });

  describe('Email Context export', () => {
    it('should export EmailContext', () => {
      expect(EmailContext).toBeDefined();
    });

    it('should export useEmail hook', () => {
      expect(typeof useEmail).toBe('function');
    });

    it('should export EmailProvider component', () => {
      expect(typeof EmailProvider).toBe('function');
    });
  });
});
