import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignRequest {
  phoneNumber: string;
  setAsPrimary?: boolean;
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

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
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

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User must belong to an organization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = profile.organization_id;
    const request: AssignRequest = await req.json();
    const phoneNumber = toE164(request.phoneNumber);

    console.log('Assigning number to org:', phoneNumber, organizationId);

    // First check if the number exists at all
    const { data: existingNumber, error: existError } = await supabase
      .from('phone_numbers')
      .select('id, phone_number, pool_status, organization_id, status')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    console.log('Existing number check:', { phoneNumber, existingNumber, existError });

    if (existError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database error checking phone number',
          details: existError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!existingNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Phone number not found in database',
          phoneNumber
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if available for assignment
    if (existingNumber.pool_status !== 'available') {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Phone number is not available (status: ${existingNumber.pool_status})`,
          currentStatus: existingNumber.pool_status
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingNumber.organization_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Phone number is already assigned to an organization',
          organizationId: existingNumber.organization_id
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const poolNumber = existingNumber;

    // Check if org has any primary number already
    const { data: existingPrimary } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_primary', true)
      .single();

    const shouldBePrimary = request.setAsPrimary || !existingPrimary;

    // Assign the number to the organization
    // Note: status stays as 'purchased' (valid values: available, purchased, released)
    // pool_status changes to 'assigned' to indicate it's assigned to an org
    const { error: updateError } = await supabase
      .from('phone_numbers')
      .update({
        pool_status: 'assigned',
        organization_id: organizationId,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
        status: 'purchased',  // Keep as purchased (not 'active' - violates check constraint)
        is_primary: shouldBePrimary,
        friendly_name: 'Organization Number'
      })
      .eq('phone_number', phoneNumber)
      .eq('pool_status', 'available');

    if (updateError) {
      console.error('Assignment error:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to assign phone number',
          details: updateError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If this should be primary, unset other primaries
    if (shouldBePrimary) {
      await supabase
        .from('phone_numbers')
        .update({ is_primary: false })
        .eq('organization_id', organizationId)
        .neq('phone_number', phoneNumber);
    }

    // Log the assignment
    await supabase
      .from('communication_logs')
      .insert({
        user_id: user.id,
        type: 'system',
        direction: 'internal',
        status: 'completed',
        content: `Phone number ${phoneNumber} assigned to organization`,
        metadata: {
          action: 'assign_from_pool',
          phone_number: phoneNumber,
          organization_id: organizationId,
          is_primary: shouldBePrimary
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phone number assigned to organization',
        phoneNumber,
        isPrimary: shouldBePrimary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in org assign:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
