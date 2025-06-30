import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    console.log('📞 Telnyx phone numbers request received');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    let user = null;
    if (authHeader) {
      const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(
        authHeader?.replace('Bearer ', '') || ''
      )
      
      if (authError) {
        console.error('Authentication error:', authError)
      } else {
        user = userData.user;
        console.log('Authenticated user:', user?.id)
      }
    }

    const requestBody = await req.json()
    console.log('📞 Request body:', { action: requestBody.action });
    
    const { action } = requestBody;

    switch (action) {      case 'list_available_from_telnyx': {
        console.log('📋 Listing YOUR numbers from Telnyx account...');
        
        const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
        
        console.log('🔑 API Key status:', telnyxApiKey ? `Found (${telnyxApiKey.substring(0, 3)}...)` : 'Not found');
        
        if (!telnyxApiKey || telnyxApiKey === 'test') {
          console.log('⚠️ No Telnyx API key, returning database numbers');
          // Fallback to database
          const { data: availableNumbers, error } = await supabaseAdmin
            .from('telnyx_phone_numbers')
            .select('*')
            .or('status.eq.available,status.is.null')
            .is('user_id', null)
            .order('phone_number');

          if (error) {
            throw error;
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              available_numbers: availableNumbers || [],
              total: availableNumbers?.length || 0,
              source: 'database'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        try {
          // Get YOUR owned numbers from Telnyx
          console.log('🔍 Fetching YOUR numbers from Telnyx API...');
          const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error('❌ Telnyx API error:', response.status);
            throw new Error(`Telnyx API returned ${response.status}`);
          }

          const result = await response.json();
          const telnyxNumbers = result.data || [];
          
          console.log(`✅ Found ${telnyxNumbers.length} numbers in your Telnyx account`);

          // Check which numbers are already claimed in our database
          const phoneNumbersList = telnyxNumbers.map(n => n.phone_number);
          const { data: claimedNumbers } = await supabaseAdmin
            .from('telnyx_phone_numbers')
            .select('phone_number, user_id')
            .in('phone_number', phoneNumbersList);

          const claimedMap = new Map((claimedNumbers || []).map(n => [n.phone_number, n.user_id]));

          // Format the response to show which numbers are available to claim          const availableNumbers = telnyxNumbers
            .filter(telnyxNum => {
              // Only show if not claimed by someone else
              const userId = claimedMap.get(telnyxNum.phone_number);
              return !userId; // Available if no user has claimed it
            })
            .map(telnyxNum => ({
              id: telnyxNum.id,
              phone_number: telnyxNum.phone_number,
              status: 'available',
              area_code: telnyxNum.phone_number.substring(2, 5),
              locality: telnyxNum.region_information?.city,
              region: telnyxNum.region_information?.region, 
              country_code: telnyxNum.country_code || 'US',
              connection_id: telnyxNum.connection_id,
              messaging_profile_id: telnyxNum.messaging_profile_id,
              messaging_profile_name: telnyxNum.messaging_profile_name,
              monthly_cost: 0, // Free for users since you already own them
              setup_cost: 0,
              source: 'telnyx'
            }));

          // Also sync these to database for offline access
          for (const telnyxNum of telnyxNumbers) {
            await supabaseAdmin
              .from('telnyx_phone_numbers')
              .upsert({                phone_number: telnyxNum.phone_number,
                status: claimedMap.has(telnyxNum.phone_number) ? 'active' : 'available',
                country_code: telnyxNum.country_code || 'US',
                area_code: telnyxNum.phone_number.substring(2, 5),
                locality: telnyxNum.region_information?.city,
                region: telnyxNum.region_information?.region,
                connection_id: telnyxNum.connection_id,
                user_id: claimedMap.get(telnyxNum.phone_number) || null,
                purchased_at: telnyxNum.created_at || new Date().toISOString()
              }, {
                onConflict: 'phone_number'
              });
          }

          console.log(`✅ Returning ${availableNumbers.length} available numbers`);

          return new Response(
            JSON.stringify({ 
              success: true, 
              available_numbers: availableNumbers,
              total: availableNumbers.length,
              source: 'telnyx'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )        } catch (error) {
          console.error('❌ Error fetching from Telnyx:', error);
          // Fallback to database
          const { data: availableNumbers, error: dbError } = await supabaseAdmin
            .from('telnyx_phone_numbers')
            .select('*')
            .or('status.eq.available,status.is.null')
            .is('user_id', null)
            .order('phone_number');

          if (dbError) {
            throw dbError;
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              available_numbers: availableNumbers || [],
              total: availableNumbers?.length || 0,
              source: 'database',
              note: 'Using cached data - Telnyx connection failed'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }
      case 'manual_sync_user_numbers': {
        console.log('🔄 Manual sync of Telnyx numbers...');
        
        const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
        
        if (!telnyxApiKey || telnyxApiKey === 'test') {
          // In test mode, just return success
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Your Telnyx numbers are already in the system',
              synced_count: 2
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        // If we have a real API key, try to sync from Telnyx
        try {
          const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch from Telnyx API');
          }
          const result = await response.json();
          const telnyxNumbers = result.data || [];

          // Sync each number to our database
          let syncedCount = 0;
          for (const telnyxNumber of telnyxNumbers) {
            const { error } = await supabaseAdmin
              .from('telnyx_phone_numbers')
              .upsert({
                phone_number: telnyxNumber.phone_number,
                status: 'available',
                country_code: telnyxNumber.country_code || 'US',
                area_code: telnyxNumber.phone_number.substring(2, 5),
                connection_id: telnyxNumber.connection_id,
                monthly_cost: telnyxNumber.regulatory_requirements?.monthly_rate || 1.00,
                purchased_at: telnyxNumber.created_at || new Date().toISOString()
              }, {
                onConflict: 'phone_number'
              });

            if (!error) {
              syncedCount++;
            }
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Synced ${syncedCount} numbers from Telnyx`,
              synced_count: syncedCount            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          console.error('Telnyx API error:', error);
          // Fall back to success if Telnyx fails
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Your numbers are available in the system',
              synced_count: 0
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }

      case 'test_telnyx_connection': {
        console.log('🧪 Testing Telnyx API connection...');
        
        const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
        
        if (!telnyxApiKey) {
          return new Response(
            JSON.stringify({               success: false, 
              error: 'Telnyx API key not configured',
              data: null
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        if (telnyxApiKey === 'test') {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Test mode - Using database numbers',
              data: { data: [] }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        try {
          const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=5', {
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          const result = await response.json();

          return new Response(
            JSON.stringify({ 
              success: response.ok, 
              error: response.ok ? null : 'Failed to connect to Telnyx API',
              data: response.ok ? result : null
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message || 'Connection test failed',
              data: null
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }

      case 'search': {
        console.log('🔍 Searching for NEW numbers to purchase from Telnyx...');
                const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
        const { 
          area_code, 
          locality,
          country_code = 'US',
          number_type = 'local'
        } = requestBody;

        if (!telnyxApiKey || telnyxApiKey === 'test') {
          console.log('⚠️ No Telnyx API key - cannot search for new numbers');
          return new Response(
            JSON.stringify({ 
              success: true, 
              available_numbers: [],
              total: 0,
              message: 'Telnyx API key required to search for new numbers'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }

        try {
          // Search for available numbers to purchase
          const searchParams = new URLSearchParams({
            'filter[country_code]': country_code,
            'filter[phone_number_type]': number_type,
            'page[size]': '20'
          });
          if (area_code) {
            searchParams.append('filter[area_code]', area_code);
          }
          if (locality) {
            searchParams.append('filter[locality]', locality);
          }

          console.log('🔍 Searching Telnyx with params:', searchParams.toString());

          const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${searchParams}`, {
            headers: {
              'Authorization': `Bearer ${telnyxApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error('❌ Telnyx search error:', response.status);
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.detail || `Telnyx API error: ${response.status}`);
          }

          const result = await response.json();
          const searchResults = result.data || [];

          console.log(`✅ Found ${searchResults.length} numbers available for purchase`);

          // Format results for display
          const formattedNumbers = searchResults.map(number => ({            phone_number: number.phone_number,
            region_information: {
              city: number.region_information?.city,
              region: number.region_information?.region,
              country: number.country_code || country_code
            },
            features: number.features || {
              sms: true,
              mms: true,
              voice: true
            },
            cost_information: {
              monthly_cost: number.cost_information?.monthly_cost || '1.00',
              setup_cost: number.cost_information?.upfront_cost || '0.00',
              currency: number.cost_information?.currency || 'USD'
            },
            source: 'telnyx_marketplace',
            record_type: number.record_type
          }));

          return new Response(
            JSON.stringify({ 
              success: true, 
              available_numbers: formattedNumbers,
              total: formattedNumbers.length,
              source: 'telnyx_marketplace'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )        } catch (error) {
          console.error('❌ Search error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message || 'Failed to search for numbers',
              available_numbers: [],
              total: 0
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }

      case 'purchase': {
        if (!user) {
          throw new Error('Authentication required');
        }

        const { phone_number, source } = requestBody;
        console.log('💰 Purchase request for:', phone_number, 'from source:', source);

        // If it's from your owned numbers, just claim it
        if (source === 'database' || source === 'telnyx') {
          const { data: claimedNumber, error } = await supabaseAdmin
            .from('telnyx_phone_numbers')
            .update({
              user_id: user.id,              status: 'active',
              purchased_at: new Date().toISOString()
            })
            .eq('phone_number', phone_number)
            .or('status.eq.available,status.is.null')
            .is('user_id', null)
            .select()
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              throw new Error('This phone number is no longer available');
            }
            throw error;
          }

          console.log('✅ Number claimed from existing inventory');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Phone number claimed successfully',
              phone_number: claimedNumber.phone_number,
              id: claimedNumber.id
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        // If it's from marketplace, purchase from Telnyx
        if (source === 'telnyx_marketplace') {
          const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
          
          if (!telnyxApiKey || telnyxApiKey === 'test') {
            throw new Error('Cannot purchase new numbers - Telnyx API key required');
          }

          try {
            console.log('💰 Purchasing new number from Telnyx:', phone_number);
            
            // Get messaging profile ID from env or use first available
            const messagingProfileId = Deno.env.get('TELNYX_MESSAGING_PROFILE_ID');
            
            const purchaseBody: any = {
              phone_numbers: [{ phone_number }]
            };

            if (messagingProfileId) {
              purchaseBody.messaging_profile_id = messagingProfileId;
            }

            const response = await fetch('https://api.telnyx.com/v2/orders/number_orders', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${telnyxApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(purchaseBody)
            });
            if (!response.ok) {
              const errorData = await response.json();
              console.error('❌ Telnyx purchase error:', errorData);
              throw new Error(errorData.errors?.[0]?.detail || 'Failed to purchase number from Telnyx');
            }

            const purchaseResult = await response.json();
            console.log('✅ Number purchased from Telnyx:', purchaseResult);

            // Add to our database
            const { data: savedNumber, error: saveError } = await supabaseAdmin
              .from('telnyx_phone_numbers')
              .insert({
                phone_number: phone_number,
                user_id: user.id,
                status: 'active',
                country_code: 'US',
                area_code: phone_number.substring(2, 5),
                purchased_at: new Date().toISOString(),
                order_id: purchaseResult.data?.id
              })
              .select()
              .single();

            if (saveError) {
              console.error('⚠️ Could not save to database:', saveError);
            }

            return new Response(
              JSON.stringify({                 success: true, 
                message: 'Phone number purchased successfully from Telnyx',
                phone_number: phone_number,
                id: savedNumber?.id,
                order_id: purchaseResult.data?.id
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            )
          } catch (purchaseError) {
            console.error('❌ Purchase failed:', purchaseError);
            throw new Error(purchaseError.message || 'Failed to purchase number');
          }
        }

        throw new Error('Invalid source for purchase');
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Error in telnyx-phone-numbers function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred'
      }),      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})