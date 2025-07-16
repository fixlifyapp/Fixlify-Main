import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://mqppvcrlvsgrsqelglod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function assignPhoneNumber() {
  console.log('🔍 Finding user petrusenkocorp@gmail.com...');
  
  // Get user from profiles
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
  const { data: existing } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('user_id', userId);
    
  if (existing && existing.length > 0) {
    console.log('📱 User already has phone numbers:');
    existing.forEach(phone => {
      console.log(`  - ${phone.phone_number} (${phone.status})`);
    });
    
    // Activate the first one if not active
    const inactive = existing.find(p => p.status !== 'active');
    if (inactive) {
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ status: 'active' })
        .eq('id', inactive.id);
        
      if (!error) {
        console.log('✅ Activated phone number:', inactive.phone_number);
      }
    }
    return;
  }
  
  // Create a test phone number
  const testNumber = '+1555' + Math.floor(Math.random() * 9000000 + 1000000);
  console.log('📱 Creating new phone number:', testNumber);
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .insert({
      phone_number: testNumber,
      user_id: userId,
      status: 'active',
      capabilities: { sms: true, voice: true },
      metadata: {
        assigned_date: new Date().toISOString(),
        assigned_by: 'system_script',
        type: 'test_number'
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error assigning phone number:', error);
    return;
  }
  
  console.log('✅ Phone number assigned successfully!');
  console.log('📱 Number:', data.phone_number);
  console.log('👤 User:', profiles.email);
  console.log('📊 Status:', data.status);
  console.log('\n🎉 SMS functionality is now enabled for this user!');
}

// Run the assignment
assignPhoneNumber().catch(console.error);
