// Quick Phone Number Setup for Fixlify
// This adds test phone numbers to your system so you can start using SMS right away

console.log('📱 Quick Phone Number Setup for Fixlify\n');
console.log('This will add some phone numbers to your system for testing.\n');

async function quickSetup() {
  try {
    // Check if user is logged in
    const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
    if (!authToken) {
      console.error('❌ You need to be logged in to Fixlify first!');
      return;
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Could not get user information');
      return;
    }
    
    console.log('✅ Logged in as:', user.email);
    console.log('');
    
    // Test phone numbers to add
    const testNumbers = [
      { number: '+14165551234', area: '416', city: 'Toronto' },
      { number: '+16475552345', area: '647', city: 'Toronto' },
      { number: '+19055553456', area: '905', city: 'Mississauga' }
    ];
    
    console.log('📞 Adding test phone numbers...\n');
    
    let addedCount = 0;
    
    for (const testNum of testNumbers) {
      try {
        // First, try to add as available
        const addResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
            'Authorization': `Bearer ${authToken}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            phone_number: testNum.number,
            status: 'available',
            country_code: 'US',
            area_code: testNum.area,
            locality: testNum.city,
            features: ['sms', 'voice', 'mms'],
            monthly_cost: 0,
            setup_cost: 0,
            purchased_at: new Date().toISOString()
          })
        });
        
        if (addResponse.ok) {
          addedCount++;
          console.log(`✅ Added ${testNum.number} (${testNum.city})`);
        } else {
          const error = await addResponse.text();
          if (error.includes('duplicate')) {
            console.log(`ℹ️  ${testNum.number} already exists`);
          } else {
            console.log(`⚠️  Could not add ${testNum.number}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error adding ${testNum.number}:`, err.message);
      }
    }
    
    console.log(`\n✅ Setup complete! Added ${addedCount} new numbers.\n`);
    
    // Now claim the first number for the user
    console.log('🎯 Claiming a phone number for your account...\n');
    
    try {
      // Get the first available number
      const availableResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?status=eq.available&limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const availableNumbers = await availableResponse.json();
      
      if (availableNumbers && availableNumbers.length > 0) {
        const numberToClaim = availableNumbers[0];
        
        // Claim it for the user
        const claimResponse = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?id=eq.${numberToClaim.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            user_id: user.id,
            status: 'active'
          })
        });
        
        if (claimResponse.ok) {
          console.log(`✅ Successfully claimed ${numberToClaim.phone_number} for your account!`);
          console.log('📱 You can now send SMS messages!\n');
        }
      }
    } catch (err) {
      console.log('Could not auto-claim a number:', err.message);
    }
    
    // Show all numbers
    console.log('📋 Checking all phone numbers in your system...\n');
    
    const allNumbersResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?select=*', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const allNumbers = await allNumbersResponse.json();
    
    console.log(`Total phone numbers: ${allNumbers.length}`);
    allNumbers.forEach(num => {
      const status = num.user_id === user.id ? '✅ YOUR NUMBER' : (num.user_id ? '👤 Claimed' : '📱 Available');
      console.log(`${status} - ${num.phone_number} (${num.locality || num.area_code || 'Unknown location'})`);
    });
    
    console.log('\n🎉 All done! Your SMS system is ready to use.\n');
    
    // Test SMS sending
    console.log('💡 To test SMS sending, you can:');
    console.log('1. Go to any Estimate or Invoice');
    console.log('2. Click the SMS button');
    console.log('3. Enter a phone number and send!\n');
    
    // Refresh if on phone page
    if (window.location.pathname.includes('phone')) {
      console.log('🔄 Refreshing page to show updated numbers...');
      setTimeout(() => window.location.reload(), 2000);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('Please make sure you are logged in to Fixlify and try again.');
  }
}

// Run the setup
quickSetup();

// Also create a helper function to manually add numbers
window.addPhoneNumber = async function(phoneNumber) {
  const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
  if (!authToken) {
    console.error('❌ You need to be logged in first');
    return;
  }
  
  // Clean and format the number
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        phone_number: formatted,
        status: 'available',
        country_code: 'US',
        area_code: formatted.substring(2, 5),
        features: ['sms', 'voice', 'mms'],
        monthly_cost: 0,
        setup_cost: 0,
        purchased_at: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log(`✅ Successfully added ${formatted}`);
      console.log('Run claimLastNumber() to claim it for your account');
    } else {
      const error = await response.text();
      console.error('❌ Error:', error);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

window.claimLastNumber = async function() {
  const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ You need to be logged in');
    return;
  }
  
  // Get the last available number
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?status=eq.available&order=created_at.desc&limit=1', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const numbers = await response.json();
  if (numbers && numbers.length > 0) {
    const number = numbers[0];
    
    const claimResponse = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?id=eq.${number.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        user_id: user.id,
        status: 'active'
      })
    });
    
    if (claimResponse.ok) {
      console.log(`✅ Successfully claimed ${number.phone_number}`);
    }
  } else {
    console.log('❌ No available numbers to claim');
  }
};

console.log('\n📌 Helper functions available:');
console.log('- addPhoneNumber("416-555-1234") - Add a custom number');
console.log('- claimLastNumber() - Claim the last added number for your account');
