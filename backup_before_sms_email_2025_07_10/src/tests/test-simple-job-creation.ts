import { supabase } from '@/integrations/supabase/client';
import { generateNextId } from '@/utils/idGeneration';

export const testSimpleJobCreation = async () => {
  console.log('🧪 Testing simple job creation...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No user logged in');
      return false;
    }
    
    console.log('👤 Current user:', user.email);
    
    // Generate job ID
    const jobId = await generateNextId('job');
    console.log('🆔 Generated job ID:', jobId);
    
    // Create minimal job data
    const jobData = {
      id: jobId,
      title: 'Test Job - ' + new Date().toISOString(),
      status: 'New',
      user_id: user.id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📦 Job data:', jobData);
    
    // Insert job
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating job:', error);
      return false;
    }
    
    console.log('✅ Job created successfully:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testSimpleJobCreation = testSimpleJobCreation;
}
