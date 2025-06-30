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
    console.log('🔄 Syncing Telnyx phone numbers...');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured');
    }

    // 1. Fetch all YOUR phone numbers from Telnyx
    console.log('📞 Fetching numbers from Telnyx...');
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers?page[size]=100', {
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Telnyx API error: ${response.status}`);
    }

    const telnyxData = await response.json();
    const telnyxNumbers = telnyxData.data || [];
    
    console.log(`✅ Found ${telnyxNumbers.length} numbers in your Telnyx account`);

    // 2. Get existing numbers from database
    const { data: dbNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id, status');

    const dbNumbersMap = new Map(
      dbNumbers?.map(n => [n.phone_number, n]) || []
    );

    // 3. Process each Telnyx number
    const updates = [];
    const inserts = [];

    for (const telnyxNumber of telnyxNumbers) {
      const phoneNumber = telnyxNumber.phone_number;
      const existingNumber = dbNumbersMap.get(phoneNumber);

      const numberData = {
        phone_number: phoneNumber,
        telnyx_phone_number_id: telnyxNumber.id,
        status: existingNumber?.user_id ? 'active' : 'available',
        country_code: telnyxNumber.country_code || 'US',
        area_code: phoneNumber.substring(2, 5),
        region: telnyxNumber.region_information?.region || null,
        locality: telnyxNumber.region_information?.locality || null,
        rate_center: telnyxNumber.region_information?.rate_center || null,
        features: telnyxNumber.features || ['sms', 'voice'],
        connection_id: telnyxNumber.connection_id,
        monthly_cost: parseFloat(telnyxNumber.monthly_rental_rate || '1.00'),
        webhook_url: telnyxNumber.webhook_url,
        purchased_at: telnyxNumber.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingNumber) {
        // Update existing number (but preserve user_id if assigned)
        updates.push({
          ...numberData,
          user_id: existingNumber.user_id,
          status: existingNumber.user_id ? 'active' : 'available'
        });
      } else {
        // Insert new number
        inserts.push({
          ...numberData,
          user_id: null,
          status: 'available'
        });
      }
    }

    // 4. Perform database operations
    if (inserts.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('telnyx_phone_numbers')
        .insert(inserts);
      
      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        console.log(`✅ Inserted ${inserts.length} new numbers`);
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabaseAdmin
          .from('telnyx_phone_numbers')
          .update(update)
          .eq('phone_number', update.phone_number);
        
        if (updateError) {
          console.error('Update error:', updateError);
        }
      }
      console.log(`✅ Updated ${updates.length} existing numbers`);
    }

    // 5. Mark numbers that are no longer in Telnyx as 'inactive'
    const telnyxNumberSet = new Set(telnyxNumbers.map(n => n.phone_number));
    const numbersToDeactivate = Array.from(dbNumbersMap.entries())
      .filter(([phone, data]) => !telnyxNumberSet.has(phone) && !data.user_id)
      .map(([phone]) => phone);

    if (numbersToDeactivate.length > 0) {
      const { error: deactivateError } = await supabaseAdmin
        .from('telnyx_phone_numbers')
        .update({ status: 'inactive' })
        .in('phone_number', numbersToDeactivate)
        .is('user_id', null);
      
      if (!deactivateError) {
        console.log(`⚠️ Deactivated ${numbersToDeactivate.length} numbers no longer in Telnyx`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        synced: {
          total: telnyxNumbers.length,
          inserted: inserts.length,
          updated: updates.length,
          deactivated: numbersToDeactivate.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
