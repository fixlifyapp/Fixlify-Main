import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentSendParams, DocumentSendResult } from "@/types/documents";

export const useDocumentSending = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendDocument = async (params: DocumentSendParams): Promise<DocumentSendResult> => {
    const {
      documentType,
      documentId,
      sendMethod,
      sendTo,
      customMessage,
      contactInfo
    } = params;

    setIsProcessing(true);

    try {
      console.log(`🚀 Processing ${documentType} send via ${sendMethod}...`);
      console.log(`📄 Document ID: ${documentId}`);
      console.log(`📧 Send to: ${sendTo}`);
      console.log(`💬 Custom message: ${customMessage ? 'Yes' : 'No'}`);

      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from(documentType === 'estimate' ? 'estimates' : 'invoices')
        .select('*, jobs(*)')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        console.error('Document fetch error:', fetchError);
        throw new Error(`${documentType} not found`);
      }

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use unified edge functions
      const functionName = sendMethod === 'sms' ? 'telnyx-sms' : 'mailgun-email';

      console.log(`📡 Calling unified edge function: ${functionName}`);

      // Call the unified edge function
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          documentType,
          documentId,
          sendToClient: true,
          customMessage: customMessage
        }
      });

      if (error) {
        console.error(`❌ Edge function error:`, error);
        throw error;
      }

      console.log(`✅ ${documentType} sent successfully!`, data);

      // Generate portal URL for reference
      const portalUrl = `${window.location.origin}/${documentType}/${documentId}`;
      
      // Copy portal link to clipboard
      try {
        await navigator.clipboard.writeText(portalUrl);
      } catch (err) {
        console.error('Clipboard error:', err);
      }

      // Show success message
      const successTitle = documentType === "estimate" ? "Estimate sent successfully!" : "Invoice sent successfully!";
      const methodText = sendMethod === 'sms' ? 'SMS' : 'Email';
      
      let description = `✅ ${methodText} sent to ${sendTo}\n📋 Portal link copied to clipboard!`;
      if (customMessage) {
        description += '\n💬 Included your custom message';
      }
      
      toast.success(successTitle, {
        description: description,
        duration: 5000
      });
      
      return { success: true };

    } catch (error: any) {
      console.error(`❌ Failed to send ${documentType}:`, error);
      
      let userMessage = error.message;
      
      // Handle specific error cases
      if (error.message?.includes('MAILGUN_API_KEY')) {
        userMessage = 'Email service is not configured. Please check Mailgun settings.';
      } else if (error.message?.includes('TELNYX_API_KEY')) {
        userMessage = 'SMS service is not configured. Please check Telnyx settings.';
      } else if (error.message?.includes('client_id')) {
        userMessage = `Database schema issue. Please contact support.`;
      } else if (error.message?.includes('not found')) {
        userMessage = 'Client contact information not found.';
      }
      
      const errorTitle = `Failed to send ${documentType}`;
      toast.error(errorTitle, {
        description: userMessage
      });
      
      return { 
        success: false, 
        error: userMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendDocument,
    isProcessing
  };
};