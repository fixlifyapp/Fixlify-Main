// Quick SMS Test - Run this in browser console while logged in to Fixlify

async function quickSMSTest() {
    const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
    if (!session) {
        console.error('Please log in first!');
        return;
    }
    
    const phone = prompt('Enter phone number with country code (e.g., +12898192158):');
    if (!phone) return;
    
    console.log('Sending SMS to:', phone);
    
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
        },
        body: JSON.stringify({
            recipientPhone: phone,
            message: 'Test SMS from Fixlify at ' + new Date().toLocaleTimeString()
        })
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (result.success) {
        console.log('✅ SMS sent successfully!');
        alert('SMS sent! Check your phone.');
    } else {
        console.error('❌ Failed:', result.error);
        alert('Failed: ' + result.error);
    }
}

quickSMSTest();
