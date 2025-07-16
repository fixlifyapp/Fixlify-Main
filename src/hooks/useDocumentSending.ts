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
        // Email sending
        // First get document details
        const table = documentType === 'estimate' ? 'estimates' : 'invoices';
        const { data: docData, error: docError } = await supabase
          .from(table)
          .select('*, jobs(*, clients(*))')
          .eq('id', documentId)
          .single();

        if (docError) throw docError;

        // Get company info
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, company_email')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        // Prepare template variables
        const templateName = documentType === 'estimate' ? 'estimate_ready_email' : 'invoice_ready_email';
        const portalLink = `${window.location.origin}/portal/${documentType}/${documentId}`;
        
        const variables = {
          client_name: contactInfo?.name || 'Valued Customer',
          [`${documentType}_number`]: docData[`${documentType}_number`],
          amount: `$${docData.total.toFixed(2)}`,
          link: portalLink,
          company_name: profile?.company_name || 'Our Company',
          valid_until: documentType === 'estimate' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() : '',
          due_date: documentType === 'invoice' && docData.due_date ? 
            new Date(docData.due_date).toLocaleDateString() : ''
        };

        // Send email using our edge function
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: sendTo,
            template: templateName,
            variables: variables,
            metadata: {
              documentType,
              documentId,
              jobId: docData.job_id,
              clientId: docData.jobs?.client_id
            },
            ...(customMessage && { 
              html: customMessage.replace(/\n/g, '<br>'),
              text: customMessage 
            })
          }
        });

        if (error) throw error;

        // Update document status
        await supabase
          .from(table)
          .update({ status: 'sent' })
          .eq('id', documentId);

        toast.success(`${documentType} sent via email successfully!`);
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
