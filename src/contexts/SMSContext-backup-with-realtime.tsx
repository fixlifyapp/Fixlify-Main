// Backup SMS context stub to fix TypeScript errors
import { createContext, useContext, ReactNode } from "react";

interface SMSContextType {
  conversations: any[];
  loading: boolean;
  sendMessage: (to: string, message: string) => Promise<void>;
}

const SMSContext = createContext<SMSContextType>({
  conversations: [],
  loading: false,
  sendMessage: async () => {},
});

export const useSMS = () => useContext(SMSContext);

export const SMSProvider = ({ children }: { children: ReactNode }) => {
  const value: SMSContextType = {
    conversations: [],
    loading: false,
    sendMessage: async () => {},
  };

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
};