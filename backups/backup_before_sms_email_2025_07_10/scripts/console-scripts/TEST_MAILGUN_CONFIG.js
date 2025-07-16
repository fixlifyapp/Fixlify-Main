// TEST MAILGUN DOMAIN CONFIGURATION
// Run this in browser console

(async function() {
  console.clear();
  console.log('🔍 TESTING MAILGUN CONFIGURATION');
  console.log('=================================\n');

  // 1. Check Mailgun domains table
  console.log('1️⃣ Checking Mailgun domains in database...');
  try {
    const { data: domains, error } = await supabase
      .from('mailgun_domains')
      .select('*');
    
    if (error) {
      console.error('❌ Cannot access mailgun_domains:', error.message);
    } else if (domains && domains.length > 0) {
      console.log('✅ Mailgun domains found:');
      domains.forEach(d => {
        console.log(`   - ${d.domain} (${d.is_active ? 'Active' : 'Inactive'})`);
      });
    } else {
      console.log('⚠️ No Mailgun domains configured in database');
      console.log('   This might be why emails are failing!');
    }
  } catch (e) {
    console.error('❌ Exception:', e);
  }

  // 2. Test different email formats
  console.log('\n2️⃣ Testing different Mailgun API calls...');
  
  const emailTests = [
    {
      name: 'Minimal test',
      body: {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test'
      }
    },
    {
      name: 'With from address',
      body: {
        from: 'noreply@mg.fixlify.com',
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test'
      }
    },
    {
      name: 'Your email test',
      body: {
        to: 'boomymarketing.com@gmail.com',
        subject: 'Fixlify Test',
        text: 'If you see this, Mailgun is working!',
        from: 'Fixlify <noreply@mg.fixlify.com>'
      }
    }
  ];

  for (const test of emailTests) {
    console.log(`\n   Testing: ${test.name}...`);
    try {
      const { data, error } = await supabase.functions.invoke('mailgun-email', {
        body: test.body
      });
      
      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        if (error.message.includes('non-2xx')) {
          console.log('      → Edge function internal error');
        }
      } else {
        console.log(`   ✅ Success:`, data);
      }
    } catch (e) {
      console.error(`   ❌ Exception: ${e.message}`);
    }
  }

  // 3. Check if we need to add domain to database
  console.log('\n3️⃣ Potential Fix - Add Mailgun domain:');
  console.log(`
If no domains were found above, run this:

await supabase.from('mailgun_domains').insert({
  domain: 'mg.fixlify.com',
  api_key: 'your-mailgun-api-key',
  is_active: true,
  region: 'us' // or 'eu'
});
  `);

  // 4. Direct Mailgun API test
  console.log('\n4️⃣ The issue is likely:');
  console.log('- Edge function can\'t find Mailgun configuration');
  console.log('- Wrong domain in edge function code');
  console.log('- Database permission issues (RLS)');
  console.log('- API key format issue');

})();

// Helper to add Mailgun domain
window.addMailgunDomain = async function(apiKey) {
  console.log('\nAdding Mailgun domain to database...');
  
  const { data, error } = await supabase
    .from('mailgun_domains')
    .insert({
      domain: 'mg.fixlify.com',
      api_key: apiKey || 'your-api-key-here',
      is_active: true,
      region: 'us'
    });
  
  if (error) {
    console.error('❌ Failed:', error.message);
  } else {
    console.log('✅ Domain added successfully!');
  }
};
