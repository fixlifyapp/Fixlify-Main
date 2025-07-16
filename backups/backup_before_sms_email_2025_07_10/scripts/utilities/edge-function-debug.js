// Copy and paste this into the browser console to test the Edge Function

// Test 1: Check if you're logged in
const checkAuth = async () => {
  const { data: { session } } = await window.supabase.auth.getSession();
  console.log('Logged in:', !!session);
  console.log('User ID:', session?.user?.id);
  return session;
};

// Test 2: Direct Edge Function call
const testEdgeFunction = async () => {
  const session = await checkAuth();
  if (!session) {
    console.error('Not logged in!');
    return;
  }

  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/generate-with-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      },
      body: JSON.stringify({
        prompt: 'Create a simple test automation',
        context: 'You are an automation assistant',
        mode: 'text',
        temperature: 0.7
      })
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      console.error('Edge function failed:', response.status, text);
    } else {
      const data = JSON.parse(text);
      console.log('Success! AI response:', data.generatedText);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Test 3: Test via Supabase client
const testViaSupabase = async () => {
  try {
    const { data, error } = await window.supabase.functions.invoke('generate-with-ai', {
      body: {
        prompt: 'Test prompt',
        context: 'Test context',
        mode: 'text'
      }
    });

    if (error) {
      console.error('Supabase invoke error:', error);
    } else {
      console.log('Supabase invoke success:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

console.log('Test functions loaded. Run:');
console.log('- checkAuth() to verify login');
console.log('- testEdgeFunction() to test direct call');
console.log('- testViaSupabase() to test via Supabase client');
