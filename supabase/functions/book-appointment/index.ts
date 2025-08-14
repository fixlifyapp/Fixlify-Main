import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request from Telnyx AI Assistant
    const body = await req.json();
    console.log('Book Appointment Request:', body);
    
    // Extract parameters (Telnyx sends them in different formats)
    const params = body.parameters || body;
    
    const {
      customer_name,
      phone,
      date,
      time,
      device,
      issue
    } = params;
    
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if time slot is available
    const { data: existingAppt } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .single();
    
    if (existingAppt) {
      return new Response(JSON.stringify({
        success: false,
        message: "That time slot is already booked. Please try another time."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create the appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        customer_name,
        phone,
        appointment_date: date,
        appointment_time: time,
        device_type: device,
        issue_description: issue,
        status: 'scheduled',
        created_by: 'AI Assistant'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: "Sorry, I couldn't book the appointment. Please try again."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Send SMS confirmation (optional - using your existing SMS function)
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message: `Appointment confirmed!\n📅 ${date} at ${time}\n📱 ${device} - ${issue}\n📋 Confirmation #${appointment.id}`,
          from: '+14375249932'
        })
      });
    } catch (smsError) {
      console.error('SMS failed, but appointment booked:', smsError);
    }
    
    // Return success response to AI Assistant
    return new Response(JSON.stringify({
      success: true,
      message: `Perfect! I've booked your appointment for ${date} at ${time}. Your confirmation number is ${appointment.id}. You'll receive an SMS confirmation shortly.`,
      appointment_id: appointment.id,
      details: {
        date,
        time,
        customer: customer_name,
        device,
        issue,
        confirmation: appointment.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: "Sorry, something went wrong. Please try again.",
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});