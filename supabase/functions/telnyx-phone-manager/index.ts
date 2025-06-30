
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const requestBody = await req.json()
    const { action } = requestBody;

    // Use environment variables
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const connectionId = Deno.env.get('TELNYX_CONNECTION_ID');

    if (!telnyxApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'TELNYX_API_KEY not configured in Supabase secrets'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing action: ${action}`)

    switch (action) {
      case 'sync_telnyx_numbers': {
        console.log('🔄 Syncing numbers from Telnyx account...');

        try {
          // Get all phone numbers from your Telnyx account
          const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Telnyx API error:', errorText);
            throw new Error(`Telnyx API error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          const telnyxNumbers = result.data || [];
          
          console.log(`Found ${telnyxNumbers.length} numbers in Telnyx account`);

          // Get existing numbers from database
          const { data: existingNumbers, error: dbError } = await supabaseAdmin
            .from('telnyx_phone_numbers')
            .select('phone_number');
          
          if (dbError) {
            console.error('Database error:', dbError);
            throw dbError;
          }
          
          const existingPhoneNumbers = new Set(existingNumbers?.map(n => n.phone_number) || []);

          // Import new numbers
          const numbersToImport = telnyxNumbers.filter(n => 
            !existingPhoneNumbers.has(n.phone_number)
          );

          console.log(`Need to import ${numbersToImport.length} new numbers`);

          if (numbersToImport.length > 0) {
            const recordsToInsert = numbersToImport.map(number => ({
              phone_number: number.phone_number,
              telnyx_phone_number_id: number.id,
              status: 'available',
              connection_id: number.connection_id || connectionId,
              area_code: number.phone_number.substring(2, 5),
              country_code: 'US',
              features: ['sms', 'voice', 'mms'],
              purchased_at: number.created_at || new Date().toISOString(),
              webhook_url: number.messaging?.webhook_url,
              messaging_profile_id: number.messaging?.messaging_profile_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));

            const { error: insertError } = await supabaseAdmin
              .from('telnyx_phone_numbers')
              .insert(recordsToInsert);

            if (insertError) {
              console.error('Insert error:', insertError);
              throw insertError;
            }
          }

          return new Response(
            JSON.stringify({ 
              success: true,
              synced: numbersToImport.length,
              total: telnyxNumbers.length,
              numbers: telnyxNumbers.map(n => ({
                phone_number: n.phone_number,
                status: n.status
              })),
              message: `Successfully synced ${numbersToImport.length} new numbers from Telnyx`
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Sync error:', error);
          throw error;
        }
      }

      case 'search_available_numbers': {
        const { area_code, locality, country = 'US' } = requestBody;

        // Build query parameters
        const params = new URLSearchParams({
          'filter[country_iso]': country,
          'filter[features]': 'sms,voice',
          'filter[limit]': '20'
        });

        if (area_code) {
          params.append('filter[area_code]', area_code);
        }
        if (locality) {
          params.append('filter[locality]', locality);
        }

        // Search Telnyx available numbers
        const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${params}`, {
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Telnyx API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        return new Response(
          JSON.stringify({ 
            success: true,
            numbers: result.data || [],
            total: result.data?.length || 0
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'purchase_number': {
        const { phone_number, user_id } = requestBody;

        if (!user_id) {
          throw new Error('User ID is required to purchase a number');
        }

        // Create number order in Telnyx
        const orderResponse = await fetch('https://api.telnyx.com/v2/number_orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone_numbers: [{ phone_number }]
          })
        });

        if (!orderResponse.ok) {
          const error = await orderResponse.json();
          throw new Error(error.errors?.[0]?.detail || 'Failed to purchase number');
        }

        const orderData = await orderResponse.json();
        
        // Configure the number for SMS and Voice
        if (connectionId) {
          await fetch(`https://api.telnyx.com/v2/phone_numbers/${phone_number}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              connection_id: connectionId,
              webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/telnyx-webhook-router`
            })
          });
        }

        // Store in database and assign to user
        const { error: dbError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .insert({
            phone_number: phone_number,
            user_id: user_id,
            status: 'active',
            telnyx_phone_number_id: orderData.data.phone_numbers?.[0]?.id,
            area_code: phone_number.substring(2, 5),
            country_code: 'US',
            connection_id: connectionId,
            features: ['sms', 'voice', 'mms'],
            purchased_at: new Date().toISOString(),
            configured_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            order: orderData.data,
            message: 'Phone number purchased successfully'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
