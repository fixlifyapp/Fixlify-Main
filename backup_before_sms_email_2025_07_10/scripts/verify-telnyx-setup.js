// Script to verify Telnyx API key setup
// Run this in the browser console

async function verifyTelnyxSetup() {
    console.log('🔧 Telnyx Setup Verification');
    console.log('============================');
    
    // Get session
    const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
    if (!session) {
        console.error('❌ Not logged in!');
        return;
    }
    
    console.log('✅ Logged in as:', session.user.email);
    
    // Check if we can reach the edge function
    console.log('\n📡 Testing Edge Function Health...');
    try {
        const healthResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin
            }
        });
        
        if (healthResponse.ok) {
            console.log('✅ Edge function is reachable');
        } else {
            console.log('⚠️ Edge function returned:', healthResponse.status);
        }
    } catch (error) {
        console.error('❌ Cannot reach edge function:', error);
    }
    
    console.log('\n🔍 Troubleshooting Steps:');
    console.log('========================');
    console.log('1. Verify TELNYX_API_KEY in Supabase:');
    console.log('   Go to: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/functions');
    console.log('   Click on "Edge Functions" → "Manage Secrets"');
    console.log('   Make sure TELNYX_API_KEY is listed there');
    console.log('');
    console.log('2. Check the API key format:');
    console.log('   - Should start with "KEY" followed by alphanumeric characters');
    console.log('   - Example format: KEYxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   - No quotes or extra spaces');
    console.log('');
    console.log('3. Verify in your Telnyx account:');
    console.log('   - Log in to https://portal.telnyx.com');
    console.log('   - Go to "API Keys" section');
    console.log('   - Make sure the key is Active');
    console.log('   - Try creating a new API key if needed');
    console.log('');
    console.log('4. Wait for propagation:');
    console.log('   Edge function secrets can take 2-5 minutes to propagate');
    console.log('   If you just added/updated the key, wait a bit and try again');
    console.log('');
    console.log('5. Check Edge Function Logs:');
    console.log('   https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/telnyx-sms/logs');
    console.log('   Look for specific error messages about the API key');
    
    // Try to send a test with detailed error handling
    console.log('\n📱 Want to try sending a test SMS now?');
    const tryNow = confirm('Try sending a test SMS?');
    
    if (tryNow) {
        const phone = prompt('Enter phone number (with country code):');
        if (phone) {
            console.log('\n📤 Sending test SMS...');
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
                        message: 'Telnyx test from Fixlify - ' + new Date().toLocaleTimeString()
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ SUCCESS! SMS sent');
                    console.log('Message ID:', result.messageId);
                } else {
                    console.error('❌ Failed:', result.error);
                    
                    if (result.error === 'Authentication failed') {
                        console.log('\n🔴 TELNYX API KEY ISSUE DETECTED!');
                        console.log('The API key is either:');
                        console.log('1. Not set in Supabase Edge Functions');
                        console.log('2. Invalid or expired');
                        console.log('3. Not properly formatted');
                        console.log('\nACTION REQUIRED:');
                        console.log('1. Get a new API key from Telnyx');
                        console.log('2. Update it in Supabase Edge Functions');
                        console.log('3. Wait 5 minutes for propagation');
                    }
                }
            } catch (error) {
                console.error('❌ Error:', error);
            }
        }
    }
}

// Run verification
verifyTelnyxSetup();
