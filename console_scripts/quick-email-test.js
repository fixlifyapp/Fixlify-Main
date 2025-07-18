// Quick test for email functionality
// Copy and paste this into browser console

console.log('Testing Supabase functions...');

// Test 1: Check if supabase is available
if (window.supabase) {
  console.log('✅ Supabase client found');
} else {
  console.error('❌ Supabase client not found');
}

// Test 2: Check session
window.supabase.auth.getSession().then(({data: {session}}) => {
  if (session) {
    console.log('✅ Session active:', session.user.email);
  } else {
    console.error('❌ No active session');
  }
});

// Test 3: Simple function call
window.supabase.functions.invoke('mailgun-email', {
  body: {
    to: 'test@example.com',
    subject: 'Test from Console',
    html: '<p>This is a test email</p>',
    text: 'This is a test email'
  }
}).then(({data, error}) => {
  if (error) {
    console.error('❌ Email test failed:', error);
  } else {
    console.log('✅ Email test succeeded:', data);
  }
});
