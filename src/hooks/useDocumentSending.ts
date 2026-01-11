import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { toE164 } from '@/utils/phone-utils';

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
        // Format phone number to E.164 format for Telnyx
        const formattedPhone = toE164(sendTo);

        // Use unified send-document-sms edge function
        const { data, error } = await supabase.functions.invoke('send-document-sms', {
          body: {
            documentType,
            documentId,
            recipientPhone: formattedPhone,
            customMessage: customMessage,
            metadata: {
              recipientName: contactInfo?.name
            }
          }
        });

        if (error || !data?.success) {
          const errorMsg = data?.error || error?.message || 'Failed to send SMS';
          throw new Error(errorMsg);
        }

        // Update document status to 'sent'
        const table = documentType === 'estimate' ? 'estimates' : 'invoices';
        await supabase
          .from(table)
          .update({ status: 'sent' })
          .eq('id', documentId);

        toast.success(`${documentType} sent via SMS successfully!`);
        return { success: true };
      } else {
        // Email sending using unified send-document-email edge function
        const { data, error } = await supabase.functions.invoke('send-document-email', {
          body: {
            documentType,
            documentId,
            recipientEmail: sendTo,
            customMessage: customMessage
          }
        });

        if (error || !data?.success) {
          const errorMsg = data?.error || error?.message || 'Failed to send email';
          throw new Error(errorMsg);
        }

        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via email successfully!`);
        return { success: true };
      }
    } catch (error: any) {
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
