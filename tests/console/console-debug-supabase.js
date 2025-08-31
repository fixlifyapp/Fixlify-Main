// Debug script to check supabase functions configuration
console.log('Checking Supabase configuration...');
console.log('Supabase URL:', window.supabase?.supabaseUrl);
console.log('Supabase instance:', window.supabase);

// Check if functions.invoke is available
if (window.supabase?.functions) {
  console.log('Functions object available:', window.supabase.functions);
  console.log('Invoke method:', window.supabase.functions.invoke);
} else {
  console.error('Functions object not available on supabase instance');
}

// Try a simple test
(async () => {
  const { data: { session } } = await window.supabase.auth.getSession();
  console.log('Current session:', session ? 'Active' : 'None');
  
  if (session) {
    console.log('Auth token:', session.access_token.substring(0, 20) + '...');
  }
})();
