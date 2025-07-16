// Debug utility for jobs loading issues

import { supabase } from "@/integrations/supabase/client";

export const debugJobsLoading = async (clientId?: string) => {
  console.group('🔍 Jobs Loading Debug');
  
  try {
    // 1. Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Auth error:', userError);
      return;
    }
    console.log('✅ Current user:', user?.id, user?.email);
    
    // 2. Check organization context
    const orgId = localStorage.getItem('organizationId');
    console.log('📍 Organization ID from localStorage:', orgId);
    
    // 3. Test direct query
    console.log('🔄 Testing direct jobs query...');
    let testQuery = supabase
      .from('jobs')
      .select('id, title, client_id, status, created_at')
      .limit(5);
    
    if (clientId) {
      console.log('🎯 Filtering by client_id:', clientId);
      testQuery = testQuery.eq('client_id', clientId);
    }
    
    const { data: jobs, error: jobsError, count } = await testQuery;
    
    if (jobsError) {
      console.error('❌ Jobs query error:', jobsError);
    } else {
      console.log(`✅ Jobs found: ${jobs?.length || 0}`);
      console.log('📊 Sample jobs:', jobs);
    }
    
    // 4. Test client query if clientId provided
    if (clientId) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, name, organization_id')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error('❌ Client query error:', clientError);
      } else {
        console.log('✅ Client found:', client);
      }
    }
    
    // 5. Check RLS policies
    console.log('🔐 Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('check_rls_policies', { table_name: 'jobs' });
    
    if (!policyError && policies) {
      console.log('📋 RLS policies:', policies);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    console.groupEnd();
  }
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugJobsLoading = debugJobsLoading;
}
