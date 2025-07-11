// Auth fix utility to handle authentication issues

export const clearAuthAndReload = () => {
  // Clear all auth-related localStorage items
  localStorage.removeItem('fixlify-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear any other potential auth keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Reload the page to force re-authentication
  window.location.href = '/auth';
};

export const checkAndFixAuth = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.log('No valid session found, redirecting to auth...');
      clearAuthAndReload();
      return false;
    }
    
    // Check if token is expired
    const expiresAt = session.expires_at;
    if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
      console.log('Session expired, clearing auth...');
      clearAuthAndReload();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    clearAuthAndReload();
    return false;
  }
};

// Auto-fix function to run on auth errors
export const setupAuthErrorHandler = () => {
  // Listen for auth errors in fetch responses
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Check if this is a Supabase request with auth error
      if (response.status === 400 || response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        if (url && url.includes('supabase')) {
          console.log('Auth error detected, attempting to fix...');
          // Don't immediately clear auth, let the auth state handler deal with it
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };
};
