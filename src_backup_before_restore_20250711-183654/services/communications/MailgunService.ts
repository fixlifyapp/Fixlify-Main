import { supabase } from '@/integrations/supabase/client';

export class MailgunService {
  async sendEmail(to: string, subject: string, content: string, userId: string, metadata?: any) {
    try {
      // For now, we'll use the Supabase edge function for email sending
      // This is a placeholder that would call the email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          content,
          userId,
          metadata
        }
      });

      if (error) {
        // If the edge function doesn't exist yet, log but don't fail
        console.warn('Email edge function not implemented yet');
        return {
          success: false,
          message: 'Email functionality coming soon'
        };
      }
      
      return {
        success: true,
        messageId: data?.messageId,
        logId: data?.logId
      };
    } catch (error) {
      console.error('MailgunService: Error sending email:', error);
      // Don't throw - email is not critical yet
      return {
        success: false,
        message: 'Email service temporarily unavailable'
      };
    }
  }
}