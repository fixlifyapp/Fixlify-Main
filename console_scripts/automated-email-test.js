// Automated test script for email functionality
// This will be injected into the page

(async function() {
    console.log('🚀 Starting email functionality test...');
    
    // Check if we're on the Fixlify app
    if (!window.supabase) {
        console.error('❌ This script must be run on the Fixlify application');
        return;
    }
    
    // Test the email sending with current session
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
        console.error('❌ No active session. Please log in to Fixlify first.');
        return;
    }
    
    console.log('✅ Session active:', session.user.email);
    
    // Test mailgun directly
    console.log('\n📧 Testing mailgun-email edge function...');
    const mailgunTest = await window.supabase.functions.invoke('mailgun-email', {
        body: {
            to: 'test@example.com',
            subject: 'Direct Mailgun Test',
            html: '<p>This is a direct mailgun test</p>',
            text: 'This is a direct mailgun test',
            userId: session.user.id
        }
    });
    
    if (mailgunTest.error) {
        console.error('❌ Mailgun test failed:', mailgunTest.error);
    } else {
        console.log('✅ Mailgun test success:', mailgunTest.data);
    }
    
    // Get an estimate to test
    console.log('\n📄 Fetching estimates...');
    const { data: estimates, error: estError } = await window.supabase
        .from('estimates')
        .select('*, jobs(*, clients(*))')
        .limit(1);
        
    if (!estimates?.length) {
        console.error('❌ No estimates found');
        return;
    }
    
    const estimate = estimates[0];
    console.log('✅ Found estimate:', {
        number: estimate.estimate_number,
        total: estimate.total,
        client: estimate.jobs?.clients?.name
    });
    
    // Test send-estimate function
    console.log('\n📨 Testing send-estimate edge function...');
    const sendTest = await window.supabase.functions.invoke('send-estimate', {
        body: {
            estimateId: estimate.id,
            recipientEmail: 'test@example.com',
            customMessage: 'Automated test from console'
        }
    });
    
    if (sendTest.error) {
        console.error('❌ Send estimate failed:', sendTest.error);
        console.error('Error details:', JSON.stringify(sendTest.error, null, 2));
    } else {
        console.log('✅ Send estimate success:', sendTest.data);
        if (sendTest.data.portalLink) {
            console.log('📎 Portal link:', sendTest.data.portalLink);
        }
    }
    
    console.log('\n✅ Test completed!');
})();
