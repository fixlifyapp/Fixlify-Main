
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SendEmailParams {
  recipientEmail: string;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  subject?: string;
  message?: string;
}

export interface SendSMSParams {
  recipientPhone: string;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  message?: string;
}

export interface SendDocumentParams {
  method: 'email' | 'sms';
  recipientEmail?: string;
  recipientPhone?: string;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  subject?: string;
  message?: string;
}

export function useDocumentSending() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendEmail = async (params: SendEmailParams) => {
    console.log('📧 Sending email with params:', params);
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      const functionName = params.documentType === 'estimate' ? 'send-estimate' : 'send-invoice';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          documentId: params.documentId,
          recipientEmail: params.recipientEmail,
          subject: params.subject,
          message: params.message
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('✅ Email sent successfully:', data);
      toast.success(`${params.documentType} sent via email successfully!`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      toast.error(`Failed to send ${params.documentType} via email: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const sendSMS = async (params: SendSMSParams) => {
    console.log('📱 Sending SMS with params:', params);
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      const functionName = params.documentType === 'estimate' ? 'send-estimate-sms' : 'send-invoice-sms';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          documentId: params.documentId,
          recipientPhone: params.recipientPhone,
          message: params.message
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('✅ SMS sent successfully:', data);
      toast.success(`${params.documentType} sent via SMS successfully!`);
      return data;
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
      toast.error(`Failed to send ${params.documentType} via SMS: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const sendDocument = async (params: SendDocumentParams) => {
    console.log('📄 Sending document with params:', params);
    
    if (params.method === 'email') {
      if (!params.recipientEmail) {
        throw new Error('Recipient email is required for email sending');
      }
      return sendEmail({
        recipientEmail: params.recipientEmail,
        documentId: params.documentId,
        documentType: params.documentType,
        subject: params.subject,
        message: params.message
      });
    } else if (params.method === 'sms') {
      if (!params.recipientPhone) {
        throw new Error('Recipient phone is required for SMS sending');
      }
      return sendSMS({
        recipientPhone: params.recipientPhone,
        documentId: params.documentId,
        documentType: params.documentType,
        message: params.message
      });
    } else {
      throw new Error('Invalid sending method');
    }
  };

  return {
    sendEmail,
    sendSMS,
    sendDocument,
    isLoading,
    isProcessing
  };
}
