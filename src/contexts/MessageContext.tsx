// Temporary stub to prevent build errors
// Will be replaced with proper SMS integration

export const useMessageContext = () => {
  return {
    openMessageDialog: (client?: any) => {},
    conversations: [],
    fetchConversations: () => Promise.resolve(),
    refreshMessages: () => {},
    refreshConversations: () => Promise.resolve(),
    isLoading: false,
    restoreArchivedConversation: (id: string) => Promise.resolve(),
    activeConversation: null,
    sendMessage: (id: string, message: string) => Promise.resolve(),
    isSending: false,
  };
};

export const useMessage = useMessageContext;

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};