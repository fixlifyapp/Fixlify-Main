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

      // First, let's try to get the document details
      const { data: document, error: fetchError } = await supabase
        .from(documentType === 'estimate' ? 'estimates' : 'invoices')
        .select('*, jobs(*, clients(*))')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error(`${documentType} not found`);
      }

      let response;
      
      if (sendMethod === "email") {
        // Try different function names for backward compatibility
        const functionNames = [
          documentType === "estimate" ? "send-estimate" : "send-invoice",
          "mailgun-email",
          "send-email"
        ];
        
        let lastError = null;
        
        for (const functionName of functionNames) {
          console.log(`📧 Trying ${functionName} function...`);
          
          try {
            response = await supabase.functions.invoke(functionName, {
              body: {
                [`${documentType}Id`]: documentId,
                recipientEmail: sendTo,
                customMessage: customMessage || undefined,
                // Also try alternative parameter names
                to: sendTo,
                subject: `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} #${document[`${documentType}_number`]}`,
                html: customMessage || `Please find your ${documentType} attached.`,
                text: customMessage || `Please find your ${documentType} attached.`
              }
            });
            
            // If we get a response (even with error), check if it's not a 404
            if (response && (!response.error || !response.error.message?.includes('404'))) {
              console.log(`✅ Function ${functionName} responded`);
              break;
            }
          } catch (err) {
            lastError = err;
            console.log(`❌ Function ${functionName} failed, trying next...`);
          }
        }
        
        if (!response) {
          throw lastError || new Error('No email function available');
        }
      } else {
        // SMS sending - try different function names
        const functionNames = [
          documentType === "estimate" ? "send-estimate-sms" : "send-invoice-sms",
          "telnyx-sms",
          "send-sms"
        ];
        
        let lastError = null;
        
        for (const functionName of functionNames) {
          console.log(`📱 Trying ${functionName} function...`);
          
          try {
            const smsBody = {
              [`${documentType}Id`]: documentId,
              recipientPhone: sendTo,
              message: customMessage || undefined,
              // Alternative parameter names
              to: sendTo,
              text: customMessage || `Your ${documentType} #${document[`${documentType}_number`]} is ready. Total: $${document.total}`,
              // Include user ID for phone number lookup
              userId: (await supabase.auth.getUser()).data.user?.id
            };
            
            response = await supabase.functions.invoke(functionName, {
              body: smsBody
            });
            
            // If we get a response (even with error), check if it's not a 404
            if (response && (!response.error || !response.error.message?.includes('404'))) {
              console.log(`✅ Function ${functionName} responded`);
              break;
            }
          } catch (err) {
            lastError = err;
            console.log(`❌ Function ${functionName} failed, trying next...`);
          }
        }
        
        if (!response) {
          throw lastError || new Error('No SMS function available');
        }
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
        } else if (response.error.message?.includes('404')) {
          errorMessage = 'Send function not available. Please contact support.';
        }
        
        throw new Error(errorMessage);
      }

      // Check for success in different response formats
      const isSuccess = response.data?.success || 
                       response.data?.message?.includes('success') ||
                       response.data?.id; // Mailgun returns an ID

      if (!isSuccess && response.data?.error) {
        console.error(`❌ ${documentType} sending failed:`, response.data);
        const errorMessage = response.data?.error || `Failed to send ${documentType}`;
        throw new Error(errorMessage);
      }

      console.log(`✅ ${documentType} sent successfully via ${sendMethod}`);
      
      // Update the document status to 'sent'
      await supabase
        .from(documentType === 'estimate' ? 'estimates' : 'invoices')
        .update({ status: 'sent' })
        .eq('id', documentId);
      
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
      } else if (error.message?.includes('404')) {
        userMessage = `${sendMethod === 'email' ? 'Email' : 'SMS'} service not found. Please contact support.`;
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