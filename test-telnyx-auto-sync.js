// Тестовый скрипт для проверки автоматической синхронизации Telnyx
// Запустите в консоли браузера

async function testTelnyxAutoSync() {
  console.log('🔧 Testing Telnyx Auto Sync...\n');
  
  const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
  if (!authToken) {
    console.error('❌ Not logged in! Please log in first.');
    return;
  }

  // 1. Test connection
  console.log('1️⃣ Testing Telnyx connection...');
  try {
    const connResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action: 'test_telnyx_connection' })
    });
    
    const connData = await connResponse.json();
    if (connData.success) {
      console.log('✅ Telnyx connection successful!');
    } else {
      console.log('⚠️ Telnyx connection failed:', connData.error);
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
  }

  // 2. List current numbers in database
  console.log('\n2️⃣ Current numbers in database:');
  try {
    const dbResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?order=phone_number', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const dbNumbers = await dbResponse.json();
    console.log(`Found ${dbNumbers.length} numbers in database:`);
    dbNumbers.forEach(num => {
      console.log(`  📞 ${num.phone_number} - Status: ${num.status} - User: ${num.user_id || 'Available'}`);
    });
  } catch (error) {
    console.error('❌ Database query error:', error);
  }

  // 3. Sync from Telnyx
  console.log('\n3️⃣ Syncing from Telnyx...');
  try {
    const syncResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action: 'list_available_from_telnyx' })
    });
    
    const syncData = await syncResponse.json();
    if (syncData.success) {
      console.log(`✅ Sync successful! Found ${syncData.total} numbers from ${syncData.source}`);
      if (syncData.available_numbers && syncData.available_numbers.length > 0) {
        console.log('Available numbers:');
        syncData.available_numbers.forEach(num => {
          console.log(`  📞 ${num.phone_number} - ${num.area_code || 'N/A'} - ${num.locality || 'N/A'}`);
        });
      }
    } else {
      console.log('⚠️ Sync failed:', syncData.error);
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
  }

  console.log('\n✨ Test complete! Check /phone-management page for UI.');
}

// Run the test
testTelnyxAutoSync();
