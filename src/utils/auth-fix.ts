import { supabase } from '@/integrations/supabase/client';

export async function fixAuthIssues() {
  console.log('🔧 Attempting to fix authentication issues...');
  
  try {
    // Clear all auth-related storage
    console.log('🧹 Clearing auth storage...');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('fixlify-auth-token');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Sign out completely
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test connection
    console.log('🔌 Testing connection...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
    } else {
      console.log('✅ Connection successful, session:', session ? 'exists' : 'cleared');
    }
    
    console.log('✨ Auth cleanup complete. Try signing in again.');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return { success: false, error };
  }
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).fixAuthIssues = fixAuthIssues;
} 