// Base modal provider to fix TypeScript errors
import { createContext, useContext, ReactNode } from "react";

export interface BaseModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

interface ModalContextType {
  openModal: (type: string, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const value: ModalContextType = {
    openModal: () => {},
    closeModal: () => {},
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};