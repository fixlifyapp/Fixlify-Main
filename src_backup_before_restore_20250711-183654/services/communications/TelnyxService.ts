import { supabase } from '@/integrations/supabase/client';

export class TelnyxService {
  async sendSMS(to: string, message: string, userId: string, metadata?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message,
          userId,
          metadata
        }
      });

      if (error) throw error;
      
      return {
        success: true,
        messageId: data.messageId,
        logId: data.logId
      };
    } catch (error) {
      console.error('TelnyxService: Error sending SMS:', error);
      throw error;
    }
  }

  async getPhoneNumbers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('TelnyxService: Error fetching phone numbers:', error);
      throw error;
    }
  }
}