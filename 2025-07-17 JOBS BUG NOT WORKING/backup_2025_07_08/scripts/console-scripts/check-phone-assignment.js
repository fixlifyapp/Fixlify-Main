// Phone Number Assignment Debug Script
// This will check if your phone number is properly linked to your user account

async function checkPhoneNumberAssignment() {
    console.log('🔍 Phone Number Assignment Check');
    console.log('=================================');
    
    // 1. Get current user info
    const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
    if (!session || !session.access_token) {
        console.error('❌ Not logged in! Please log in first.');
        return;
    }
    
    console.log('📧 Current User:');
    console.log('   Email:', session.user.email);
    console.log('   User ID:', session.user.id);
    console.log('   Session User ID:', session.user.id);
    
    // 2. Check ALL phone numbers in the system
    console.log('\n📱 Fetching ALL Phone Numbers...');
    try {
        const allPhonesResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?select=*', {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
            }
        });
        
        const allPhones = await allPhonesResponse.json();
        console.log('   Total phone numbers found:', allPhones.length);
        
        allPhones.forEach((phone, index) => {
            console.log(`\n   Phone #${index + 1}:`);
            console.log('   📞 Number:', phone.phone_number);
            console.log('   👤 Assigned User ID:', phone.user_id || 'NOT ASSIGNED');
            console.log('   📊 Status:', phone.status);
            console.log('   🔑 Phone ID:', phone.id);
            console.log('   📅 Created:', new Date(phone.created_at).toLocaleString());
            
            if (phone.user_id === session.user.id) {
                console.log('   ✅ THIS PHONE IS ASSIGNED TO YOU!');
            } else if (!phone.user_id) {
                console.log('   ⚠️  This phone is not assigned to anyone');
            } else {
                console.log('   ❌ This phone is assigned to a different user');
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching all phones:', error);
    }
    
    // 3. Check what the SMS function would see (active phones for current user)
    console.log('\n🔎 Checking Phone Access for SMS Function...');
    try {
        // This mimics what the telnyx-sms edge function does
        const smsQueryResponse = await fetch(
            `https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?or=(user_id.eq.${session.user.id},user_id.is.null)&status=eq.active&limit=1`, 
            {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
                }
            }
        );
        
        const smsPhones = await smsQueryResponse.json();
        
        if (smsPhones.length === 0) {
            console.error('❌ NO PHONES AVAILABLE FOR SMS!');
            console.log('   The SMS function cannot find any phones for your user.');
            console.log('   This query looks for phones where:');
            console.log('   - user_id = your ID (' + session.user.id + ')');
            console.log('   - OR user_id is NULL (unassigned)');
            console.log('   - AND status = "active"');
        } else {
            console.log('✅ SMS Function would use:', smsPhones[0].phone_number);
            console.log('   User ID on phone:', smsPhones[0].user_id || 'NULL (available to all)');
        }
        
    } catch (error) {
        console.error('❌ Error checking SMS query:', error);
    }
    
    // 4. Check your profile for any phone number info
    console.log('\n👤 Checking Your Profile...');
    try {
        const profileResponse = await fetch(
            `https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/profiles?id=eq.${session.user.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
                }
            }
        );
        
        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
            const profile = profiles[0];
            console.log('   Profile ID:', profile.id);
            console.log('   Profile Email:', profile.email);
            console.log('   Profile Phone:', profile.phone || 'NOT SET');
            console.log('   User ID:', profile.user_id);
            console.log('   Organization ID:', profile.organization_id || 'NOT SET');
        }
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('Your User ID:', session.user.id);
    console.log('Your Email:', session.user.email);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('If no phones are assigned to you, the fix is to update the phone number assignment.');
    console.log('Run fixPhoneAssignment() to assign the first available phone to your user.');
}

// Function to fix phone assignment
async function fixPhoneAssignment() {
    const session = JSON.parse(localStorage.getItem('fixlify-auth-token'));
    if (!session) {
        console.error('❌ Not logged in!');
        return;
    }
    
    console.log('🔧 Attempting to fix phone assignment...');
    
    // Find an unassigned phone
    const response = await fetch(
        'https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?user_id=is.null&status=eq.active&limit=1',
        {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
            }
        }
    );
    
    const phones = await response.json();
    if (phones.length === 0) {
        console.log('❌ No unassigned phones available');
        console.log('You may need to update an existing phone assignment via Supabase dashboard');
        return;
    }
    
    const phoneToAssign = phones[0];
    console.log('📱 Found unassigned phone:', phoneToAssign.phone_number);
    
    // Update the phone assignment
    const updateResponse = await fetch(
        `https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?id=eq.${phoneToAssign.id}`,
        {
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
        }
    );
    
    if (updateResponse.ok) {
        console.log('✅ Successfully assigned phone to your user!');
        console.log('Run checkPhoneNumberAssignment() again to verify');
    } else {
        console.error('❌ Failed to update phone assignment');
        console.log('Status:', updateResponse.status);
        const error = await updateResponse.text();
        console.log('Error:', error);
    }
}

// Run the check
console.log('Running phone number assignment check...');
console.log('=====================================');
console.log('Available functions:');
console.log('- checkPhoneNumberAssignment() - Check current status');
console.log('- fixPhoneAssignment() - Assign an available phone to your user');
console.log('');

checkPhoneNumberAssignment();
