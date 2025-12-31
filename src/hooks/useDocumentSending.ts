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

        // Use the specific SMS edge function based on document type
        const smsFunction = documentType === 'estimate' ? 'send-estimate-sms' : 'send-invoice-sms';
        const { data, error } = await supabase.functions.invoke(smsFunction, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientPhone: formattedPhone,
            customMessage: customMessage,
            metadata: {
              documentType,
              documentId,
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
        // Email sending using specialized edge functions
        const functionName = documentType === 'estimate' ? 'send-estimate' : 'send-invoice';
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
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
