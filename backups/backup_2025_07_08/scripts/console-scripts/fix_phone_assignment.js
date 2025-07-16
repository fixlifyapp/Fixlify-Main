// Script to fix phone number assignment issues
// Run this in the browser console

async function fixPhoneNumberAssignment() {
  console.log('=== Fixing Phone Number Assignment ===');
  
  const { supabase } = window;
  if (!supabase) {
    console.error('Supabase client not found');
    return;
  }
  
  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Not authenticated:', userError);
      return;
    }
    
    console.log('Current user:', user.id);
    console.log('Email:', user.email);
    
    // 2. Check if user already has a phone number
    const { data: existingPhone, error: phoneError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingPhone) {
      console.log('✅ User already has phone number:', existingPhone.phone_number);
      console.log('Status:', existingPhone.status);
      return existingPhone;
    }
    
    console.log('User does not have a phone number assigned');
    
    // 3. Find available phone numbers
    const { data: availablePhones, error: availError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('status', 'available')
      .is('user_id', null);
    
    if (availError || !availablePhones || availablePhones.length === 0) {
      console.error('No available phone numbers found:', availError);
      return;
    }
    
    console.log('Found', availablePhones.length, 'available phone numbers:');
    availablePhones.forEach((phone, index) => {
      console.log(`${index + 1}. ${phone.phone_number} (${phone.locality}, ${phone.region})`);
    });
    
    // 4. Assign the first available phone number
    const phoneToAssign = availablePhones[0];
    console.log('Assigning phone number:', phoneToAssign.phone_number);
    
    const { data: updated, error: updateError } = await supabase
      .from('telnyx_phone_numbers')
      .update({
        user_id: user.id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', phoneToAssign.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Failed to assign phone number:', updateError);
      return;
    }
    
    console.log('✅ Phone number assigned successfully:', updated.phone_number);
    
    // 5. Update user profile with phone number
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        phone: updated.phone_number,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (profileError) {
      console.error('Failed to update profile phone:', profileError);
    } else {
      console.log('✅ Profile phone number updated');
    }
    
    return updated;
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Function to check current phone assignment
async function checkPhoneAssignment() {
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Not authenticated');
    return;
  }
  
  console.log('=== Current Phone Assignment ===');
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  
  // Check profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('user_id', user.id)
    .single();
  
  console.log('Profile phone:', profile?.phone || 'Not set');
  
  // Check Telnyx phone
  const { data: telnyxPhone } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (telnyxPhone) {
    console.log('Telnyx phone:', telnyxPhone.phone_number);
    console.log('Status:', telnyxPhone.status);
    console.log('Features:', telnyxPhone.features);
  } else {
    console.log('No Telnyx phone assigned');
  }
  
  // Check available phones
  const { data: available } = await supabase
    .from('telnyx_phone_numbers')
    .select('phone_number, locality, region')
    .eq('status', 'available')
    .is('user_id', null);
  
  if (available && available.length > 0) {
    console.log('\nAvailable phone numbers:');
    available.forEach(p => console.log(`- ${p.phone_number} (${p.locality}, ${p.region})`));
  }
}

// Function to switch to correct user
async function switchToUserWithPhone() {
  console.log('=== Users with Phone Numbers ===');
  
  const { supabase } = window;
  
  // Find users with phone numbers
  const { data: usersWithPhones } = await supabase
    .from('telnyx_phone_numbers')
    .select(`
      phone_number,
      user_id,
      status,
      profiles!inner(email)
    `)
    .eq('status', 'active')
    .not('user_id', 'is', null);
  
  if (usersWithPhones && usersWithPhones.length > 0) {
    console.log('Users with active phone numbers:');
    usersWithPhones.forEach(u => {
      console.log(`Email: ${u.profiles.email}`);
      console.log(`Phone: ${u.phone_number}`);
      console.log(`User ID: ${u.user_id}`);
      console.log('---');
    });
    
    console.log('\nTo use SMS features, you need to login as petrusenkocorp@gmail.com');
  }
}

console.log('=== Phone Number Assignment Helper ===');
console.log('Available commands:');
console.log('- checkPhoneAssignment() - Check current phone assignment');
console.log('- fixPhoneNumberAssignment() - Assign an available phone to current user');
console.log('- switchToUserWithPhone() - Show users that have phones assigned');
console.log('\nRunning check...\n');

// Auto-run check
checkPhoneAssignment();
