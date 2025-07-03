// Console script to fix authentication issues
// Run this in the browser console if you see blank pages

console.log('🔧 Running Fixlify Authentication Fix...');

// Clear all auth-related data
const clearAuth = () => {
  console.log('🗑️ Clearing authentication data...');
  
  // Remove specific auth keys
  localStorage.removeItem('fixlify-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear all supabase-related keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('fixlify'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`  Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear session storage too
  sessionStorage.clear();
  
  console.log('✅ Authentication data cleared');
};

// Clear auth and redirect
clearAuth();

console.log('🔄 Redirecting to login page...');
window.location.href = '/auth';

// Instructions for manual fix
console.log(`
📋 If automatic redirect doesn't work, please:
1. Go to: ${window.location.origin}/auth
2. Log in with your credentials
3. The dashboard should load properly

If issues persist:
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check if cookies are enabled
`);
