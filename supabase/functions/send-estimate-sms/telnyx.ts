
export interface TelnyxResponse {
  data: {
    id: string;
    record_type: string;
    direction: string;
    from: string;
    to: string;
    text: string;
    media: any[];
    webhook_url: string;
    webhook_failover_url: string;
    created_at: string;
    updated_at: string;
    encoding: string;
    parts: number;
    tags: string[];
    cost: {
      amount: string;
      currency: string;
    };
    completed_at: string;
    sent_at: string;
    received_at: string;
    messaging_profile_id: string;
    errors: any[];
    organization_id: string;
    phone_number_id: string;
    subject: string;
    media_urls: string[];
    delivery_status: string;
    webhook_event_type: string;
  };
}

export const sendSMSViaTelnyx = async (
  fromPhone: string,
  toPhone: string,
  message: string,
  telnyxApiKey: string
): Promise<TelnyxResponse> => {
  console.log('Sending SMS from:', fromPhone, 'to:', toPhone);
  console.log('SMS content:', message.substring(0, 100) + '...');

  const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
  
  const payload: any = {
    from: fromPhone,
    to: toPhone,
    text: message
  };

  // Add messaging profile ID if available
  if (messagingProfileId) {
    payload.messaging_profile_id = messagingProfileId;
  }

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telnyxApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Telnyx API error:', result);
    throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
  }

  console.log('SMS sent successfully:', result);
  return result;
};
