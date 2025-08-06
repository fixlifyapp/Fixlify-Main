import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Automation Scheduler started at', new Date().toISOString());
    
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all pending automation logs (max 10 at a time to prevent overload)
    const { data: pendingLogs, error: fetchError } = await supabaseClient
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching pending logs:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${pendingLogs?.length || 0} pending automations to process`);

    const results = [];
    
    // Process each pending log
    for (const log of pendingLogs || []) {
      console.log(`⚙️ Processing automation log ${log.id} for workflow ${log.workflow_id}`);
      
      try {
        // Mark as running to prevent duplicate processing
        await supabaseClient
          .from('automation_execution_logs')
          .update({ 
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', log.id)
          .eq('status', 'pending'); // Only update if still pending
        
        // Call the automation executor
        const { data, error } = await supabaseClient.functions.invoke('automation-executor', {
          body: {
            workflowId: log.workflow_id,
            executionId: log.id,
            context: log.trigger_data
          }
        });

        if (error) {
          console.error(`❌ Failed to execute automation ${log.id}:`, error);
          
          // Mark as failed
          await supabaseClient
            .from('automation_execution_logs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error.message
            })
            .eq('id', log.id);
            
          results.push({ id: log.id, status: 'failed', error: error.message });
        } else {
          console.log(`✅ Successfully executed automation ${log.id}`);
          results.push({ id: log.id, status: 'success' });
        }
        
        // Add small delay between executions to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`💥 Unexpected error processing log ${log.id}:`, error);
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
