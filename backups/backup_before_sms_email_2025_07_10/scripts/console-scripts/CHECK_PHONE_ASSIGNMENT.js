// CHECK PHONE NUMBERS FOR PETRUSENKOCORP@GMAIL.COM
// Copy and paste this entire script into console

(async function() {
  console.clear();
  console.log('📱 CHECKING PHONE NUMBERS FOR PETRUSENKOCORP@GMAIL.COM');
  console.log('=====================================================\n');

  // 1. Get current user info
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('❌ Not logged in:', userError);
    return;
  }
  
  console.log('👤 Current User:');
  console.log('   Email:', user.email);
  console.log('   User ID:', user.id);
  console.log('   Is this petrusenkocorp@gmail.com?', user.email === 'petrusenkocorp@gmail.com' ? '✅ YES' : '❌ NO');

  // 2. Get profile info
  console.log('\n📋 Profile Info:');
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      console.log('   Company:', profile.company_name || 'Not set');
      console.log('   Phone:', profile.phone || 'Not set');
      console.log('   Organization ID:', profile.organization_id || 'Not set');
    }
  } catch (err) {}

  // 3. Check ALL phone numbers in the system
  console.log('\n📞 ALL Phone Numbers in System:');
  try {
    const { data: allPhones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allPhones && allPhones.length > 0) {
      allPhones.forEach((phone, index) => {
        console.log(`\n${index + 1}. ${phone.phone_number}`);
        console.log(`   Status: ${phone.status}`);
        console.log(`   User ID: ${phone.user_id || 'NOT ASSIGNED'}`);
        console.log(`   Assigned to current user: ${phone.user_id === user.id ? '✅ YES' : '❌ NO'}`);
        console.log(`   Telnyx ID: ${phone.telnyx_phone_id || 'Not set'}`);
        console.log(`   Messaging Profile: ${phone.messaging_profile_id || 'Not set'}`);
        console.log(`   Created: ${new Date(phone.created_at).toLocaleString()}`);
      });
    } else {
      console.log('❌ No phone numbers found in database');
    }
  } catch (err) {
    console.error('❌ Error fetching phones:', err);
  }

  // 4. Check phones assigned to current user
  console.log('\n✅ Phone Numbers Assigned to YOU:');
  try {
    const { data: myPhones, error } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', user.id);
    
    if (myPhones && myPhones.length > 0) {
      myPhones.forEach(phone => {
        console.log(`   📱 ${phone.phone_number} - ${phone.status}`);
      });
    } else {
      console.log('   ❌ No phones assigned to your account');
    }
  } catch (err) {}

  // 5. Look for petrusenkocorp user if current user is different
  if (user.email !== 'petrusenkocorp@gmail.com') {
    console.log('\n🔍 Looking for petrusenkocorp@gmail.com user...');
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'petrusenkocorp@gmail.com');
      
      if (profiles && profiles.length > 0) {
        const petrusenkoUser = profiles[0];
        console.log('   Found user ID:', petrusenkoUser.id);
        
        // Check phones for that user
        const { data: petrusenkoPhones } = await supabase
          .from('telnyx_phone_numbers')
          .select('*')
          .eq('user_id', petrusenkoUser.id);
        
        if (petrusenkoPhones && petrusenkoPhones.length > 0) {
          console.log('   Phones assigned to petrusenkocorp@gmail.com:');
          petrusenkoPhones.forEach(phone => {
            console.log(`   📱 ${phone.phone_number} - ${phone.status}`);
          });
        } else {
          console.log('   ❌ No phones assigned to petrusenkocorp@gmail.com');
        }
      }
    } catch (err) {}
  }

  console.log('\n📝 ACTIONS YOU CAN TAKE:');
  console.log('=====================================');
  console.log('1. To assign a phone to current user:');
  console.log('   assignPhoneToMe("+1234567890")');
  console.log('\n2. To assign a phone to specific user:');
  console.log('   assignPhoneToUser("+1234567890", "user-id-here")');
  console.log('\n3. To see all users:');
  console.log('   listAllUsers()');
})();

// Helper function to assign phone to current user
window.assignPhoneToMe = async function(phoneNumber) {
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log(`\n🔄 Assigning ${phoneNumber} to ${user.email}...`);
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .update({ 
      user_id: user.id,
      status: 'active'
    })
    .eq('phone_number', phoneNumber);
  
  if (error) {
    console.error('❌ Failed:', error);
  } else {
    console.log('✅ Phone assigned successfully!');
  }
};

// Helper function to assign phone to specific user
window.assignPhoneToUser = async function(phoneNumber, userId) {
  console.log(`\n🔄 Assigning ${phoneNumber} to user ${userId}...`);
  
  const { data, error } = await supabase
    .from('telnyx_phone_numbers')
    .update({ 
      user_id: userId,
      status: 'active'
    })
    .eq('phone_number', phoneNumber);
  
  if (error) {
    console.error('❌ Failed:', error);
  } else {
    console.log('✅ Phone assigned successfully!');
  }
};

// List all users
window.listAllUsers = async function() {
  console.log('\n👥 ALL USERS IN SYSTEM:');
  console.log('======================');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, company_name, created_at')
      .order('created_at', { ascending: false });
    
    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ${profile.email}`);
        console.log(`   ID: ${profile.id}`);
        console.log(`   Company: ${profile.company_name || 'Not set'}`);
        console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
      });
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
};
