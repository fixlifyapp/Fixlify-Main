// Test SMS sending from browser console
// This script helps debug SMS sending issues

async function testSMS() {
    console.log('🔧 Testing SMS functionality...');
    
    try {
        // Get current auth token
        const token = localStorage.getItem('fixlify-auth-token');
        if (!token) {
            console.error('❌ No auth token found. Please log in first.');
            return;
        }
        
        const { access_token } = JSON.parse(token);
        console.log('✅ Auth token found');
        
        // Test phone number - change this to your test number
        const testPhone = '+14377476737'; // Example Canadian number
        const testMessage = 'Test SMS from Fixlify - ' + new Date().toLocaleString();
        
        console.log('📱 Sending test SMS to:', testPhone);
        console.log('📝 Message:', testMessage);
        
        // Get Supabase instance
        const { supabase } = window;
        
        // Test the edge function directly
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
            body: {
                recipientPhone: testPhone,
                message: testMessage
            }
        });
        
        if (error) {
            console.error('❌ SMS Error:', error);
            console.log('Error details:', {
                message: error.message,
                status: error.status,
                code: error.code
            });
        } else {
            console.log('✅ SMS Response:', data);
            if (data.success) {
                console.log('🎉 SMS sent successfully!');
                console.log('Message ID:', data.messageId);
                console.log('From:', data.from);
                console.log('To:', data.to);
            } else {
                console.log('⚠️ SMS failed:', data.error);
            }
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

// Function to check phone number assignment
async function checkPhoneAssignment() {
    console.log('📱 Checking phone number assignment...');
    
    try {
        const { supabase } = window;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('❌ Not logged in');
            return;
        }
        
        console.log('User ID:', user.id);
        
        // Check if user has a phone assigned
        const { data: phones, error } = await supabase
            .from('telnyx_phone_numbers')
            .select('*')
            .eq('user_id', user.id);
            
        if (error) {
            console.error('❌ Error fetching phones:', error);
            return;
        }
        
        if (phones && phones.length > 0) {
            console.log('✅ User has assigned phone(s):', phones);
        } else {
            console.log('⚠️ User has no assigned phone numbers');
            
            // Check for available phones
            const { data: available } = await supabase
                .from('telnyx_phone_numbers')
                .select('*')
                .is('user_id', null)
                .eq('status', 'active');
                
            console.log('Available phones for assignment:', available);
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

// Function to manually assign a phone
async function assignPhone(phoneId) {
    console.log('📱 Assigning phone...');
    
    try {
        const { supabase } = window;
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('❌ Not logged in');
            return;
        }
        
        const { data, error } = await supabase
            .from('telnyx_phone_numbers')
            .update({ user_id: user.id })
            .eq('id', phoneId);
            
        if (error) {
            console.error('❌ Error assigning phone:', error);
        } else {
            console.log('✅ Phone assigned successfully');
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

// Run the tests
console.log(`
📱 SMS Testing Functions Available:
- testSMS() - Send a test SMS
- checkPhoneAssignment() - Check your phone assignment
- assignPhone(phoneId) - Manually assign a phone

Run these functions in the console to test SMS functionality.
`);
