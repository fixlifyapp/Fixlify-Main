// Script to add available phone numbers to Fixlify
// Run this in browser console to populate available numbers

async function addAvailableNumbers() {
  console.log('🔧 Adding available phone numbers to system...\n');
  
  try {
    // Check if user is logged in
    const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
    if (!authToken) {
      console.error('❌ You need to be logged in to Fixlify first!');
      return;
    }
    
    // Test numbers to add as available (not claimed by any user)
    const availableNumbers = [
      { number: '+14165551234', area: '416', city: 'Toronto' },
      { number: '+16475552345', area: '647', city: 'Toronto' },
      { number: '+19055553456', area: '905', city: 'Mississauga' },
      { number: '+12895554567', area: '289', city: 'Hamilton' },
      { number: '+14375555678', area: '437', city: 'Toronto' }
    ];
    
    console.log('📞 Adding available phone numbers...\n');
    
    let addedCount = 0;
    let existingCount = 0;
    
    for (const testNum of availableNumbers) {
      try {
        // First check if number exists
        const checkResponse = await fetch(
          `https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?phone_number=eq.${encodeURIComponent(testNum.number)}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        
        const existing = await checkResponse.json();
        
        if (existing && existing.length > 0) {
          // Update existing to be available
          const updateResponse = await fetch(
            `https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?phone_number=eq.${encodeURIComponent(testNum.number)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                user_id: null,
                status: 'available'
              })
            }
          );
          
          if (updateResponse.ok) {
            existingCount++;
            console.log(`📝 Updated ${testNum.number} to available`);
          }
        } else {
          // Add new number
          const addResponse = await fetch(
            'https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers',
            {
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
                monthly_cost: 0,
                setup_cost: 0,
                purchased_at: new Date().toISOString()
              })
            }
          );
          
          if (addResponse.ok) {
            addedCount++;
            console.log(`✅ Added ${testNum.number} (${testNum.city})`);
          } else {
            const error = await addResponse.text();
            console.log(`⚠️  Could not add ${testNum.number}: ${error}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error processing ${testNum.number}:`, err.message);
      }
    }
    
    console.log(`\n📊 Summary: ${addedCount} new, ${existingCount} updated to available\n`);
    
    // Now check all numbers
    console.log('📋 Checking all phone numbers in system...\n');
    
    const allResponse = await fetch(
      'https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?select=*&order=phone_number',
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    const allNumbers = await allResponse.json();
    
    // Group by status
    const available = allNumbers.filter(n => !n.user_id);
    const claimed = allNumbers.filter(n => n.user_id);
    
    console.log(`Total numbers: ${allNumbers.length}`);
    console.log(`📱 Available to claim: ${available.length}`);
    console.log(`✅ Already claimed: ${claimed.length}\n`);
    
    if (available.length > 0) {
      console.log('Available numbers:');
      available.forEach(n => {
        console.log(`  📞 ${n.phone_number} (${n.locality || n.area_code || 'Available'})`);
      });
    }
    
    console.log('\n🎉 Done! Refresh the page to see available numbers.');
    
    // Refresh if on phone page
    if (window.location.pathname.includes('phone') || window.location.pathname.includes('telnyx')) {
      console.log('🔄 Refreshing page...');
      setTimeout(() => window.location.reload(), 1500);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
addAvailableNumbers();
