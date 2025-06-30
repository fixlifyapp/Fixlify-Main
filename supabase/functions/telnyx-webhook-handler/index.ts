import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📞 Telnyx webhook received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get('telnyx-signature');
    const timestamp = req.headers.get('telnyx-timestamp');
    
    // Parse webhook payload
    const payload = await req.json();
    console.log('Webhook event type:', payload.data?.event_type);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Handle different event types
    const eventType = payload.data?.event_type;
    const eventData = payload.data?.payload;

    switch (eventType) {      // Phone number purchased/provisioned
      case 'phone_number.created':
      case 'phone_number.updated':
      case 'number_order.phone_numbers_created': {
        console.log('📱 Phone number event received');
        
        const phoneNumber = eventData?.phone_number || eventData?.phone_numbers?.[0]?.phone_number;
        if (!phoneNumber) {
          console.log('No phone number in payload');
          break;
        }

        // Add or update the phone number in database
        const { error } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .upsert({
            phone_number: phoneNumber,
            telnyx_phone_number_id: eventData.id,
            status: eventData.status || 'active',
            country_code: eventData.country_code || 'US',
            area_code: phoneNumber.substring(2, 5),
            region: eventData.region_information?.region,
            locality: eventData.region_information?.locality,
            connection_id: eventData.connection_id,
            messaging_profile_id: eventData.messaging_profile_id,
            features: eventData.features || ['sms', 'voice', 'mms'],
            purchased_at: eventData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'phone_number'
          });

        if (error) {
          console.error('Error upserting phone number:', error);
        } else {          console.log(`✅ Phone number ${phoneNumber} synced`);
        }
        break;
      }

      // Phone number deleted
      case 'phone_number.deleted': {
        console.log('🗑️ Phone number deletion event');
        
        const phoneNumber = eventData?.phone_number;
        if (!phoneNumber) break;

        // Mark as inactive or delete from database
        const { error } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .update({ 
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber)
          .is('user_id', null); // Only if not assigned to user

        if (error) {
          console.error('Error updating phone number:', error);
        } else {
          console.log(`✅ Phone number ${phoneNumber} marked as inactive`);
        }
        break;
      }

      // Phone number ported out
      case 'phone_number.ported_out': {
        console.log('📤 Phone number ported out');
                const phoneNumber = eventData?.phone_number;
        if (!phoneNumber) break;

        const { error } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .update({ 
            status: 'ported_out',
            updated_at: new Date().toISOString()
          })
          .eq('phone_number', phoneNumber);

        if (error) {
          console.error('Error updating ported number:', error);
        }
        break;
      }

      default:
        console.log(`Unknown event type: ${eventType}`);
    }

    // Always return 200 OK to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent retries
    return new Response(      JSON.stringify({ received: true, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
})