import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Automation Scheduler started at', new Date().toISOString());
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, cleanup any stuck automations (running for more than 5 minutes)
    const { error: cleanupError } = await supabaseClient
      .from('automation_execution_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: 'Automation timed out - exceeded 5 minute limit'
      })
      .eq('status', 'running')
      .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (cleanupError) {
      console.warn('⚠️ Failed to cleanup stuck automations:', cleanupError);
    }

    // Get pending automation logs (limit 5 to process faster)
    const { data: pendingLogs, error: fetchError } = await supabaseClient
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5); // Reduced from 10 to 5 for faster processing

    if (fetchError) {
      console.error('❌ Error fetching pending logs:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${pendingLogs?.length || 0} pending automations`);

    const results = [];
    
    for (const log of pendingLogs || []) {
      console.log(`⚙️ Processing automation ${log.id}`);
      
      try {
        // Use a transaction-like approach: update to running with a check
        const { data: updateData, error: updateError } = await supabaseClient
          .from('automation_execution_logs')
          .update({ 
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', log.id)
          .eq('status', 'pending') // Only update if still pending
          .select()
          .single();

        if (updateError || !updateData) {
          console.log(`⏭️ Skipping ${log.id} - already being processed`);
          continue;
        }

        // Set a timeout for the automation execution (30 seconds max)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Execution timeout after 30 seconds')), 30000);
        });

        // Execute the automation with timeout
        const executionPromise = supabaseClient.functions.invoke('automation-executor', {
          body: {
            workflowId: log.workflow_id,
            executionId: log.id,
            context: log.trigger_data
          }
        });

        // Race between execution and timeout
        const { data, error } = await Promise.race([
          executionPromise,
          timeoutPromise
        ]).catch(err => ({ data: null, error: err }));

        if (error) {
          console.error(`❌ Failed ${log.id}:`, error.message);
          
          await supabaseClient
            .from('automation_execution_logs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error.message || 'Unknown error'
            })
            .eq('id', log.id);
            
          results.push({ id: log.id, status: 'failed', error: error.message });
        } else {
          console.log(`✅ Completed ${log.id}`);
          
          // The automation-executor should have updated the status
          // But let's ensure it's marked as completed
          await supabaseClient
            .from('automation_execution_logs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', log.id)
            .eq('status', 'running'); // Only update if still running
            
          results.push({ id: log.id, status: 'success' });
        }
        
      } catch (error) {
        console.error(`💥 Error processing ${log.id}:`, error);
        
        // Mark as failed
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message || 'Unexpected error'
          })
          .eq('id', log.id);
          
        results.push({ id: log.id, status: 'error', error: error.message });
      }
    }

    const response = {
      success: true,
      processed: results.length,
      timestamp: new Date().toISOString(),
      results: results
    };
    
    console.log('✅ Scheduler completed:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Scheduler error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
