// Update SMS functions to include portal URLs

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { estimate_id, phone_number, message } = await req.json();
    console.log('Sending estimate SMS:', { estimate_id, phone_number });

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*, jobs(client_id, clients(name, email, phone))')
      .eq('id', estimate_id)
      .single();

    if (estimateError || !estimate) {
      console.error('Error fetching estimate:', estimateError);
      throw new Error('Estimate not found');
    }

    // Generate or use existing portal access token
    let portalToken = estimate.portal_access_token;
    if (!portalToken) {
      portalToken = generateToken();
      // Update estimate with new token
      await supabase
        .from('estimates')
        .update({ portal_access_token: portalToken })
        .eq('id', estimate_id);
    }

    const telnyx_api_key = Deno.env.get('TELNYX_API_KEY');
    const telnyx_from_number = Deno.env.get('TELNYX_FROM_NUMBER');

    if (!telnyx_api_key || !telnyx_from_number) {
      throw new Error('Telnyx configuration missing');
    }

    // Generate portal URL
    const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://hub.fixlify.app';
    const portalUrl = `${baseUrl}/portal/estimate/${portalToken}`;

    // Create SMS content with portal link
    const defaultMessage = `Your estimate ${estimate.estimate_number} for $${estimate.total} is ready. View it here: ${portalUrl}`;
    const sms_message = message || defaultMessage;

    // Send SMS via Telnyx
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyx_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: telnyx_from_number,
        to: phone_number || estimate.jobs?.clients?.phone || '',
        text: sms_message,
      }),
    });

    const result = await response.json();
    console.log('Telnyx response:', result);

    if (!response.ok) {
      throw new Error(`Telnyx error: ${result.errors?.[0]?.detail || 'Unknown error'}`);
    }

    // Log the communication
    await supabase.from('estimate_communications').insert({
      estimate_id: estimate.id,
      estimate_number: estimate.estimate_number,
      client_id: estimate.client_id,
      client_name: estimate.jobs?.clients?.name,
      client_email: estimate.jobs?.clients?.email,
      client_phone: phone_number || estimate.jobs?.clients?.phone,
      communication_type: 'sms',
      recipient: phone_number || estimate.jobs?.clients?.phone || '',
      subject: null,
      content: sms_message,
      status: 'sent',
      external_id: result.data?.id,
      provider_message_id: result.data?.id,
      portal_link_included: true,
      portal_link: portalUrl,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Estimate SMS sent successfully', 
        telnyx_id: result.data?.id,
        portal_url: portalUrl 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending estimate SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send estimate SMS' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});