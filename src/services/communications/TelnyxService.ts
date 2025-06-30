import { supabase } from '@/integrations/supabase/client';
import { TELNYX_CONFIG } from '@/config/telnyx';

interface SMSMessage {
  to: string;
  message: string;
  from?: string;
  userId?: string;
  mediaUrls?: string[];
  webhookUrl?: string;
}

interface VoiceCall {
  to: string;
  from?: string;
  userId?: string;
  answeredByMachineDetection?: boolean;
  machineDetectionWebhookUrl?: string;
}

export class TelnyxService {
  private apiKey: string;
  private baseUrl = 'https://api.telnyx.com/v2';
  private connectionId: string;
  private initialized = false;

  constructor() {
    // Delay initialization
  }

  private initialize() {
    if (this.initialized) return;
    
    this.apiKey = TELNYX_CONFIG.API_KEY;
    this.connectionId = TELNYX_CONFIG.CONNECTION_ID;
    this.initialized = true;
  }

  private getHeaders() {
    this.initialize();
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Get user's phone number
  private async getUserPhoneNumber(userId?: string): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required to send messages');
    }

    const { data, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new Error('No active phone number found. Please purchase a phone number first.');
    }

    return data.phone_number;
  }

  // SMS Functions
  async sendSMS({ to, message, from, userId, mediaUrls, webhookUrl }: SMSMessage) {
    this.initialize();
    try {
      // Get the from number - either provided or user's number
      const fromNumber = from || await this.getUserPhoneNumber(userId);

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          from: fromNumber,
          to: this.formatPhoneNumber(to),
          text: message,
          media_urls: mediaUrls,
          webhook_url: webhookUrl || `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/telnyx-status-webhook`,
          use_profile_webhooks: false,
          type: 'SMS'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to send SMS');
      }

      const data = await response.json();
      
      // Log to database for tracking
      await this.logCommunication({
        type: 'sms',
        direction: 'outbound',
        to,
        from: fromNumber,
        content: message,
        status: 'sent',
        externalId: data.data.id,
        userId
      });

      return data.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
  async sendBulkSMS(recipients: Array<{ to: string; message: string; variables?: Record<string, string> }>, userId?: string) {
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        this.sendSMS({
          to: recipient.to,
          message: this.interpolateVariables(recipient.message, recipient.variables || {}),
          userId
        })
      )
    );

    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  // Voice Functions
  async makeCall({ to, from, userId, answeredByMachineDetection, machineDetectionWebhookUrl }: VoiceCall) {
    this.initialize();
    try {
      // Get the from number - either provided or user's number
      const fromNumber = from || await this.getUserPhoneNumber(userId);

      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          connection_id: this.connectionId,
          to: this.formatPhoneNumber(to),
          from: fromNumber,
          answering_machine_detection: answeredByMachineDetection ? 'detect' : 'disabled',
          webhook_url: `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/telnyx-voice-webhook`,
          webhook_url_method: 'POST'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to make call');
      }

      const data = await response.json();
      
      await this.logCommunication({
        type: 'voice',
        direction: 'outbound',
        to,
        from: fromNumber,
        status: 'initiated',
        externalId: data.data.call_control_id,
        userId
      });

      return data.data;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  // Phone Number Management
  async searchAvailableNumbers(params: {
    areaCode?: string;
    locality?: string;
    country?: string;
    numberType?: 'local' | 'toll-free' | 'mobile';
  }) {
    this.initialize();
    try {
      const queryParams = new URLSearchParams({
        'filter[country_iso]': params.country || 'US',
        'filter[number_type]': params.numberType || 'local',
        'filter[features]': 'sms,voice',
        'filter[limit]': '20'
      });

      if (params.areaCode) {
        queryParams.append('filter[area_code]', params.areaCode);
      }
      if (params.locality) {
        queryParams.append('filter[locality]', params.locality);
      }

      const response = await fetch(`${this.baseUrl}/available_phone_numbers?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to search numbers');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error searching numbers:', error);
      throw error;
    }
  }

  async purchasePhoneNumber(phoneNumber: string, userId: string) {
    this.initialize();
    try {
      // First, create a number order
      const response = await fetch(`${this.baseUrl}/number_orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone_numbers: [{ phone_number: phoneNumber }],
          connection_id: this.connectionId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to purchase number');
      }

      const data = await response.json();
      const orderId = data.data.id;

      // Store in database
      const { error: dbError } = await supabase
        .from('telnyx_phone_numbers')
        .insert({
          user_id: userId,
          phone_number: phoneNumber,
          order_id: orderId,
          status: 'active',
          connection_id: this.connectionId,
          country_code: 'US',
          area_code: phoneNumber.substring(2, 5),
          webhook_url: `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/telnyx-webhook-router`,
          purchased_at: new Date().toISOString(),
          configured_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error storing phone number:', dbError);
        throw dbError;
      }

      // Configure webhooks for the number
      await this.configurePhoneNumber(phoneNumber);

      return data.data;
    } catch (error) {
      console.error('Error purchasing number:', error);
      throw error;
    }
  }
  async configurePhoneNumber(phoneNumber: string) {
    try {
      // Configure messaging for the number
      await fetch(`${this.baseUrl}/phone_numbers/${phoneNumber}/messaging`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          messaging_profile_id: null, // Use default
          webhook_url: `${TELNYX_CONFIG.WEBHOOK_BASE_URL}/functions/v1/sms-receiver`
        })
      });

      // Configure voice for the number
      await fetch(`${this.baseUrl}/phone_numbers/${phoneNumber}/voice`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          connection_id: this.connectionId
        })
      });
    } catch (error) {
      console.error('Error configuring phone number:', error);
      // Don't throw - number is still purchased
    }
  }

  // Utility Functions
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add +1 if not present for US numbers
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }

  private interpolateVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private async logCommunication(data: {
    type: 'sms' | 'voice' | 'email';
    direction: 'inbound' | 'outbound';
    to: string;
    from: string;
    content?: string;
    status: string;
    externalId?: string;
    userId?: string;
  }) {
    const { data: profile } = await supabase.auth.getUser();
    
    await supabase.from('communication_logs').insert({
      user_id: data.userId || profile?.user?.id,
      type: data.type,
      direction: data.direction,
      to_address: data.to,
      from_address: data.from,
      recipient: data.to,
      content: data.content,
      status: data.status,
      external_id: data.externalId,
      provider: 'telnyx',
      created_at: new Date().toISOString()
    });
  }

  // Webhook Handlers
  async handleStatusWebhook(payload: any) {
    const { data } = payload;
    
    switch (data.event_type) {
      case 'message.sent':
        await this.updateMessageStatus(data.payload.id, 'sent');
        break;
      case 'message.delivered':
        await this.updateMessageStatus(data.payload.id, 'delivered');
        break;
      case 'message.failed':
        await this.updateMessageStatus(data.payload.id, 'failed', data.payload.errors);
        break;
    }
  }

  private async updateMessageStatus(externalId: string, status: string, error?: any) {
    await supabase
      .from('communication_logs')
      .update({ 
        status, 
        error_message: error?.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('external_id', externalId);
  }
}

// Export singleton instance
export const telnyxService = new TelnyxService();