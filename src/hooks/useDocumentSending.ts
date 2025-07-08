
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendEmailParams {
  recipientEmail: string;
  recipientName?: string;
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  subject?: string;
  message?: string;
}

interface SendSMSParams {
  recipientPhone: string;
  recipientName?: string;
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  message?: string;
}

export const useDocumentSending = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = async (params: SendEmailParams) => {
    setIsLoading(true);
    console.log('📧 Sending email with params:', params);
    
    try {
      const functionName = params.documentType === 'estimate' ? 'send-estimate' : 'send-invoice';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName || 'Client',
          documentId: params.documentId,
          documentNumber: params.documentNumber,
          subject: params.subject,
          message: params.message,
          documentType: params.documentType
        }
      });

      if (error) {
        console.error('❌ Email sending error:', error);
        throw error;
      }

      console.log('✅ Email sent successfully:', data);
      toast.success(`${params.documentType.charAt(0).toUpperCase() + params.documentType.slice(1)} sent via email successfully!`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      toast.error(`Failed to send ${params.documentType} via email: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMS = async (params: SendSMSParams) => {
    setIsLoading(true);
    console.log('📱 Sending SMS with params:', params);
    
    try {
      const functionName = params.documentType === 'estimate' ? 'send-estimate-sms' : 'send-invoice-sms';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          recipientPhone: params.recipientPhone,
          recipientName: params.recipientName || 'Client',
          documentId: params.documentId,
          documentNumber: params.documentNumber,
          message: params.message,
          documentType: params.documentType
        }
      });

      if (error) {
        console.error('❌ SMS sending error:', error);
        throw error;
      }

      console.log('✅ SMS sent successfully:', data);
      toast.success(`${params.documentType.charAt(0).toUpperCase() + params.documentType.slice(1)} sent via SMS successfully!`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
      toast.error(`Failed to send ${params.documentType} via SMS: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    sendSMS,
    isLoading
  };
};
