// Script to test SMS from Phone Numbers page
// Copy and paste this into browser console on http://localhost:8081/settings/phone-numbers

// Update the phone numbers array
async function updatePhoneNumbers() {
    console.log('🔄 Updating phone numbers status...');
    
    try {
        const { supabase } = window;
        
        // First, set all numbers to 'available' status
        const { data: phones, error: fetchError } = await supabase
            .from('telnyx_phone_numbers')
            .select('*');
            
        if (fetchError) {
            console.error('❌ Error fetching phones:', fetchError);
            return;
        }
        
        console.log('📱 Found phones:', phones);
        
        // Update status to 'active' for all phones
        for (const phone of phones) {
            if (phone.status !== 'active') {
                console.log(`Updating ${phone.phone_number} to active...`);
                const { error } = await supabase
                    .from('telnyx_phone_numbers')
                    .update({ status: 'active' })
                    .eq('id', phone.id);
                    
                if (error) {
                    console.error(`Failed to update ${phone.phone_number}:`, error);
                } else {
                    console.log(`✅ ${phone.phone_number} is now active`);
                }
            }
        }
        
        console.log('✅ Phone status update complete');
        console.log('🔄 Refresh the page to see changes');
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

// Test SMS with proper auth
async function testSMSWithAuth(phoneNumber, message) {
    console.log('📱 Testing SMS with authentication...');
    
    try {
        const { supabase } = window;
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error('❌ No active session. Please log in.');
            return;
        }
        
        console.log('✅ Session found');
        console.log('Access token prefix:', session.access_token.substring(0, 40) + '...');
        
        // Send SMS using the edge function
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
            body: {
                recipientPhone: phoneNumber || '+14377476737',
                message: message || 'Test SMS from Fixlify - ' + new Date().toLocaleString()
            }
        });
        
        if (error) {
            console.error('❌ SMS Error:', error);
            console.log('Full error:', {
                message: error.message,
                status: error.status,
                details: error
            });
        } else {
            console.log('✅ SMS Response:', data);
        }
        
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

// Show all available functions
console.log(`
📱 Phone Number Management Functions:
- updatePhoneNumbers() - Set all phones to 'active' status
- testSMSWithAuth() - Test SMS with current auth
- testSMSWithAuth('+1234567890', 'Custom message') - Test with custom number/message

Run these functions to manage phone numbers and test SMS.
`);

// Auto-run phone check
(async () => {
    const { supabase } = window;
    const { data: phones } = await supabase
        .from('telnyx_phone_numbers')
        .select('*');
    console.log('📱 Current phone numbers:', phones);
})();
