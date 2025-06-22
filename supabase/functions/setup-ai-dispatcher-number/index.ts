import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate the user session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Setting up AI dispatcher for user:', user.id)

    // Set up the phone number +1 833-574-3145
    const phoneNumber = '+18335743145'
    
    // Build proper Connect instance ARN
    const connectInstanceId = Deno.env.get('AMAZON_CONNECT_INSTANCE_ID')
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'
    const connectInstanceArn = `arn:aws:connect:${awsRegion}:${connectInstanceId?.split('/')[0] || 'unknown'}:instance/${connectInstanceId}`
    
    console.log('Connect Instance ARN:', connectInstanceArn)
    console.log('Webhook URL:', `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-ai-voice-call`)

    // Check if phone number already exists
    const { data: existingNumber, error: checkError } = await supabaseClient
      .from('phone_numbers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing number:', checkError)
      throw checkError
    }

    if (!existingNumber) {
      // Insert the phone number with full configuration using 'available' status
      const { error: insertError } = await supabaseClient
        .from('phone_numbers')
        .insert({
          phone_number: phoneNumber,
          friendly_name: 'AI Dispatcher Test Number',
          status: 'available', // Changed from 'owned' to 'available'
          purchased_by: user.id,
          purchased_at: new Date().toISOString(),
          capabilities: {
            voice: true,
            sms: true,
            mms: false
          },
          locality: 'United States',
          region: 'US',
          price: 2.00,
          monthly_price: 1.00,
          country_code: 'US',
          phone_number_type: 'toll-free',
          price_unit: 'USD',
          ai_dispatcher_enabled: true,
          connect_instance_id: connectInstanceId,
          connect_phone_number_arn: `arn:aws:connect:${awsRegion}:${connectInstanceId?.split('/')[0]}:phone-number/${phoneNumber.replace('+', '')}`,
          ai_settings: {
            business_name: 'Fixlify Services',
            business_type: 'Field Service',
            greeting: 'Hello! Thanks for calling Fixlify Services. I\'m your AI assistant and I\'m here to help with your service needs.',
            voice_selection: 'alloy',
            emergency_detection_enabled: true,
            webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-ai-voice-call`
          }
        })

      if (insertError) {
        console.error('Error inserting phone number:', insertError)
        throw insertError
      }

      console.log('Phone number added successfully:', phoneNumber)
    } else {
      // Update existing number with complete configuration
      const { error: updateError } = await supabaseClient
        .from('phone_numbers')
        .update({
          ai_dispatcher_enabled: true,
          status: 'available', // Changed from 'owned' to 'available'
          purchased_by: user.id,
          connect_instance_id: connectInstanceId,
          connect_phone_number_arn: `arn:aws:connect:${awsRegion}:${connectInstanceId?.split('/')[0]}:phone-number/${phoneNumber.replace('+', '')}`,
          ai_settings: {
            business_name: 'Fixlify Services',
            business_type: 'Field Service',
            greeting: 'Hello! Thanks for calling Fixlify Services. I\'m your AI assistant and I\'m here to help with your service needs.',
            voice_selection: 'alloy',
            emergency_detection_enabled: true,
            webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-ai-voice-call`
          }
        })
        .eq('phone_number', phoneNumber)

      if (updateError) {
        console.error('Error updating phone number:', updateError)
        throw updateError
      }

      console.log('Phone number updated successfully:', phoneNumber)
    }

    // Ensure AI agent config exists with proper Connect ARN
    const { data: existingConfig, error: configCheckError } = await supabaseClient
      .from('ai_agent_configs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (configCheckError && configCheckError.code !== 'PGRST116') {
      console.error('Error checking AI config:', configCheckError)
    }

    if (!existingConfig) {
      // Create AI agent config with proper ARN
      const { error: configInsertError } = await supabaseClient
        .from('ai_agent_configs')
        .insert({
          user_id: user.id,
          business_niche: 'Field Service',
          diagnostic_price: 75.00,
          emergency_surcharge: 50.00,
          custom_prompt_additions: 'You are helping customers with field service requests including HVAC, plumbing, electrical, and general maintenance services. Always be helpful and professional.',
          connect_instance_arn: connectInstanceArn,
          aws_region: awsRegion,
          is_active: true
        })

      if (configInsertError) {
        console.error('Error creating AI config:', configInsertError)
        throw configInsertError
      }

      console.log('AI agent config created successfully')
    } else {
      // Update existing config with proper ARN
      const { error: configUpdateError } = await supabaseClient
        .from('ai_agent_configs')
        .update({
          connect_instance_arn: connectInstanceArn,
          aws_region: awsRegion,
          is_active: true
        })
        .eq('id', existingConfig.id)

      if (configUpdateError) {
        console.error('Error updating AI config:', configUpdateError)
        throw configUpdateError
      }

      console.log('AI agent config updated successfully')
    }

    // Create AWS credentials record if needed
    const { data: existingCreds, error: credsCheckError } = await supabaseClient
      .from('aws_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (credsCheckError && credsCheckError.code !== 'PGRST116') {
      console.error('Error checking AWS credentials:', credsCheckError)
    }

    if (!existingCreds) {
      // Create AWS credentials record
      const { error: credsInsertError } = await supabaseClient
        .from('aws_credentials')
        .insert({
          user_id: user.id,
          aws_access_key_id: 'configured_in_secrets',
          aws_secret_access_key: 'configured_in_secrets',
          aws_region: awsRegion,
          is_active: true
        })

      if (credsInsertError) {
        console.error('Error creating AWS credentials record:', credsInsertError)
        throw credsInsertError
      }

      console.log('AWS credentials record created')
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'AI dispatcher setup completed successfully',
      phone_number: phoneNumber,
      ai_enabled: true,
      connect_instance_id: connectInstanceId,
      connect_instance_arn: connectInstanceArn,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-ai-voice-call`,
      next_steps: [
        'Configure Amazon Connect contact flow to use webhook URL',
        'Test incoming calls to verify AI dispatcher functionality',
        'Monitor call logs in the Connect Center dashboard'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error setting up AI dispatcher:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
