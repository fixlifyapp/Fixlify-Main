// Comprehensive Email & SMS Testing Script
// Run this in F12 console to test the complete workflow

console.log('🧪 COMPREHENSIVE EMAIL & SMS TESTING SCRIPT');

async function runComprehensiveTests() {
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Not logged in! Please log in first.');
      return;
    }
    
    console.log('✅ Logged in as:', session.user.email);
    
    // Test 1: Check Email Configuration
    console.log('\n📧 Testing Email Configuration...');
    try {
      const { data: emailConfig, error: emailConfigError } = await supabase.functions.invoke('check-email-config');
      if (emailConfigError) {
        console.error('❌ Email config error:', emailConfigError);
      } else {
        console.log('✅ Email config:', emailConfig);
      }
    } catch (error) {
      console.error('❌ Failed to check email config:', error);
    }

    // Test 2: Get Sample Data
    console.log('\n📋 Fetching sample data...');
    
    // Get an estimate
    const { data: estimates } = await supabase
      .from('estimates')
      .select('*, clients(*)')
      .limit(1);
    
    const estimate = estimates?.[0];
    if (!estimate) {
      console.error('❌ No estimates found for testing');
      return;
    }
    
    console.log('📄 Using estimate:', estimate.estimate_number);
    
    // Get an invoice
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .limit(1);
    
    const invoice = invoices?.[0];
    if (invoice) {
      console.log('📄 Found invoice:', invoice.invoice_number);
    }

    // Test 3: Test Direct Email Sending
    console.log('\n📧 Testing Direct Email Sending...');
    try {
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('mailgun-email', {
        body: {
          to: 'test@example.com',
          subject: 'Test Email from Fixlify',
          text: 'This is a test email to verify email functionality.',
          userId: session.user.id,
          metadata: { test: true }
        }
      });
      
      if (emailError) {
        console.error('❌ Direct email test failed:', emailError);
      } else {
        console.log('✅ Direct email test result:', emailResult);
      }
    } catch (error) {
      console.error('❌ Direct email test error:', error);
    }

    // Test 4: Test Estimate Email Sending
    if (estimate) {
      console.log('\n📄 Testing Estimate Email Sending...');
      try {
        const { data: estimateEmailResult, error: estimateEmailError } = await supabase.functions.invoke('send-estimate', {
          body: {
            estimateId: estimate.id,
            recipientEmail: 'test@example.com',
            customMessage: 'This is a test estimate email.'
          }
        });
        
        if (estimateEmailError) {
          console.error('❌ Estimate email test failed:', estimateEmailError);
        } else {
          console.log('✅ Estimate email test result:', estimateEmailResult);
        }
      } catch (error) {
        console.error('❌ Estimate email test error:', error);
      }
    }

    // Test 5: Test Estimate SMS Sending
    if (estimate) {
      console.log('\n📱 Testing Estimate SMS Sending...');
      try {
        const { data: estimateSmsResult, error: estimateSmsError } = await supabase.functions.invoke('send-estimate-sms', {
          body: {
            estimateId: estimate.id,
            recipientPhone: '+1234567890', // Test phone number
            customMessage: 'This is a test estimate SMS.'
          }
        });
        
        if (estimateSmsError) {
          console.error('❌ Estimate SMS test failed:', estimateSmsError);
        } else {
          console.log('✅ Estimate SMS test result:', estimateSmsResult);
        }
      } catch (error) {
        console.error('❌ Estimate SMS test error:', error);
      }
    }

    // Test 6: Test Invoice SMS Sending (if invoice exists)
    if (invoice) {
      console.log('\n💰 Testing Invoice SMS Sending...');
      try {
        const { data: invoiceSmsResult, error: invoiceSmsError } = await supabase.functions.invoke('send-invoice-sms', {
          body: {
            invoiceId: invoice.id,
            recipientPhone: '+1234567890',
            customMessage: 'This is a test invoice SMS.'
          }
        });
        
        if (invoiceSmsError) {
          console.error('❌ Invoice SMS test failed:', invoiceSmsError);
        } else {
          console.log('✅ Invoice SMS test result:', invoiceSmsResult);
        }
      } catch (error) {
        console.error('❌ Invoice SMS test error:', error);
      }
    }

    // Test 7: Portal Access Token Validation
    console.log('\n🔑 Testing Portal Access Token...');
    if (estimate?.portal_access_token) {
      const portalUrl = `https://hub.fixlify.app/portal/estimate/${estimate.portal_access_token}`;
      console.log('🔗 Portal URL:', portalUrl);
      console.log('📝 To test: Open this URL in a new tab');
    } else {
      console.log('⚠️ No portal access token found on estimate');
    }

    console.log('\n🎉 Comprehensive testing complete!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Check each test result above');
    console.log('✅ Verify portal links work by clicking them');
    console.log('✅ Check your email for test messages');
    console.log('✅ Check if SMS was sent (if Telnyx is configured)');

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
  }
}

runComprehensiveTests();