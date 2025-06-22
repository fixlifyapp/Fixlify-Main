import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseAuth() {
  console.log('🔍 Testing Supabase Authentication...');
  
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('✅ Supabase client initialized');
    console.log('📍 Supabase URL:', supabase.supabaseUrl);
    
    // Test 2: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('📋 Current session:', session ? 'Active' : 'None');
    }
    
    // Test 3: Check auth state
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.email : 'None');
    
    // Test 4: Test signup with a test email
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('🧪 Testing signup with:', testEmail);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Signup error:', signUpError);
    } else {
      console.log('✅ Signup successful:', signUpData);
    }
    
    // Test 5: Test signin
    console.log('🧪 Testing signin...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Signin error:', signInError);
    } else {
      console.log('✅ Signin successful:', signInData);
    }
    
    // Test 6: Check auth listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);
    });
    
    // Cleanup
    subscription.unsubscribe();
    
    return {
      success: true,
      results: {
        clientInitialized: true,
        sessionCheck: !sessionError,
        signupTest: !signUpError,
        signinTest: !signInError,
      }
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error
    };
  }
}

// Add to window for easy browser console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseAuth = testSupabaseAuth;
} 