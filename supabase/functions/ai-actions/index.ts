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
    const { action, parameters, metadata } = await req.json();
    console.log(`AI Action: ${action}`, parameters);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;
    
    switch(action) {
      case 'book_appointment':
        result = await bookAppointment(supabase, parameters, metadata);
        break;
      
      case 'check_repair_status':
        result = await checkRepairStatus(supabase, parameters);
        break;
      
      case 'create_ticket':
        result = await createTicket(supabase, parameters, metadata);
        break;
      
      case 'get_quote':
        result = await getQuote(supabase, parameters);
        break;
      
      case 'check_availability':
        result = await checkAvailability(supabase, parameters);
        break;
        
      case 'send_sms':
        result = await sendSMS(supabase, parameters);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Action Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Book Appointment Function
async function bookAppointment(supabase: any, params: any, metadata: any) {
  const { customer_name, phone, date, time, device, issue } = params;
  
  // Check if slot is available
  const { data: existingAppt } = await supabase
    .from('appointments')
    .select('id')
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .single();
  
  if (existingAppt) {
    return {
      success: false,
      message: "That time slot is already booked. Please choose another time."
    };
  }
  
  // Create appointment
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
      created_by: 'AI Assistant',
      company_id: metadata?.company_id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Send SMS confirmation
  await sendSMS(supabase, {
    to: phone,
    message: `Appointment confirmed for ${date} at ${time}. Ticket #${appointment.id}. Reply CANCEL to cancel.`
  });
  
  return {
    success: true,
    message: `Perfect! I've booked your appointment for ${date} at ${time}. Your confirmation number is ${appointment.id}. You'll receive an SMS confirmation shortly.`,
    appointment_id: appointment.id
  };
}

// Check Repair Status
async function checkRepairStatus(supabase: any, params: any) {
  const { ticket_number, phone_number } = params;
  
  let query = supabase.from('jobs').select('*');
  
  if (ticket_number) {
    query = query.eq('id', ticket_number);
  } else if (phone_number) {
    // Find by phone number
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone_number)
      .single();
    
    if (customer) {
      query = query.eq('client_id', customer.id).order('created_at', { ascending: false }).limit(1);
    }
  }
  
  const { data: job } = await query.single();
  
  if (!job) {
    return {
      success: false,
      message: "I couldn't find a repair with that information. Please check your ticket number or provide the phone number you used."
    };
  }
  
  const statusMessages = {
    'pending': 'waiting to be started',
    'in_progress': 'currently being worked on',
    'completed': 'completed and ready for pickup',
    'delivered': 'has been picked up'
  };
  
  return {
    success: true,
    message: `Your ${job.device_brand} ${job.device_type} repair (Ticket #${job.id}) is ${statusMessages[job.status] || job.status}. ${job.notes || ''}`,
    job
  };
}

// Create Repair Ticket
async function createTicket(supabase: any, params: any, metadata: any) {
  const { customer_name, phone, device_type, device_brand, issue_description, urgency } = params;
  
  // Find or create customer
  let { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', phone)
    .single();
  
  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        name: customer_name,
        phone,
        company_id: metadata?.company_id
      })
      .select()
      .single();
    customer = newCustomer;
  }
  
  // Create job ticket
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      client_id: customer.id,
      device_type,
      device_brand,
      issue_description,
      status: 'pending',
      priority: urgency || 'normal',
      company_id: metadata?.company_id,
      created_by: 'AI Assistant'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    success: true,
    message: `I've created repair ticket #${job.id} for your ${device_brand} ${device_type}. We'll call you at ${phone} when it's ready.`,
    ticket_id: job.id
  };
}

// Get Repair Quote
async function getQuote(supabase: any, params: any) {
  const { device_type, device_brand, issue_type } = params;
  
  // Fetch pricing from database or use defaults
  const priceMap = {
    'phone_screen': { 'iPhone': 299, 'Samsung': 249, 'default': 199 },
    'phone_battery': { 'iPhone': 99, 'Samsung': 89, 'default': 79 },
    'laptop_screen': { 'MacBook': 599, 'Dell': 399, 'default': 349 },
    'laptop_battery': { 'MacBook': 199, 'Dell': 149, 'default': 129 },
    'tablet_screen': { 'iPad': 399, 'Samsung': 299, 'default': 249 }
  };
  
  const key = `${device_type}_${issue_type}`;
  const prices = priceMap[key] || priceMap[`${device_type}_screen`];
  const price = prices?.[device_brand] || prices?.default || 99;
  
  return {
    success: true,
    message: `For ${device_brand} ${device_type} ${issue_type} repair, the estimated cost is $${price}. This includes parts and labor with a 90-day warranty. Would you like to book an appointment?`,
    price
  };
}

// Check Availability
async function checkAvailability(supabase: any, params: any) {
  const { date, time } = params;
  
  // Get all appointments for that date
  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .eq('status', 'scheduled');
  
  const bookedTimes = appointments?.map(a => a.appointment_time) || [];
  
  // Generate available slots (9 AM to 6 PM, 30 min intervals)
  const availableSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let min of ['00', '30']) {
      const slot = `${hour.toString().padStart(2, '0')}:${min}`;
      if (!bookedTimes.includes(slot)) {
        availableSlots.push(slot);
      }
    }
  }
  
  if (time && !bookedTimes.includes(time)) {
    return {
      success: true,
      message: `Yes, ${time} on ${date} is available. Would you like to book it?`,
      available: true
    };
  }
  
  return {
    success: true,
    message: `Available times on ${date}: ${availableSlots.slice(0, 5).join(', ')}. Which works best for you?`,
    available_slots: availableSlots
  };
}

// Send SMS
async function sendSMS(supabase: any, params: any) {
  const { to, message } = params;
  
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      message,
      from: '+14375249932'
    })
  });
  
  if (!response.ok) {
    console.error('SMS send failed');
    return { success: false };
  }
  
  return { success: true, message: 'SMS sent successfully' };
}