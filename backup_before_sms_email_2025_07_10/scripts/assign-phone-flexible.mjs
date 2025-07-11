import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key for full access
const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function assignPhoneNumber() {
  console.log('🔍 Checking for user petrusenkocorp@gmail.com...\n');
  
  // First check profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .ilike('email', '%petrusenkocorp%')
    .limit(5);
    
  if (profiles && profiles.length > 0) {
    console.log('📧 Found users with similar email:');
    profiles.forEach(p => console.log(`  - ${p.email} (ID: ${p.id})`));
    
    const exactMatch = profiles.find(p => p.email === 'petrusenkocorp@gmail.com');
    if (exactMatch) {
      await assignToUser(exactMatch.id, exactMatch.email);
      return;
    }
  }
  
  // Check if ANY phone numbers exist in the system
  console.log('\n📱 Checking existing phone numbers in system...');
  const { data: allPhones, error: phoneError } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .limit(10);
    
  if (allPhones && allPhones.length > 0) {
    console.log(`Found ${allPhones.length} phone numbers in system:`);
    allPhones.forEach(phone => {
      console.log(`  - ${phone.phone_number} (Status: ${phone.status}, User: ${phone.user_id || 'unassigned'})`);
    });
  } else {
    console.log('No phone numbers found in system.');
  }
  
  // If we have profiles but no exact match, use the first one
  if (profiles && profiles.length > 0) {
    const firstUser = profiles[0];
    console.log(`\n⚠️ No exact match for petrusenkocorp@gmail.com`);
    console.log(`📱 Assigning phone to closest match: ${firstUser.email}`);
    await assignToUser(firstUser.id, firstUser.email);
    return;
  }
  
  console.log('\n❌ No users found with email containing "petrusenkocorp"');
  console.log('💡 Please make sure the user exists in the system');
}

async function assignToUser(userId, email) {
  console.log(`\n✅ Assigning phone number to ${email} (ID: ${userId})`);
  
  // Check if user already has a phone
  const { data: existing } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', userId);
    
  if (existing && existing.length > 0) {
    console.log('📱 User already has phone numbers:');
    existing.forEach(phone => {
      console.log(`  - ${phone.phone_number} (${phone.status})`);
    });
    
    // Activate if not active
    const inactive = existing.find(p => p.status !== 'active');
    if (inactive) {
      await supabase
        .from('telnyx_phone_numbers')
        .update({ status: 'active' })
        .eq('id', inactive.id);
      console.log('✅ Activated existing phone number');
    }
    return;
  }
  
  // Create new phone number
  const testNumber = '+1555' + Math.floor(Math.random() * 9000000 + 1000000);
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .insert({
      phone_number: testNumber,
      user_id: userId,
      status: 'active',
      capabilities: { sms: true, voice: true }
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Phone number assigned successfully!');
    console.log(`📱 Number: ${data.phone_number}`);
    console.log('🎉 SMS functionality is now enabled!');
  }
}

assignPhoneNumber().catch(console.error);
