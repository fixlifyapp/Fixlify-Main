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

  try {
    const body = await req.json()
    console.log('MCP Server Request:', JSON.stringify(body, null, 2))
    
    const { jsonrpc, id, method, params } = body
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get conversation ID from meta
    const conversationId = params?._meta?.telnyx_conversation_id
    console.log('Conversation ID:', conversationId)    
    // Handle different MCP methods
    switch (method) {
      case 'tools/list':
        // Return available tools
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'check_availability',
                description: 'Check available appointment slots',
                inputSchema: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', description: 'Date to check (YYYY-MM-DD)' },
                    service_type: { type: 'string', description: 'Type of service needed' }
                  }
                }
              },
              {
                name: 'book_appointment',
                description: 'Book an appointment',
                inputSchema: {
                  type: 'object',
                  properties: {
                    customer_name: { type: 'string', description: 'Customer name' },                    customer_phone: { type: 'string', description: 'Customer phone number' },
                    date: { type: 'string', description: 'Appointment date' },
                    time: { type: 'string', description: 'Appointment time' },
                    service_type: { type: 'string', description: 'Type of service' },
                    notes: { type: 'string', description: 'Additional notes' }
                  },
                  required: ['customer_name', 'customer_phone', 'date', 'time', 'service_type']
                }
              },
              {
                name: 'get_business_hours',
                description: 'Get business hours',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'transfer_to_human',
                description: 'Transfer call to human agent',
                inputSchema: {
                  type: 'object',
                  properties: {
                    reason: { type: 'string', description: 'Reason for transfer' }
                  }
                }
              }
            ]
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })        
      case 'tools/call':
        // Handle tool calls
        const toolName = params?.name
        const toolArgs = params?.arguments || {}
        
        console.log(`Calling tool: ${toolName}`, toolArgs)
        
        switch (toolName) {
          case 'check_availability':
            // Check available slots
            const availableSlots = [
              { time: '9:00 AM', available: true },
              { time: '10:00 AM', available: true },
              { time: '2:00 PM', available: true },
              { time: '3:00 PM', available: false },
              { time: '4:00 PM', available: true }
            ].filter(slot => slot.available)
            
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `Available slots for ${toolArgs.date || 'today'}: ${availableSlots.map(s => s.time).join(', ')}`
                  }
                ]
              }
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })            
          case 'book_appointment':
            // Create appointment in database
            const { data: newAppointment, error } = await supabase
              .from('appointments')
              .insert({
                customer_name: toolArgs.customer_name,
                customer_phone: toolArgs.customer_phone,
                appointment_date: toolArgs.date,
                appointment_time: toolArgs.time,
                service_type: toolArgs.service_type,
                notes: toolArgs.notes,
                status: 'scheduled',
                conversation_id: conversationId,
                created_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (error) {
              console.error('Error booking appointment:', error)
              return new Response(JSON.stringify({
                jsonrpc: '2.0',
                id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: 'I had trouble booking the appointment. Let me transfer you to someone who can help.'
                    }
                  ]                }
              }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }
            
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `Perfect! I've booked your appointment for ${toolArgs.date} at ${toolArgs.time}. We'll see you then for your ${toolArgs.service_type} service. You'll receive a confirmation text shortly.`
                  }
                ]
              }
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            
          case 'get_business_hours':
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: 'Our business hours are Monday through Friday, 9 AM to 6 PM. We also offer emergency service 24/7 with an additional fee.'
                  }
                ]
              }
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })            
          case 'transfer_to_human':
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `I'll transfer you to a team member who can better assist you. Please hold for just a moment.`
                  }
                ]
              }
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            
          default:
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Tool not found: ${toolName}`
              }
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        
      default:
        // Unsupported method
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id,          error: {
            code: -32601,
            message: 'Method not found'
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
  } catch (error) {
    console.error('MCP Server Error:', error)
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})