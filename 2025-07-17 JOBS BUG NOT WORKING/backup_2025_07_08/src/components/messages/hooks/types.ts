
export interface UseMessageDialogProps {
  client: {
    name: string;
    phone?: string;
    id?: string;
  };
  open: boolean;
}

export interface UseMessageDialogReturn {
  message: string;
  setMessage: (message: string) => void;
  messages: any[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  handleSendMessage: () => Promise<void>;
  conversationId: string | null;
}

export interface FormattedMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isClient: boolean;
}
