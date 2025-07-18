// Fix for blank page and authentication errors
// Run this in browser console (F12) if you see blank pages or auth errors

console.log('🔧 Starting authentication fix...');

// Clear all auth-related data
const authKeys = [
  'fixlify-auth-token',
  'sb-mqppvcrlvsgrsqelglod-auth-token',
  'supabase.auth.token'
];

// Clear specific keys
authKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Cleared ${key}`);
});

// Clear all supabase-related items
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('fixlify') || key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared ${key}`);
  }
});

// Clear session storage too
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('fixlify') || key.includes('auth')) {
    sessionStorage.removeItem(key);
    console.log(`✅ Cleared session: ${key}`);
  }
});

console.log('✨ Auth data cleared successfully!');
console.log('🔄 Redirecting to login page...');

// Small delay before redirect
setTimeout(() => {
  window.location.href = '/login';
}, 1000);