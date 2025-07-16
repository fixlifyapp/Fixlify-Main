// Auto-fix script for authentication issues
// This will be injected into the app to handle auth errors

(function() {
  console.log('🔧 Auth auto-fix script loaded');
  
  // Monitor for auth errors
  let authErrorCount = 0;
  const MAX_AUTH_ERRORS = 3;
  
  // Override fetch to catch auth errors
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // Check for auth errors
      if (response.status === 400 || response.status === 401) {
        const url = args[0];
        const isSupabaseRequest = url && url.toString().includes('supabase');
        
        if (isSupabaseRequest) {
          const responseText = await response.clone().text();
          
          if (responseText.includes('refresh_token') || responseText.includes('Invalid Refresh Token')) {
            authErrorCount++;
            console.warn(`⚠️ Auth refresh error detected (${authErrorCount}/${MAX_AUTH_ERRORS})`);
            
            if (authErrorCount >= MAX_AUTH_ERRORS) {
              console.log('🔄 Too many auth errors, clearing session and redirecting...');
              
              // Clear all auth data
              localStorage.removeItem('fixlify-auth-token');
              sessionStorage.clear();
              
              // Clear all supabase keys
              Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes('auth')) {
                  localStorage.removeItem(key);
                }
              });
              
              // Redirect to auth page
              setTimeout(() => {
                window.location.href = '/auth';
              }, 100);
            }
          }
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  // Also check current auth state
  setTimeout(() => {
    const authToken = localStorage.getItem('fixlify-auth-token');
    if (authToken) {
      try {
        const tokenData = JSON.parse(authToken);
        const currentPath = window.location.pathname;
        
        // Check if we're stuck on a protected page without valid auth
        if (currentPath !== '/auth' && currentPath !== '/portal' && !currentPath.includes('/estimate') && !currentPath.includes('/invoice')) {
          if (!tokenData || !tokenData.access_token) {
            console.log('🚫 Invalid auth token detected, redirecting to login...');
            localStorage.removeItem('fixlify-auth-token');
            window.location.href = '/auth';
          }
        }
      } catch (e) {
        console.log('🚫 Corrupted auth token, clearing...');
        localStorage.removeItem('fixlify-auth-token');
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    }
  }, 1000);
})();
