import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkPurchaseRequest {
  // Accept both string array (from AdminPhonePoolManager) or object array
  phoneNumbers: Array<string | { phoneNumber: string; telnyxId?: string }>;
  adminUserId?: string;
}

// Convert phone number to E.164 format (+1XXXXXXXXXX)
function toE164(phoneNumber: string): string {
  if (!phoneNumber) return '';

  if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
    return phoneNumber;
  }

  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  if (cleaned.length > 11) {
    return `+${cleaned}`;
  }

  return phoneNumber;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    const telnyxMessagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID') || '400197fa-ac3b-4052-8c14-6da54bf7e800';
    const telnyxConnectionId = Deno.env.get('TELNYX_CONNECTION_ID') || '2709100729850660858';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (you may want to implement proper admin check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // For now, allow any authenticated user (you should add proper admin check)
    // if (profile?.role !== 'admin') {
    //   return new Response(
    //     JSON.stringify({ success: false, error: 'Admin access required' }),
    //     { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    //   );
    // }

    const request: BulkPurchaseRequest = await req.json();
    console.log('Bulk purchase request:', request);

    if (!request.phoneNumbers || request.phoneNumbers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No phone numbers provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Array<{
      phoneNumber: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const item of request.phoneNumbers) {
      // Handle both string and object inputs
      const phoneNumber = toE164(typeof item === 'string' ? item : item.phoneNumber);
      const telnyxId = typeof item === 'string' ? null : item.telnyxId;

      try {
        // Purchase from Telnyx if telnyxId is provided
        if (telnyxId) {
          console.log('Purchasing from Telnyx:', phoneNumber);

          const orderResponse = await fetch(
            'https://api.telnyx.com/v2/number_orders',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${telnyxApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phone_numbers: [{ phone_number: phoneNumber }],
                messaging_profile_id: telnyxMessagingProfileId,
                connection_id: telnyxConnectionId
              })
            }
          );

          if (!orderResponse.ok) {
            const error = await orderResponse.json();
            console.error('Telnyx purchase error:', error);
            results.push({
              phoneNumber,
              success: false,
              error: error.errors?.[0]?.detail || 'Failed to purchase from Telnyx'
            });
            continue;
          }
        }

        // Add to pool (available, no organization)
        const { error: insertError } = await supabase
          .from('phone_numbers')
          .upsert({
            phone_number: phoneNumber,
            friendly_name: 'Pool Number',
            status: 'available',
            pool_status: 'available',
            is_admin_purchased: true,
            is_primary: false,
            is_active: true,
            ai_dispatcher_enabled: false,
            capabilities: {
              sms: true,
              voice: true,
              mms: true
            },
            phone_number_type: 'local',
            price: 0,
            monthly_price: 0,
            country_code: 'US',
            telnyx_id: telnyxId || null,
            user_id: null,
            organization_id: null,
            purchased_by: user.id,
            purchased_at: new Date().toISOString(),
            metadata: {
              messaging_profile_id: telnyxMessagingProfileId,
              connection_id: telnyxConnectionId,
              bulk_purchase: true,
              purchased_by_admin: user.id
            }
          }, {
            onConflict: 'phone_number'
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          results.push({
            phoneNumber,
            success: false,
            error: insertError.message
          });
        } else {
          results.push({
            phoneNumber,
            success: true
          });
        }
      } catch (err) {
        console.error('Error processing number:', phoneNumber, err);
        results.push({
          phoneNumber,
          success: false,
          error: err.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    // Log the bulk purchase
    await supabase
      .from('communication_logs')
      .insert({
        user_id: user.id,
        type: 'system',
        direction: 'internal',
        status: 'completed',
        content: `Admin bulk purchased ${successCount} phone numbers to pool (${failCount} failed)`,
        metadata: {
          action: 'bulk_purchase',
          results,
          total: request.phoneNumbers.length,
          success_count: successCount,
          fail_count: failCount
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Purchased ${successCount} numbers to pool`,
        results,
        summary: {
          total: request.phoneNumbers.length,
          success: successCount,
          failed: failCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk purchase:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
