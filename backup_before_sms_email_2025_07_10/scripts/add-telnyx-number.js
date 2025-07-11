// Function to manually add a Telnyx number to database
async function addTelnyxNumber(phoneNumber) {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Format the phone number
  const formatted = phoneNumber.startsWith('+') ? phoneNumber : '+1' + phoneNumber.replace(/\D/g, '');
  
  // Extract area code
  const areaCode = formatted.substring(2, 5);
  
  // Insert into database
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .insert({
      phone_number: formatted,
      area_code: areaCode,
      status: 'active',
      country_code: 'US',
      features: ['sms', 'voice', 'mms'],
      purchased_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding number:', error);
  } else {
    console.log('✅ Number added successfully:', data);
    console.log('Go to /phone-numbers to claim it');
  }
}

// Usage: addTelnyxNumber('+14165551234')
// or: addTelnyxNumber('4165551234')
console.log('To add your new number, run: addTelnyxNumber("+1XXXXXXXXXX")');