// run-production-tests.js
// Run this in browser console or as Node script

async function testProductionReadiness() {
  const results = {
    passed: [],
    warnings: [],
    failed: []
  };

  console.log('🔍 FIXLIFY PRODUCTION READINESS CHECK\n');

  // 1. Security Checks
  console.log('🔐 Security Tests...');
  
  // Check Supabase RLS
  const { data: rlsCheck } = await window.supabase.rpc('check_data_consistency');
  if (rlsCheck) {
    rlsCheck.forEach(issue => {
      if (issue.count > 0) {
        results.warnings.push(`${issue.issue}: ${issue.count} records`);
      }
    });
  }
  
  // Check exposed keys
  if (window.supabase.auth.admin) {
    results.failed.push('Service role key exposed in frontend!');
  } else {
    results.passed.push('API keys properly secured');
  }

  // 2. Critical Flow Tests
  console.log('🔄 Testing Critical Flows...');
  
  // Test job creation flow
  try {
    const { data: testClient } = await window.supabase
      .from('clients')
      .select('id')
      .limit(1)
      .single();
    
    if (testClient) {
      results.passed.push('Client query working');
    }
  } catch (e) {
    results.failed.push('Cannot query clients');
  }

  // Test AI webhook
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/ai-assistant-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { 
          payload: { 
            telnyx_agent_target: '+14375249932' 
          } 
        } 
      })
    });
    
    if (response.ok) {
      results.passed.push('AI webhook responding');
    } else {
      results.failed.push('AI webhook error');
    }
  } catch (e) {
    results.failed.push('AI webhook unreachable');
  }

  // 3. Data Integrity
  console.log('📊 Checking Data Integrity...');
  
  const { data: orphanedJobs } = await window.supabase
    .from('jobs')
    .select('id')
    .is('client_id', null);
  
  if (orphanedJobs?.length > 0) {
    results.warnings.push(`${orphanedJobs.length} orphaned jobs found`);
  }

  // 4. Performance Check
  console.log('⚡ Performance Tests...');
  
  const perfStart = Date.now();
  const { data: jobs } = await window.supabase
    .from('jobs')
    .select('*')
    .limit(50);
  const loadTime = Date.now() - perfStart;
  
  if (loadTime < 1000) {
    results.passed.push(`Database response: ${loadTime}ms`);
  } else {
    results.warnings.push(`Slow database: ${loadTime}ms`);
  }

  // 5. Browser Compatibility
  const features = {
    'WebSocket': typeof WebSocket !== 'undefined',
    'LocalStorage': typeof localStorage !== 'undefined',
    'Fetch API': typeof fetch !== 'undefined'
  };
  
  Object.entries(features).forEach(([feature, supported]) => {
    if (supported) {
      results.passed.push(`${feature} supported`);
    } else {
      results.failed.push(`${feature} not supported`);
    }
  });

  // Generate Report
  console.log('\n📋 PRODUCTION READINESS REPORT');
  console.log('================================\n');
  
  console.log(`✅ PASSED (${results.passed.length}):`);
  results.passed.forEach(item => console.log(`  ✓ ${item}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(item => console.log(`  ! ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(item => console.log(`  ✗ ${item}`));
  }
  
  // Final verdict
  const ready = results.failed.length === 0;
  console.log('\n' + (ready ? 
    '🎉 APP IS READY FOR PRODUCTION!' : 
    '⛔ FIX CRITICAL ISSUES BEFORE PRODUCTION'));
  
  return { ready, results };
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.supabase) {
  testProductionReadiness();
} else {
  console.log('Run this in browser console where Supabase is loaded');
}