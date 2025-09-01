// Check what variables the webhook is actually returning
console.log('🔍 Checking Webhook Variable Names\n')

fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      event_type: 'assistant.initialization',
      payload: {
        telnyx_agent_target: '+14375249932',
        telnyx_end_user_target: '+14375621308'
      }
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Variables returned by webhook:\n')
  
  const vars = data.dynamic_variables
  const keys = Object.keys(vars).sort()
  
  // Show all variables
  keys.forEach(key => {
    const value = vars[key]
    const preview = typeof value === 'string' && value.length > 50 
      ? value.substring(0, 50) + '...' 
      : value
    console.log(`${key}: "${preview}"`)
  })
  
  console.log('\n📋 Telnyx expects these variables:')
  const telnyxVars = [
    'agent_name',
    'company_name', 
    'business_niche',
    'hours_of_operation',
    'services_offered',
    'business_phone',
    'current_date',
    'current_time',
    'day_of_week',
    'customer_status',
    'is_existing_customer',
    'customer_name',
    'customer_history',
    'service_area',
    'greeting'
  ]
  
  console.log('\n✅ Variables Match Check:')
  telnyxVars.forEach(v => {
    if (vars[v] !== undefined) {
      console.log(`✓ ${v}: Found`)
    } else {
      console.log(`✗ ${v}: MISSING`)
    }
  })
  
  console.log('\n📝 Extra variables webhook provides:')
  keys.forEach(key => {
    if (!telnyxVars.includes(key)) {
      console.log(`+ ${key}`)
    }
  })
})
.catch(err => console.error('Error:', err))
