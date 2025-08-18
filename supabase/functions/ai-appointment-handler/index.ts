import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { action, ...params } = await req.json()
    console.log('Appointment action:', action, params)

    switch (action) {
      case 'check_availability': {
        const { date, service_type } = params
        const targetDate = date || new Date().toISOString().split('T')[0]
        
        // Get existing appointments for the date
        const { data: existingJobs } = await supabase
          .from('jobs')
          .select('scheduled_time')
          .eq('scheduled_date', targetDate)
          .eq('appointment_status', 'scheduled')
        
        // Define business hours slots
        const allSlots = [
          '09:00', '10:00', '11:00', '12:00', 
          '14:00', '15:00', '16:00', '17:00'
        ]
        
        const bookedTimes = existingJobs?.map(j => j.scheduled_time?.slice(0,5)) || []
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))
        
        return new Response(JSON.stringify({
          date: targetDate,
          available_slots: availableSlots,
          fully_booked: availableSlots.length === 0,
          next_available: availableSlots[0] || 'Tomorrow 9:00 AM'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
      }

      case 'book_appointment': {
        const { client_phone, date, time, service_type, issue_description, client_name } = params
        
        // Find or create client
        let clientId
        const cleanPhone = client_phone?.replace(/\D/g, '') || ''
        
        // First find the user_id from phone_numbers table
        const { data: phoneData } = await supabase
          .from('phone_numbers')
          .select('user_id')
          .limit(1)
          .single()
        
        const userId = phoneData?.user_id || '6dfbdcae-c484-45aa-9327-763500213f24' // Default user
        
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .or(`phone.like.%${cleanPhone.slice(-10)}%`)
          .single()
        
        if (existingClient) {
          clientId = existingClient.id
        } else {
          const { data: newClient } = await supabase
            .from('clients')
            .insert({
              name: client_name || 'AI Scheduled Client',
              phone: client_phone,
              created_by: userId
            })
            .select()
            .single()
          clientId = newClient.id
        }
        
        // Create job/appointment
        const jobId = crypto.randomUUID()
        const { data: job, error } = await supabase
          .from('jobs')
          .insert({
            id: jobId,
            client_id: clientId,
            title: service_type || 'Service Appointment',
            description: issue_description || 'Scheduled via AI dispatcher',
            service: service_type || 'Repair',
            status: 'new',
            scheduled_date: date,
            scheduled_time: time + ':00',
            appointment_status: 'scheduled',
            booked_via: 'ai_dispatcher',
            created_by: userId,
            user_id: userId,
            date: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) throw error
        
        return new Response(JSON.stringify({
          success: true,
          booking_id: job.id,
          confirmation: `Appointment booked for ${date} at ${time}`,
          job_number: job.id.slice(0,8).toUpperCase()
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
      }

      case 'cancel_appointment': {
        const { phone_or_booking_id } = params
        
        // Find appointment
        let job
        if (phone_or_booking_id?.includes('-')) {
          // It's a booking ID
          const { data } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', phone_or_booking_id)
            .single()
          job = data
        } else {
          // It's a phone number - get most recent appointment
          const cleanPhone = phone_or_booking_id?.replace(/\D/g, '') || ''
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .or(`phone.like.%${cleanPhone.slice(-10)}%`)
            .single()
          
          if (client) {
            const { data } = await supabase
              .from('jobs')
              .select('*')
              .eq('client_id', client.id)
              .eq('appointment_status', 'scheduled')
              .order('scheduled_date', { ascending: false })
              .limit(1)
              .single()
            job = data
          }
        }
        
        if (!job) {
          return new Response(JSON.stringify({
            success: false,
            message: 'No appointment found'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
        }
        
        // Cancel the appointment
        await supabase
          .from('jobs')
          .update({ 
            appointment_status: 'cancelled',
            status: 'cancelled'
          })
          .eq('id', job.id)
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Appointment cancelled',
          refund_info: 'No charge for cancellations'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}, { verify_jwt: false })