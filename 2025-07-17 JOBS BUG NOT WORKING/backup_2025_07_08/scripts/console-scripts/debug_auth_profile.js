// Debug script to check authentication and profile state
// Run this in the browser console

console.log('=== Authentication & Profile Debug ===');

async function debugAuth() {
  const { supabase } = window;
  
  if (!supabase) {
    console.error('Supabase client not found!');
    return;
  }
  
  try {
    // 1. Check current auth session
    console.log('\n1. Checking authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      console.log('Please login first');
      return;
    }
    
    console.log('✅ Active session found');
    console.log('User ID:', session.user.id);
    console.log('Email:', session.user.email);
    
    // 2. Check profile
    console.log('\n2. Checking profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      
      // Try to create profile if it doesn't exist
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, attempting to create...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            user_id: session.user.id,
            email: session.user.email,
            organization_id: '00000000-0000-0000-0000-000000000001',
            role: 'admin'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Failed to create profile:', createError);
        } else {
          console.log('✅ Profile created:', newProfile);
        }
      }
    } else {
      console.log('✅ Profile found:', profile);
    }
    
    // 3. Check messaging-related data
    console.log('\n3. Checking messaging system...');
    
    // Check for conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5);
    
    console.log('Conversations:', conversations?.length || 0);
    
    // Check for messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    console.log('Messages:', messages?.length || 0);
    
    // 4. Test edge function connectivity
    console.log('\n4. Testing edge functions...');
    
    const testEdgeFunction = async (functionName) => {
      try {
        const response = await fetch(
          `${supabase.supabaseUrl}/functions/v1/${functionName}`,
          {
            method: 'OPTIONS',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );
        console.log(`${functionName}:`, response.status, response.statusText);
      } catch (error) {
        console.error(`${functionName} error:`, error.message);
      }
    };
    
    await testEdgeFunction('send-estimate');
    await testEdgeFunction('send-invoice');
    await testEdgeFunction('send-estimate-sms');
    await testEdgeFunction('send-invoice-sms');
    
    // 5. Check current URL and navigation
    console.log('\n5. Current navigation state...');
    console.log('Current URL:', window.location.href);
    console.log('Path:', window.location.pathname);
    console.log('Search params:', window.location.search);
    
    // 6. Check for any errors in localStorage
    console.log('\n6. Checking for stored errors...');
    const storedAuth = localStorage.getItem('fixlify-auth-token');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        console.log('Stored auth expires at:', new Date(parsed.expires_at * 1000));
      } catch (e) {
        console.error('Failed to parse stored auth:', e);
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the debug function
debugAuth();

// Additional helper functions
window.fixProfile = async () => {
  console.log('Attempting to fix profile issues...');
  const { supabase } = window;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('No session found');
    return;
  }
  
  // Ensure profile exists
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({
      id: session.user.id,
      user_id: session.user.id,
      email: session.user.email,
      organization_id: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to fix profile:', error);
  } else {
    console.log('Profile fixed:', profile);
    window.location.reload();
  }
};

console.log('\n=== Available Commands ===');
console.log('debugAuth() - Run full authentication debug');
console.log('fixProfile() - Attempt to fix profile issues');
