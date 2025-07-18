
import React from 'react';
import UniversalSendDialog, { SendDocumentParams } from '../../shared/UniversalSendDialog';

export interface UnifiedDocumentViewerDialogsProps {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  jobId: string;
  showSendDialog: boolean;
  setShowSendDialog: (show: boolean) => void;
  onSendSuccess: () => void;
  onDeleteSuccess: () => void;
  onDuplicateSuccess: () => void;
  onConvertSuccess: () => void;
  handleConvertSuccess: () => void;
}

const UnifiedDocumentViewerDialogs: React.FC<UnifiedDocumentViewerDialogsProps> = ({
  documentType,
  documentId,
  jobId,
  showSendDialog,
  setShowSendDialog,
  onSendSuccess,
  onDeleteSuccess,
  onDuplicateSuccess,
  onConvertSuccess,
  handleConvertSuccess
}) => {
  const handleSend = async (params: SendDocumentParams) => {
    try {
      console.log('Sending document:', params);
      // Implement actual send logic here
      onSendSuccess();
    } catch (error) {
      console.error('Error sending document:', error);
      throw error;
    }
  };

  return (
    <>
      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        documentType={documentType}
        documentId={documentId}
        onSend={handleSend}
      />
    </>
  );
};

export default UnifiedDocumentViewerDialogs;
