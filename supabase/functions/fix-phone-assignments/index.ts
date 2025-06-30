
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Check if user email matches petrusenkocorp@gmail.com
    if (userData.user.email !== 'petrusenkocorp@gmail.com') {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Get all unassigned phone numbers
    const { data: unassignedNumbers, error: fetchError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .is('user_id', null);

    if (fetchError) {
      return new Response(JSON.stringify({ success: false, error: fetchError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Assign all unassigned numbers to this user
    const { data: updatedNumbers, error: updateError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .update({ 
        user_id: userData.user.id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .is('user_id', null)
      .select();

    if (updateError) {
      return new Response(JSON.stringify({ success: false, error: updateError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Assigned ${updatedNumbers?.length || 0} phone numbers to your account`,
      numbers: updatedNumbers
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fixing phone assignments:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
