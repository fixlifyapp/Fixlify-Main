// Debug script to check user and jobs access
console.log('🔍 Checking user and jobs access...\n');

// Get auth token
const authToken = localStorage.getItem('sb-mqppvcrlvsgrsqelglod-auth-token');
if (!authToken) {
  console.error('❌ Not logged in!');
} else {
  const auth = JSON.parse(authToken);
  const userId = auth.user?.id;
  const userEmail = auth.user?.email;
  
  console.log('✅ Current user:');
  console.log(`   ID: ${userId}`);
  console.log(`   Email: ${userEmail}`);
  
  // Expected job owners
  console.log('\n📋 Job ownership in database:');
  console.log('   petrusenkocorp@gmail.com owns: J-2000, J-2006, J-2017');
  console.log('   petrusenkocorp1@gmail.com owns: J-2003');
  
  console.log('\n💡 If you are logged in as a different user, you won\'t see these jobs due to RLS policies.');
  console.log('   The automation will only work for jobs you own.');
  
  // Test query
  if (window.location.pathname.includes('automation')) {
    console.log('\n🔧 To fix this:');
    console.log('1. Login as petrusenkocorp@gmail.com or petrusenkocorp1@gmail.com');
    console.log('2. Or create a new job for your current user');
    console.log('3. Then test the automation again');
  }
}
