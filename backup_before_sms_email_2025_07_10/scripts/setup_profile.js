// Script to create/update profile with specific ID
// Run this in the browser console when logged in as an admin

async function setupProfile() {
  const targetProfileId = '40019793-a458-4eb0-a0d1-edc0565927fb';
  
  console.log('Setting up profile:', targetProfileId);
  
  // Get Supabase client
  const { supabase } = window;
  if (!supabase) {
    console.error('Supabase client not found. Make sure you are on the Fixlify app.');
    return;
  }
  
  try {
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Not authenticated:', userError);
      return;
    }
    
    console.log('Current user:', user.id);
    
    // Check if the target profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetProfileId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError);
      return;
    }
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return;
    }
    
    // Create the profile
    console.log('Creating new profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: targetProfileId,
        user_id: targetProfileId,
        organization_id: '00000000-0000-0000-0000-000000000001',
        role: 'admin',
        name: 'Test User',
        email: 'test@fixlify.app'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating profile:', createError);
      
      // If the user doesn't exist in auth.users, we need to create it first
      if (createError.message.includes('auth.users')) {
        console.log('Note: The user needs to exist in auth.users first.');
        console.log('You can create a user through Supabase dashboard or use proper auth signup flow.');
      }
      return;
    }
    
    console.log('Profile created successfully:', newProfile);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Alternative: Update current user's profile ID (NOT RECOMMENDED)
async function updateCurrentUserProfileId() {
  const targetProfileId = '40019793-a458-4eb0-a0d1-edc0565927fb';
  
  console.log('WARNING: This will change your current profile ID!');
  console.log('This is generally not recommended as it may break references.');
  
  const confirm = window.confirm('Are you sure you want to change your profile ID?');
  if (!confirm) return;
  
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Not authenticated');
    return;
  }
  
  // This would require raw SQL access which we don't have from the client
  console.log('To change profile IDs, you need to:');
  console.log('1. Access Supabase SQL Editor');
  console.log('2. Run UPDATE queries to change the ID');
  console.log('3. Update all foreign key references');
  console.log('');
  console.log('It\'s better to use the existing profile ID or create proper test data.');
}

// Check what profile is currently being used
async function checkCurrentProfile() {
  const { supabase } = window;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Not authenticated');
    return;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  console.log('Current user ID:', user.id);
  console.log('Current profile:', profile);
  console.log('Target profile ID:', '40019793-a458-4eb0-a0d1-edc0565927fb');
}

console.log('=== Profile Setup Script ===');
console.log('Available functions:');
console.log('- setupProfile() - Create the profile with ID 40019793-a458-4eb0-a0d1-edc0565927fb');
console.log('- checkCurrentProfile() - Check your current profile');
console.log('- updateCurrentUserProfileId() - Change current profile ID (not recommended)');
console.log('');
console.log('Run checkCurrentProfile() first to see current state.');

// Auto-run check
checkCurrentProfile();
