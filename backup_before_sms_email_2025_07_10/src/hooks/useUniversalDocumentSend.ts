import { useState } from 'react';
import { Invoice } from '@/types/documents';
import { Estimate } from '@/hooks/useEstimates';

interface UseUniversalDocumentSendProps {
  onSuccess?: () => void;
}

interface DocumentSendState {
  isOpen: boolean;
  documentType: 'invoice' | 'estimate';
  documentId: string;
  documentNumber: string;
  total: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export const useUniversalDocumentSend = ({ onSuccess }: UseUniversalDocumentSendProps = {}) => {
  const [sendState, setSendState] = useState<DocumentSendState | null>(null);

  const openSendDialog = (document: Invoice | Estimate, type: 'invoice' | 'estimate', clientInfo?: any) => {
    setSendState({
      isOpen: true,
      documentType: type,
      documentId: document.id,
      documentNumber: type === 'invoice' 
        ? (document as Invoice).invoice_number 
        : (document as Estimate).estimate_number,
      total: document.total || 0,
      contactInfo: {
        name: clientInfo?.name || document.client_name || 'Client',
        email: clientInfo?.email || document.client_email || '',
        phone: clientInfo?.phone || document.client_phone || ''
      }
    });
  };

  const closeSendDialog = () => {
    setSendState(null);
  };

  const handleSendSuccess = () => {
    closeSendDialog();
    if (onSuccess) {
      onSuccess();
    }
  };

  return {
    sendState,
    openSendDialog,
    closeSendDialog,
    handleSendSuccess,
    isOpen: sendState?.isOpen || false
  };
};