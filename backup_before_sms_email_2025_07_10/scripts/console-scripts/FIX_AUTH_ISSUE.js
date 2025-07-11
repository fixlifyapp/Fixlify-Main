// Quick fix for authentication issues
// Run this in your browser console (F12)

console.log('🔧 Fixing authentication issues...');

// Clear old auth data
localStorage.removeItem('fixlify-auth-token');
localStorage.removeItem('sb-mqppvcrlvsgrsqelglod-auth-token');
localStorage.removeItem('sb-mqppvcrlvsgrsqelglod-auth-token-code-verifier');

// Clear session storage
sessionStorage.clear();

console.log('✅ Authentication data cleared');
console.log('🔄 Redirecting to login page...');

// Redirect to login
setTimeout(() => {
  window.location.href = '/login';
}, 1000);
