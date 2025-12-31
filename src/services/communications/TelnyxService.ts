import { supabase } from '@/integrations/supabase/client';

export class TelnyxService {
  async sendSMS(to: string, message: string, userId: string, metadata?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
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
      // First get user's organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('TelnyxService: User must belong to an organization');
        return [];
      }

      // Get organization's phone numbers (not user_id - phones are org-scoped)
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('pool_status', 'assigned')
        .in('status', ['active', 'purchased'])
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('TelnyxService: Error fetching phone numbers:', error);
      throw error;
    }
  }
}