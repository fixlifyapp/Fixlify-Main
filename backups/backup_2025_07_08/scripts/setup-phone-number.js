// Check and add phone number for petrusenkocorp@gmail.com
// Run this in browser console

async function setupPhoneNumber() {
  const { supabase } = window;
  
  console.log('🔍 Checking phone number setup for petrusenkocorp@gmail.com...\n');
  
  // Get user by email
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'petrusenkocorp@gmail.com')
    .single();
    
  if (profileError || !profiles) {
    console.error('❌ User not found:', profileError);
    return;
  }
  
  const userId = profiles.id;
  console.log('✅ Found user:', profiles.email, 'ID:', userId);
  
  // Check existing phone numbers
  const { data: existingNumbers, error: phoneError } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', userId);
    
  if (phoneError) {
    console.error('❌ Error checking phone numbers:', phoneError);
    return;
  }
  
  if (existingNumbers && existingNumbers.length > 0) {
    console.log('📱 Existing phone numbers for this user:');
    console.table(existingNumbers.map(n => ({
      phone_number: n.phone_number,
      status: n.status,
      created_at: new Date(n.created_at).toLocaleString()
    })));
    
    // Check if any are active
    const activeNumbers = existingNumbers.filter(n => n.status === 'active');
    if (activeNumbers.length > 0) {
      console.log('✅ Active phone numbers found:', activeNumbers.map(n => n.phone_number));
      return;
    } else {
      console.log('⚠️ No active phone numbers. Activating the first one...');
      const { error: updateError } = await supabase
        .from('telnyx_phone_numbers')
        .update({ status: 'active' })
        .eq('id', existingNumbers[0].id);
        
      if (updateError) {
        console.error('❌ Error activating phone number:', updateError);
      } else {
        console.log('✅ Phone number activated:', existingNumbers[0].phone_number);
      }
      return;
    }
  }
  
  // No phone numbers exist, add a default one
  console.log('📱 No phone numbers found. Adding a default phone number...');
  console.log('⚠️ Please enter the actual Telnyx phone number you want to use.');
  console.log('📝 Example: addPhoneNumber("+1234567890")');
  
  // Create helper function
  window.addPhoneNumber = async (phoneNumber) => {
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      console.error('❌ Please provide a valid phone number in E.164 format (e.g., +1234567890)');
      return;
    }
    
    const { data, error } = await supabase
      .from('telnyx_phone_numbers')
      .insert({
        phone_number: phoneNumber,
        user_id: userId,
        status: 'active',
        capabilities: { sms: true, voice: true }
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error adding phone number:', error);
    } else {
      console.log('✅ Phone number added successfully:', data);
      console.log('🎉 You can now send SMS messages!');
    }
  };
  
  console.log('\n💡 To add a phone number, run: addPhoneNumber("+1234567890")');
}

// Run the setup
setupPhoneNumber();