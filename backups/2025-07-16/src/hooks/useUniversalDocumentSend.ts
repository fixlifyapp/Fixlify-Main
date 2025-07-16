import { useState, useCallback } from 'react';

interface SendState {
  documentId: string | null;
  documentType: 'invoice' | 'estimate' | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
}

interface UseUniversalDocumentSendOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useUniversalDocumentSend = (options: UseUniversalDocumentSendOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sendState, setSendState] = useState<SendState>({
    documentId: null,
    documentType: null,
    recipientEmail: null,
    recipientPhone: null,
  });

  const openSendDialog = useCallback((
    documentId: string,
    documentType: 'invoice' | 'estimate',
    recipientEmail?: string,
    recipientPhone?: string
  ) => {
    setSendState({
      documentId,
      documentType,
      recipientEmail: recipientEmail || null,
      recipientPhone: recipientPhone || null,
    });
    setIsOpen(true);
  }, []);
  const closeSendDialog = useCallback(() => {
    setIsOpen(false);
    // Reset state after a delay to prevent UI flashing
    setTimeout(() => {
      setSendState({
        documentId: null,
        documentType: null,
        recipientEmail: null,
        recipientPhone: null,
      });
    }, 300);
  }, []);

  const handleSendSuccess = useCallback(() => {
    closeSendDialog();
    if (options.onSuccess) {
      options.onSuccess();
    }
  }, [closeSendDialog, options]);

  const handleSendError = useCallback((error: Error) => {
    if (options.onError) {
      options.onError(error);
    }
  }, [options]);

  return {
    isOpen,
    sendState,
    openSendDialog,
    closeSendDialog,
    handleSendSuccess,
    handleSendError,
  };
};