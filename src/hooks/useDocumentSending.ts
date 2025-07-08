
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SendEmailParams {
  recipientEmail: string;
  subject: string;
  content: string;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  jobId: string;
}

export interface SendSMSParams {
  recipientPhone: string;
  message: string;
  documentId: string;
  documentType: 'estimate' | 'invoice';
  jobId: string;
}

export interface SendDocumentParams {
  documentId: string;
  documentType: 'estimate' | 'invoice';
  method: 'email' | 'sms';
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content?: string;
  message?: string;
  jobId: string;
}

export const useDocumentSending = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendEmail = async (params: SendEmailParams) => {
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      console.log('📧 Sending email with params:', params);
      
      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: {
          estimateId: params.documentId,
          recipientEmail: params.recipientEmail,
          subject: params.subject,
          content: params.content,
          documentType: params.documentType,
          jobId: params.jobId
        }
      });

      if (error) {
        console.error('❌ Email sending error:', error);
        throw error;
      }

      console.log('✅ Email sent successfully:', data);
      toast.success('Email sent successfully!');
      return data;
    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      toast.error(`Failed to send email: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const sendSMS = async (params: SendSMSParams) => {
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      console.log('📱 Sending SMS with params:', params);
      
      const { data, error } = await supabase.functions.invoke('send-estimate-sms', {
        body: {
          estimateId: params.documentId,
          recipientPhone: params.recipientPhone,
          message: params.message,
          documentType: params.documentType,
          jobId: params.jobId
        }
      });

      if (error) {
        console.error('❌ SMS sending error:', error);
        throw error;
      }

      console.log('✅ SMS sent successfully:', data);
      toast.success('SMS sent successfully!');
      return data;
    } catch (error: any) {
      console.error('❌ SMS sending failed:', error);
      toast.error(`Failed to send SMS: ${error.message}`);
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
      return await sendEmail({
        recipientEmail: params.recipientEmail,
        subject: params.subject || `Your ${params.documentType}`,
        content: params.content || `Please find your ${params.documentType} attached.`,
        documentId: params.documentId,
        documentType: params.documentType,
        jobId: params.jobId
      });
    } else if (params.method === 'sms') {
      if (!params.recipientPhone) {
        throw new Error('Recipient phone is required for SMS sending');
      }
      return await sendSMS({
        recipientPhone: params.recipientPhone,
        message: params.message || `Your ${params.documentType} is ready. Please check your email or contact us for details.`,
        documentId: params.documentId,
        documentType: params.documentType,
        jobId: params.jobId
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
};
