
export interface UnifiedMessage {
  id: string;
  body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  sender?: string;
  recipient?: string;
  status?: string;
  read_at?: string;
  conversation_id?: string;
}

export interface UnifiedConversation {
  id: string;
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: UnifiedMessage[];
  job?: {
    id: string;
    title: string;
    service: string;
    status: string;
  };
}

export interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isDisabled?: boolean;
  showSuggestResponse?: boolean;
  onSuggestResponse?: () => void;
  isAILoading?: boolean;
  clientInfo?: {
    name: string;
    phone?: string;
    id?: string;
  };
  messages?: UnifiedMessage[];
}
