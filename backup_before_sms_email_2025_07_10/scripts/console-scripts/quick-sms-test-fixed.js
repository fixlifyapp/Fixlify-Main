// Quick SMS Test - Fixed Version
// Run this in browser console while logged in to Fixlify

async function quickSMSTest() {
    console.log('🚀 Quick SMS Test Starting...');
    
    const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
    if (!session || !session.access_token) {
        console.error('❌ Please log in to Fixlify first!');
        return;
    }
    
    console.log('✅ Logged in as:', session.user.email);
    
    const phone = prompt('Enter phone number with country code (e.g., +12898192158):');
    if (!phone) {
        console.log('❌ Test cancelled - no phone number provided');
        return;
    }
    
    console.log('📱 Sending SMS to:', phone);
    
    try {
        const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
            },
            body: JSON.stringify({
                recipientPhone: phone,
                message: 'Test SMS from Fixlify at ' + new Date().toLocaleString()
            })
        });
        
        const result = await response.json();
        console.log('📡 Response:', result);
        
        if (result.success) {
            console.log('✅ SMS sent successfully!');
            console.log('   From:', result.from);
            console.log('   To:', result.to);
            console.log('   Message ID:', result.messageId);
            alert('✅ SMS sent! Check your phone.');
        } else {
            console.error('❌ Failed:', result.error);
            
            if (result.error === 'SMS service not configured. Please contact support.') {
                console.log('\n🔧 FIX: The TELNYX_API_KEY needs to be set in Supabase Edge Functions');
                console.log('   Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/functions');
                console.log('   Add secret: TELNYX_API_KEY = your_api_key');
            }
            
            alert('❌ Failed: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

// Run immediately
quickSMSTest();
