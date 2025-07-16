// Quick test script to debug jobs loading issue
// Run this in the browser console when on a client details page

(async () => {
  console.group('🔍 Jobs Loading Test');
  
  try {
    // Get current URL and extract client ID
    const url = window.location.pathname;
    const clientIdMatch = url.match(/clients\/([a-f0-9-]+)/);
    const clientId = clientIdMatch ? clientIdMatch[1] : null;
    
    console.log('Current URL:', url);
    console.log('Extracted Client ID:', clientId);
    
    if (!clientId) {
      console.error('❌ No client ID found in URL');
      return;
    }
    
    // Import Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Test 1: Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Current user:', user?.email, user?.id);
    
    // Test 2: Check organization context
    const orgId = localStorage.getItem('organizationId');
    console.log('📍 Organization ID:', orgId);
    
    // Test 3: Test direct client query
    console.log('\n🔄 Testing client query...');
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError) {
      console.error('❌ Client query error:', clientError);
    } else {
      console.log('✅ Client found:', client);
      console.log('  - Name:', client.name);
      console.log('  - Org ID:', client.organization_id);
    }
    
    // Test 4: Test jobs query
    console.log('\n🔄 Testing jobs query...');
    const { data: jobs, error: jobsError, count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .limit(5);
    
    if (jobsError) {
      console.error('❌ Jobs query error:', jobsError);
    } else {
      console.log(`✅ Jobs found: ${jobs?.length || 0} (Total: ${count})`);
      if (jobs && jobs.length > 0) {
        console.table(jobs.map(j => ({
          id: j.id,
          title: j.title,
          status: j.status,
          org_id: j.organization_id,
          client_id: j.client_id
        })));
      }
    }
    
    // Test 5: Check if organization matches
    if (client && jobs && jobs.length > 0) {
      const mismatchedJobs = jobs.filter(j => j.organization_id !== client.organization_id);
      if (mismatchedJobs.length > 0) {
        console.warn('⚠️ Found jobs with mismatched organization_id:', mismatchedJobs);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    console.groupEnd();
  }
})();
