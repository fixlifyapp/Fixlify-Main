// Auto-fix script to reassign phone to current user
console.log('🔧 Auto-fixing phone assignment...\n');

const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
if (!session || !session.access_token) {
    console.error('❌ Not logged in!');
} else {
    console.log('📧 Current user:', session.user.email);
    console.log('🔑 Current user ID:', session.user.id);
    console.log('\n📱 Reassigning phone +12898192158 to your account...');
    
    // Get the phone record
    fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?phone_number=eq.%2B12898192158', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
        }
    })
    .then(r => r.json())
    .then(phones => {
        if (phones.length === 0) {
            console.error('❌ Phone not found!');
            return;
        }
        
        const phone = phones[0];
        console.log('📞 Found phone:', phone.phone_number);
        console.log('🔄 Updating assignment...');
        
        // Update the phone to current user
        return fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?id=eq.${phone.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: session.user.id
            })
        });
    })
    .then(r => r.json())
    .then(result => {
        if (result && result[0]) {
            console.log('\n✅ SUCCESS! Phone reassigned!');
            console.log('📱 Phone:', result[0].phone_number);
            console.log('👤 Now assigned to:', session.user.email);
            console.log('\n🎉 Ready to test SMS! Running test in 2 seconds...');
            
            // Auto-run SMS test
            setTimeout(() => {
                console.log('\n📤 Testing SMS...');
                const testPhone = prompt('Enter phone number to send test SMS to (e.g., +1234567890):');
                
                if (testPhone) {
                    fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
                        },
                        body: JSON.stringify({
                            recipientPhone: testPhone,
                            message: 'SMS test successful! Phone is now properly assigned - ' + new Date().toLocaleString()
                        })
                    })
                    .then(r => r.json())
                    .then(smsResult => {
                        if (smsResult.success) {
                            console.log('✅ SMS SENT SUCCESSFULLY!');
                            console.log('📱 From:', smsResult.from);
                            console.log('📱 To:', smsResult.to);
                            console.log('🆔 Message ID:', smsResult.messageId);
                            alert('✅ SMS sent! Check your phone.');
                        } else {
                            console.error('❌ SMS failed:', smsResult.error);
                            if (smsResult.error === 'Authentication failed') {
                                console.log('\n🔴 Telnyx API key issue! The key needs to be updated in Supabase.');
                            }
                        }
                    });
                }
            }, 2000);
        } else {
            console.error('❌ Failed to update phone assignment');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
}
