import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ModalRenderer } from "./modal-renderer";

// Define modal types
export type ModalType = 
  | "newJob"
  | "newProduct"
  | "newClient"
  | "newAppointment"
  | "newExpense"
  | "newQuote"
  | "newAutomation"
  | "newBusinessInfo"
  | "newTeamMember"
  | "newServiceArea"
  | "newJobType"
  | "newExpenseCategory"
  | "messageClient"
  | "editJobDetails"
  | "convertToInvoice"
  | "clientSelection"
  | "deleteConfirm";

// Base props that all modals will have
export interface BaseModalProps {
  onClose?: () => void;
  [key: string]: any;
}

// Context state interface
interface ModalState {
  id: string;
  type: ModalType;
  props: BaseModalProps;
}

interface ModalContextType {
  modals: ModalState[];
  openModal: (type: ModalType, props?: BaseModalProps) => void;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = (type: ModalType, props: BaseModalProps = {}) => {
    const id = `${type}-${Date.now()}`;
    const modalState: ModalState = {
      id,
      type,
      props: {
        ...props,
        onClose: () => {
          closeModal(id);
          props.onClose?.();
        }
      }
    };
    
    setModals(prev => [...prev, modalState]);
  };

  const closeModal = (id?: string) => {
    if (id) {
      setModals(prev => prev.filter(modal => modal.id !== id));
    } else {
      // Close the most recent modal
      setModals(prev => prev.slice(0, -1));
    }
  };

  const closeAllModals = () => {
    setModals([]);
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
