// Email and messaging types
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  // Database compatibility fields
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  direction?: string;
  email_address?: string;
  is_read?: boolean;
  is_starred?: boolean;
  status?: string;
  thread_id?: string;
}

// Conversation thread types
export interface ConversationThreadProps {
  messages: any[];
  clientName: string;
  client?: any; // Added for backward compatibility
  onArchive?: () => Promise<void>;
}