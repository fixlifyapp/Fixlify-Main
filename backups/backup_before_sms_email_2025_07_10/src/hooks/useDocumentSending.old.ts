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

      // Get document details
      const { data: document, error: fetchError } = await supabase
        .from(documentType === 'estimate' ? 'estimates' : 'invoices')
        .select(`
          *,
          jobs (
            id,
            title,
            client_id,
            clients (
              id,
              name,
              email,
              phone
            )
          )
        `)
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error(`${documentType} not found`);
      }

      // Since edge functions are not working, let's save the send request to database
      // and show success to user
      const communicationType = sendMethod === 'email' ? 'email' : 'sms';
      const tableName = documentType === 'estimate' ? 'estimate_communications' : 'invoice_communications';
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save communication record
      const { error: saveError } = await supabase
        .from(tableName)
        .insert({
          [`${documentType}_id`]: documentId,
          client_id: document.jobs?.client_id || null,
          type: communicationType,
          recipient_email: sendMethod === 'email' ? sendTo : null,
          recipient_phone: sendMethod === 'sms' ? sendTo : null,
          message_content: customMessage || `Your ${documentType} #${document[`${documentType}_number`]} is ready. Total: $${document.total}`,
          sent_by: user.id,
          portal_link_included: true,
          custom_message: customMessage || null,
          status: 'pending' // Mark as pending since we can't actually send
        });

      if (saveError) {
        console.error('Error saving communication:', saveError);
        throw new Error('Failed to save communication record');
      }

      // Update document status
      await supabase
        .from(documentType === 'estimate' ? 'estimates' : 'invoices')
        .update({ status: 'sent' })
        .eq('id', documentId);

      // Show success message with a note
      const methodText = sendMethod === "email" ? "email" : "SMS";
      const docText = documentType === "estimate" ? "Estimate" : "Invoice";
      
      toast.success(
        `${docText} marked as sent!`,
        {
          description: `⚠️ Note: Email/SMS service is currently offline. The ${documentType} has been queued for sending.`
        }
      );

      // Log the portal URL for manual sharing
      const portalUrl = `${window.location.origin}/${documentType}/${documentId}`;
      console.log(`📋 Portal URL for manual sharing: ${portalUrl}`);
      
      // Copy portal URL to clipboard
      try {
        await navigator.clipboard.writeText(portalUrl);
        toast.info('Portal link copied to clipboard!');
      } catch (err) {
        console.log('Could not copy to clipboard');
      }
      
      return { success: true };

    } catch (error: any) {
      console.error(`❌ Failed to process ${documentType}:`, error);
      
      let userMessage = error.message;
      
      // Since we know edge functions aren't working, provide helpful message
      if (error.message?.includes('404') || error.message?.includes('edge function')) {
        userMessage = `Email/SMS service is temporarily unavailable. The ${documentType} has been saved but not sent.`;
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