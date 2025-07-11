// TEST NEWLY DEPLOYED FUNCTIONS
// Copy and run this in browser console

(async function() {
  console.clear();
  console.log('🚀 TESTING NEWLY DEPLOYED FUNCTIONS');
  console.log('===================================\n');

  // 1. Test Mailgun
  console.log('📧 Testing Mailgun Email...');
  try {
    const emailResult = await supabase.functions.invoke('mailgun-email', {
      body: {
        to: 'boomymarketing.com@gmail.com',
        subject: 'Fixlify Test - Functions Redeployed!',
        html: '<h2>Success!</h2><p>Your Mailgun function has been redeployed with the new API key.</p>',
        text: 'Success! Your Mailgun function has been redeployed with the new API key.'
      }
    });
    
    if (emailResult.error) {
      console.error('❌ Mailgun Error:', emailResult.error.message);
    } else {
      console.log('✅ Email sent successfully!', emailResult.data);
    }
  } catch (e) {
    console.error('❌ Mailgun Exception:', e);
  }

  // 2. Test Telnyx SMS
  console.log('\n📱 Testing Telnyx SMS...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const smsResult = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: '+14377476737',
        message: 'Fixlify Test - Functions redeployed! Your SMS is working.',
        user_id: user?.id
      }
    });
    
    if (smsResult.error) {
      console.error('❌ Telnyx Error:', smsResult.error.message);
    } else {
      console.log('✅ SMS sent successfully!', smsResult.data);
    }
  } catch (e) {
    console.error('❌ Telnyx Exception:', e);
  }

  // 3. Test Invoice/Estimate functions
  console.log('\n📄 Testing Document Send Functions...');
  
  // Test send-invoice
  try {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .limit(1)
      .single();
    
    if (invoices) {
      console.log(`Testing with invoice #${invoices.invoice_number}...`);
      
      const result = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoices.id,
          sendToClient: false,
          customMessage: 'Test after redeploy'
        }
      });
      
      if (result.error) {
        console.error('❌ send-invoice Error:', result.error.message);
      } else {
        console.log('✅ send-invoice working!');
      }
    }
  } catch (e) {
    console.error('❌ Invoice test failed:', e);
  }

  console.log('\n✅ Test Complete!');
  console.log('Check your email and SMS!');
})();
