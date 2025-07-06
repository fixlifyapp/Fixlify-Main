
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
      console.log(`🚀 Sending ${documentType} via ${sendMethod}...`);
      console.log(`📄 Document ID: ${documentId}`);
      console.log(`📧 Send to: ${sendTo}`);
      console.log(`💬 Custom message: ${customMessage ? 'Yes' : 'No'}`);

      let response;
      
      if (sendMethod === "email") {
        // Call email sending edge function
        const functionName = documentType === "estimate" ? "send-estimate" : "send-invoice";
        
        console.log(`📧 Calling ${functionName} function...`);
        response = await supabase.functions.invoke(functionName, {
          body: {
            [`${documentType}Id`]: documentId,
            recipientEmail: sendTo,
            customMessage: customMessage || undefined
          }
        });
      } else {
        // SMS sending is not available
        throw new Error('SMS sending is not available');
      }

      console.log(`📤 Edge function response:`, { 
        error: response.error, 
        dataSuccess: response.data?.success,
        dataError: response.data?.error 
      });

      if (response.error) {
        console.error(`❌ Supabase function error:`, response.error);
        
        // Handle specific Supabase errors
        let errorMessage = response.error.message || `Failed to send ${documentType}`;
        
        if (response.error.message?.includes('JWT')) {
          errorMessage = 'Session expired. Please refresh the page and try again.';
        } else if (response.error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!response.data?.success) {
        console.error(`❌ ${documentType} sending failed:`, response.data);
        const errorMessage = response.data?.error || `Failed to send ${documentType}`;
        throw new Error(errorMessage);
      }

      console.log(`✅ ${documentType} sent successfully via ${sendMethod}`);
      
      const methodText = sendMethod === "email" ? "email" : "SMS";
      const docText = documentType === "estimate" ? "Estimate" : "Invoice";
      
      toast.success(`${docText} sent via ${methodText} successfully!`);
      
      return { success: true };

    } catch (error: any) {
      console.error(`❌ Failed to send ${documentType}:`, error);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      
      if (error.message?.includes('not configured')) {
        userMessage = `${sendMethod === 'email' ? 'Email' : 'SMS'} service is not configured. Please contact support.`;
      } else if (error.message?.includes('Invalid') && error.message?.includes('phone')) {
        userMessage = 'Please enter a valid phone number (e.g., +1234567890 or (555) 123-4567).';
      } else if (error.message?.includes('Invalid') && error.message?.includes('email')) {
        userMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('authentication failed')) {
        userMessage = 'Service authentication failed. Please contact support.';
      } else if (error.message?.includes('temporarily unavailable')) {
        userMessage = `${sendMethod === 'email' ? 'Email' : 'SMS'} service is temporarily unavailable. Please try again in a few minutes.`;
      } else if (!error.message || error.message === 'Failed to send document') {
        userMessage = `Unable to send ${documentType}. Please try again or contact support.`;
      }
      
      toast.error(userMessage);
      
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
