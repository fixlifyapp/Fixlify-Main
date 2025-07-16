// Quick phone number assignment for petrusenkocorp@gmail.com
// Copy and paste this entire script into browser console

(async () => {
  const { supabase } = window;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('❌ Please login as petrusenkocorp@gmail.com first');
    return;
  }
  
  console.log('🔍 Current user ID:', user.id);
  
  // First, check if there are ANY phone numbers in the system
  const { data: anyNumbers } = await supabase
    .from('telnyx_phone_numbers')
    .select('*')
    .limit(10);
    
  console.log('📱 Available phone numbers in system:', anyNumbers?.length || 0);
  
  if (anyNumbers && anyNumbers.length > 0) {
    // Try to assign an existing unassigned number
    const unassigned = anyNumbers.find(n => !n.user_id);
    if (unassigned) {
      console.log('📱 Found unassigned number:', unassigned.phone_number);
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .update({ 
          user_id: user.id,
          status: 'active'
        })
        .eq('id', unassigned.id);
        
      if (!error) {
        console.log('✅ Assigned existing number to user!');
        return;
      }
    }
    
    // Check if user already has a number
    const userNumber = anyNumbers.find(n => n.user_id === user.id);
    if (userNumber) {
      console.log('✅ User already has number:', userNumber.phone_number);
      if (userNumber.status !== 'active') {
        await supabase
          .from('telnyx_phone_numbers')
          .update({ status: 'active' })
          .eq('id', userNumber.id);
        console.log('✅ Activated the number');
      }
      return;
    }
  }
  
  // Create a new test number
  const testNumber = '+1555' + Math.floor(Math.random() * 9000000 + 1000000);
  console.log('📱 Creating test number:', testNumber);
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .insert({
      phone_number: testNumber,
      user_id: user.id,
      status: 'active',
      capabilities: { sms: true, voice: true }
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Try running the script again, it will generate a different number');
  } else {
    console.log('✅ Phone number assigned successfully!');
    console.log('📱 Number:', data.phone_number);
    console.log('📊 Status:', data.status);
    console.log('\n🎉 You can now send SMS messages!');
  }
})();