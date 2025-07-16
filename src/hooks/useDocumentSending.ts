import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface SendDocumentParams {
  documentType: 'estimate' | 'invoice';
  documentId: string;
  sendMethod: 'email' | 'sms';
  sendTo: string;
  customMessage?: string;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const useDocumentSending = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async ({
    documentType,
    documentId,
    sendMethod,
    sendTo,
    customMessage,
    contactInfo
  }: SendDocumentParams) => {
    setIsProcessing(true);

    try {
      if (sendMethod === 'sms') {
        // Send SMS using our edge function
        const { data, error } = await supabase.functions.invoke('send-sms', {
          body: {
            to: sendTo,
            message: customMessage || `Your ${documentType} is ready. View it here: ${window.location.origin}/${documentType}/${documentId}`,
            userId: user?.id,
            metadata: {
              documentType,
              documentId,
              recipientName: contactInfo?.name
            }
          }
        });

        if (error) throw error;

        // Update document status to 'sent'
        const table = documentType === 'estimate' ? 'estimates' : 'invoices';
        await supabase
          .from(table)
          .update({ status: 'sent' })
          .eq('id', documentId);

        toast.success(`${documentType} sent via SMS successfully!`);
        return { success: true };
      } else {
        // Email sending using specialized edge functions
        const functionName = documentType === 'estimate' ? 'send-estimate' : 'send-invoice';
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientEmail: sendTo,
            customMessage: customMessage
          }
        });

        if (error) throw error;

        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via email successfully!`);
        return { success: true };
      }
    } catch (error: any) {
      console.error('Error sending document:', error);
      toast.error(error.message || 'Failed to send document');
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};
