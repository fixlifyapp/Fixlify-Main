// Function to add a phone number directly to Supabase
// You can run this in your browser console when logged into your app

async function addPhoneNumber(phoneNumber) {
  // Format the phone number
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  const areaCode = formatted.substring(2, 5);
  
  console.log(`📞 Adding phone number: ${formatted}`);
  
  try {
    // Get the Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'fixlify-auth-token',
        storage: window.localStorage
      }
    });
    
    // Add the phone number
    const { data, error } = await supabase
      .from('telnyx_phone_numbers')
      .insert({
        phone_number: formatted,
        status: 'available',
        country_code: 'US',
        area_code: areaCode,
        features: ['sms', 'voice', 'mms'],
        monthly_cost: 0,
        setup_cost: 0,
        purchased_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        console.error('❌ This phone number already exists in the database');
        
        // Try to update it to make it available
        const { data: updateData, error: updateError } = await supabase
          .from('telnyx_phone_numbers')
          .update({
            status: 'available',
            user_id: null
          })
          .eq('phone_number', formatted)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ Error updating number:', updateError);
        } else {
          console.log('✅ Phone number updated and made available:', updateData);
        }
      } else {
        console.error('❌ Error adding number:', error);
      }
    } else {
      console.log('✅ Phone number added successfully:', data);
    }
    
    // Fetch all numbers to verify
    const { data: allNumbers } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('phone_number');
      
    console.log('📋 All numbers in database:');
    allNumbers?.forEach(num => {
      console.log(`  ${num.phone_number} - Status: ${num.status} - User: ${num.user_id || 'Available'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Example usage:
// addPhoneNumber('416-555-1234');
// addPhoneNumber('+14165551234');
// addPhoneNumber('4165551234');

console.log('✅ Function loaded. Use addPhoneNumber("your-number") to add a phone number.');
