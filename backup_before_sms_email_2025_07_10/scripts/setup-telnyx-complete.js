// Complete Telnyx Integration Setup Script
// This will set up everything needed for users to purchase numbers

async function setupTelnyxIntegration() {
  console.log('🚀 Setting up Telnyx integration...\n');
  
  // Step 1: Test Telnyx API connection
  console.log('1️⃣ Testing Telnyx API connection...');
  
  const TELNYX_API_KEY = 'KEY01973792571E803B1EF8E470CD832D49';
  const CONNECTION_ID = '2709100729850660858';
  
  try {
    // Test API key by fetching account info
    const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Telnyx API key is valid');
      const data = await response.json();
      console.log(`   Found ${data.data.length} numbers in your account`);
    } else {
      console.error('❌ Telnyx API key invalid');
      return;
    }
  } catch (error) {
    console.error('❌ Cannot connect to Telnyx:', error);
  }
  
  // Step 2: Create local test for number search
  console.log('\n2️⃣ Testing number search...');
  
  window.searchTelnyxNumbers = async (areaCode) => {
    const params = new URLSearchParams({
      'filter[country_iso]': 'US',
      'filter[area_code]': areaCode,
      'filter[features]': 'sms,voice',
      'filter[limit]': '10'
    });
    
    const response = await fetch(`https://api.telnyx.com/v2/available_phone_numbers?${params}`, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Found ${data.data.length} available numbers:`);
      data.data.forEach(num => {
        console.log(`- ${num.phone_number} ($${num.cost_information.monthly_rate}/mo)`);
      });
      return data.data;
    }
  };
  
  console.log('✅ Search function created. Test with: searchTelnyxNumbers("416")');
  
  // Step 3: Create purchase function
  console.log('\n3️⃣ Creating purchase function...');
  
  window.purchaseTelnyxNumber = async (phoneNumber) => {
    console.log(`Purchasing ${phoneNumber}...`);
    
    // Create order
    const orderResponse = await fetch('https://api.telnyx.com/v2/number_orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_numbers: [{ phone_number: phoneNumber }]
      })
    });
    
    if (orderResponse.ok) {
      const order = await orderResponse.json();
      console.log('✅ Number purchased!', order.data);
      
      // Now save to database
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('telnyx_phone_numbers')
        .insert({
          phone_number: phoneNumber,
          user_id: user?.id,
          status: 'active',
          order_id: order.data.id,
          connection_id: CONNECTION_ID,
          area_code: phoneNumber.substring(2, 5),
          purchased_at: new Date().toISOString()
        });
        
      if (!error) {
        console.log('✅ Saved to database');
      }
      
      return order.data;
    } else {
      const error = await orderResponse.json();
      console.error('❌ Purchase failed:', error);
    }
  };
  
  console.log('✅ Purchase function created. Use: purchaseTelnyxNumber("+14165551234")');
  
  // Step 4: Instructions for edge function deployment
  console.log('\n4️⃣ To enable the UI integration:\n');
  console.log('Run these commands in your terminal:');
  console.log('```bash');
  console.log('# Link Supabase project');
  console.log('npx supabase link --project-ref mqppvcrlvsgrsqelglod');
  console.log('');
  console.log('# Set secrets');
  console.log('npx supabase secrets set TELNYX_API_KEY=' + TELNYX_API_KEY);
  console.log('npx supabase secrets set TELNYX_CONNECTION_ID=' + CONNECTION_ID);
  console.log('');
  console.log('# Deploy edge function');
  console.log('npx supabase functions deploy telnyx-phone-manager');
  console.log('```');
  
  console.log('\n✅ Setup complete! You can now:');
  console.log('- Search numbers: searchTelnyxNumbers("416")');
  console.log('- Purchase numbers: purchaseTelnyxNumber("+14165551234")');
  console.log('- Or use the UI at /phone-numbers after deploying edge functions');
}

// Run the setup
setupTelnyxIntegration();