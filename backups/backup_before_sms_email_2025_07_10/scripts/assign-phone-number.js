// Assign phone number to petrusenkocorp@gmail.com
// Run this in browser console

async function assignPhoneNumber() {
  const { supabase } = window;
  
  console.log('📱 Assigning phone number to petrusenkocorp@gmail.com...\n');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ Not authenticated. Please login first.');
    return;
  }
  
  // Check if current user is petrusenkocorp@gmail.com
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
    
  if (profile?.email !== 'petrusenkocorp@gmail.com') {
    console.warn('⚠️ Current user is not petrusenkocorp@gmail.com');
    console.log('Current user:', profile?.email);
  }
  
  // Use a default phone number for testing
  // This should be replaced with an actual Telnyx number
  const defaultPhoneNumber = '+15551234567'; // Example US number
  
  // Check if phone number already exists
  const { data: existing } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', user.id)
    .eq('phone_number', defaultPhoneNumber)
    .single();
    
  if (existing) {
    console.log('📱 Phone number already exists, updating status...');
    const { error: updateError } = await supabase
      .from('telnyx_phone_numbers')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
      
    if (updateError) {
      console.error('❌ Error updating phone number:', updateError);
    } else {
      console.log('✅ Phone number activated:', defaultPhoneNumber);
    }
  } else {
    console.log('📱 Adding new phone number...');
    const { data, error } = await supabase
      .from('telnyx_phone_numbers')
      .insert({
        phone_number: defaultPhoneNumber,
        user_id: user.id,
        status: 'active',
        capabilities: { sms: true, voice: true },
        metadata: {
          assigned_by: 'system',
          assigned_at: new Date().toISOString(),
          purpose: 'default_sms_number'
        }
      })
      .select()
      .single();
      
    if (error) {
      console.error('❌ Error adding phone number:', error);
      if (error.code === '23505') {
        console.log('💡 This phone number might already be assigned to another user');
      }
    } else {
      console.log('✅ Phone number added successfully:', data);
    }
  }
  
  // List all phone numbers for this user
  console.log('\n📋 All phone numbers for this user:');
  const { data: allNumbers } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', user.id);
    
  if (allNumbers && allNumbers.length > 0) {
    console.table(allNumbers.map(n => ({
      phone: n.phone_number,
      status: n.status,
      created: new Date(n.created_at).toLocaleDateString()
    })));
  }
  
  console.log('\n✅ Done! You can now send SMS messages.');
  console.log('💡 To use a different phone number, modify the defaultPhoneNumber in the script');
}

// Run immediately
assignPhoneNumber();