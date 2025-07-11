// Unassign ALL phone numbers - make them available to claim
console.log('🔧 Unassigning ALL phone numbers...\n');

async function unassignAllNumbers() {
  try {
    const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
    if (!authToken) {
      console.error('❌ Please log in to Fixlify first!');
      return;
    }
    
    console.log('📱 Getting all phone numbers...');
    
    // Get all numbers from database
    const { data: allNumbers, error: fetchError } = await supabase
      .from('telnyx_phone_numbers')
      .select('*')
      .order('phone_number');
    
    if (fetchError) {
      console.error('❌ Error fetching numbers:', fetchError);
      return;
    }
    
    console.log(`Found ${allNumbers.length} phone numbers\n`);
    
    // Unassign each number
    let successCount = 0;
    let errorCount = 0;
    
    for (const number of allNumbers) {
      try {
        const { error } = await supabase
          .from('telnyx_phone_numbers')
          .update({ 
            user_id: null,
            status: 'available'
          })
          .eq('id', number.id);
        
        if (error) {
          errorCount++;
          console.error(`❌ Failed to unassign ${number.phone_number}:`, error.message);
        } else {
          successCount++;
          console.log(`✅ Unassigned ${number.phone_number} - now available to claim`);
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error with ${number.phone_number}:`, err);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully unassigned: ${successCount} numbers`);
    console.log(`❌ Failed: ${errorCount} numbers`);
    console.log(`📱 Total available to claim: ${successCount} numbers\n`);
    
    // Verify the changes
    console.log('🔍 Verifying changes...\n');
    
    const { data: updatedNumbers } = await supabase
      .from('telnyx_phone_numbers')
      .select('phone_number, user_id, status')
      .order('phone_number');
    
    console.log('All phone numbers status:');
    updatedNumbers.forEach(num => {
      const status = num.user_id ? '❌ Still assigned' : '✅ Available';
      console.log(`${status} - ${num.phone_number}`);
    });
    
    console.log('\n🎉 Done! All numbers are now available to claim.');
    console.log('🔄 Refreshing page in 3 seconds...');
    
    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run it
unassignAllNumbers();
