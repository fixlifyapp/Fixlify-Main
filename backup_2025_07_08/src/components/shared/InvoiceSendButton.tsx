import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';
import { useUniversalDocumentSend } from '@/hooks/useUniversalDocumentSend';
import { Invoice } from '@/types/documents';
import { toast } from 'sonner';

interface InvoiceSendButtonProps {
  invoice: Invoice;
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: () => void;
  showIcon?: boolean;
  buttonText?: string;
}

export const InvoiceSendButton: React.FC<InvoiceSendButtonProps> = ({
  invoice,
  clientInfo,
  variant = 'outline',
  size = 'sm',
  className = '',
  onSuccess,
  showIcon = true,
  buttonText = 'Send'
}) => {
  const {
    sendState,
    openSendDialog,
    closeSendDialog,
    handleSendSuccess,
    isOpen
  } = useUniversalDocumentSend({
    onSuccess: () => {
      toast.success('Invoice sent successfully!');
      if (onSuccess) {
        onSuccess();
      }
    }
  });

  const handleClick = () => {
    openSendDialog(invoice, 'invoice', clientInfo);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
      >
        {showIcon && <Send className="h-4 w-4 mr-2" />}
        {buttonText}
      </Button>

      {isOpen && sendState && (
        <UniversalSendDialog
          isOpen={isOpen}
          onClose={closeSendDialog}
          documentType={sendState.documentType}
          documentId={sendState.documentId}
          documentNumber={sendState.documentNumber}
          total={sendState.total}
          contactInfo={sendState.contactInfo}
          onSuccess={handleSendSuccess}
        />
      )}
    </>
  );
};