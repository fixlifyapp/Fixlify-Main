// Console script to quickly test job loading for a client
// Copy and paste this into the browser console

// Get the client ID from the URL
const clientId = window.location.pathname.match(/clients\/([a-f0-9-]+)/)?.[1];
if (!clientId) {
  console.error('❌ Not on a client details page');
} else {
  console.log('🎯 Testing jobs for client:', clientId);
  
  // Run the debug function
  if (window.debugJobsLoading) {
    window.debugJobsLoading(clientId);
  } else {
    console.error('❌ Debug function not available. Make sure you are on the Jobs tab.');
  }
}
