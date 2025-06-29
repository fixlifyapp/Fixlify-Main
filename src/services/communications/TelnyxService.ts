import { supabase } from '@/integrations/supabase/client';

interface SMSMessage {
  to: string;
  message: string;
  from?: string;
  mediaUrls?: string[];
  webhookUrl?: string;
}

interface VoiceCall {
  to: string;
  from?: string;
  answeredByMachineDetection?: boolean;
  machineDetectionWebhookUrl?: string;
}

export class TelnyxService {
  private apiKey: string;
  private baseUrl = 'https://api.telnyx.com/v2';
  private defaultFromNumber: string;
  private connectionId: string;
  private initialized = false;

  constructor() {
    // Delay initialization
  }

  private initialize() {
    if (this.initialized) return;
    
    this.apiKey = import.meta.env.VITE_TELNYX_API_KEY || '';
    this.defaultFromNumber = import.meta.env.VITE_TELNYX_DEFAULT_FROM_NUMBER || '';
    this.connectionId = import.meta.env.VITE_TELNYX_CONNECTION_ID || '';
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

  // SMS Functions
  async sendSMS({ to, message, from, mediaUrls, webhookUrl }: SMSMessage) {
    this.initialize();
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          from: from || this.defaultFromNumber,
          to: this.formatPhoneNumber(to),
          text: message,
          media_urls: mediaUrls,
          webhook_url: webhookUrl || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telnyx-status-webhook`,
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
        from: from || this.defaultFromNumber,
        content: message,
        status: 'sent',
        externalId: data.data.id
      });

      return data.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendBulkSMS(recipients: Array<{ to: string; message: string; variables?: Record<string, string> }>) {
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        this.sendSMS({
          to: recipient.to,
          message: this.interpolateVariables(recipient.message, recipient.variables || {})
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
  async makeCall({ to, from, answeredByMachineDetection, machineDetectionWebhookUrl }: VoiceCall) {
    this.initialize();
    try {
      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          connection_id: this.connectionId,
          to: this.formatPhoneNumber(to),
          from: from || this.defaultFromNumber,
          answering_machine_detection: answeredByMachineDetection ? 'detect' : 'disabled',
          webhook_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telnyx-voice-webhook`,
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
        from: from || this.defaultFromNumber,
        status: 'initiated',
        externalId: data.data.call_control_id
      });

      return data.data;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
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
  }) {
    const { data: profile } = await supabase.auth.getUser();
    
    await supabase.from('communication_logs').insert({
      organization_id: profile?.user?.user_metadata?.organization_id,
      type: data.type,
      direction: data.direction,
      to_number: data.to,
      from_number: data.from,
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
        error_details: error,
        updated_at: new Date().toISOString()
      })
      .eq('external_id', externalId);
  }
}

// Export singleton instance
export const telnyxService = new TelnyxService();
