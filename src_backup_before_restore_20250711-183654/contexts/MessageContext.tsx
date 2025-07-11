// Temporary stub to prevent build errors
// Will be replaced with proper SMS integration

export const useMessageContext = () => {
  return {
    openMessageDialog: () => {},
    conversations: [],
    fetchConversations: () => Promise.resolve(),
    refreshMessages: () => {},
  };
};

export const useMessage = useMessageContext;

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};