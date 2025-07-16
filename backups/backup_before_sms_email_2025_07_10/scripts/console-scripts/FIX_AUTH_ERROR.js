// Quick fix for authentication errors
// Run this in your browser console if you see authentication errors

console.log('🔧 Starting authentication fix...');

// Clear all auth-related data
localStorage.removeItem('fixlify-auth-token');
localStorage.removeItem('sb-mqppvcrlvsgrsqelglod-auth-token');
localStorage.removeItem('supabase.auth.token');

// Clear all supabase-related items
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('fixlify')) {
    localStorage.removeItem(key);
  }
});

// Clear session storage too
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('fixlify')) {
    sessionStorage.removeItem(key);
  }
});

console.log('✅ Auth data cleared. Please refresh the page and login again.');

// Redirect to login
window.location.href = '/login';