
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UnifiedDocumentViewerDialogs from './unified/components/UnifiedDocumentViewerDialogs';
import { Estimate } from '@/types/estimate';
import { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface UnifiedDocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'estimate' | 'invoice';
  documentId: string;
  jobId: string;
}

const UnifiedDocumentViewer: React.FC<UnifiedDocumentViewerProps> = ({
  open,
  onOpenChange,
  documentType,
  documentId,
  jobId
}) => {
  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {documentType === 'estimate' ? 'Estimate' : 'Invoice'} Viewer
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Document ID: {documentId}</p>
            <p>Job ID: {jobId}</p>
          </div>
        </DialogContent>
      </Dialog>

      <UnifiedDocumentViewerDialogs
        documentType={documentType}
        documentId={documentId}
        jobId={jobId}
        showSendDialog={showSendDialog}
        setShowSendDialog={setShowSendDialog}
        onSendSuccess={() => console.log('Send success')}
        onDeleteSuccess={() => console.log('Delete success')}
        onDuplicateSuccess={() => console.log('Duplicate success')}
        onConvertSuccess={() => console.log('Convert success')}
        handleConvertSuccess={() => console.log('Convert success')}
      />
    </>
  );
};

export default UnifiedDocumentViewer;
export { UnifiedDocumentViewer };
