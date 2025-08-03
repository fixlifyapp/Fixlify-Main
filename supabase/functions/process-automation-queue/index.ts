import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing automation queue...')

    // Get pending automation logs older than 1 minute
    const { data: pendingLogs, error } = await supabase
      .from('automation_execution_logs')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 60000).toISOString())
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Error fetching pending logs:', error)
      throw error
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending automations to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${pendingLogs.length} pending automations`)
    const results = []
    
    for (const log of pendingLogs) {
      try {
        console.log(`Processing automation log ${log.id} for workflow ${log.workflow_id}`)
        
        // Update to running status
        await supabase
          .from('automation_execution_logs')
          .update({ 
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', log.id)

        // Call automation executor
        const response = await fetch(`${supabaseUrl}/functions/v1/automation-executor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workflowId: log.workflow_id,
            executionId: log.id,
            context: log.trigger_data
          })
        })

        const result = await response.json()
        const success = response.ok && !result.error
        
        // Update log status
        await supabase
          .from('automation_execution_logs')
          .update({
            status: success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            actions_executed: result.results || [],
            error_message: result.error || (success ? null : 'Unknown error')
          })
          .eq('id', log.id)

        // Update workflow counts
        if (log.workflow_id) {
          const countColumn = success ? 'success_count' : 'failure_count'
          await supabase.rpc('increment_counter', {
            table_name: 'automation_workflows',
            column_name: countColumn,
            row_id: log.workflow_id
          }).catch(() => {})
        }

        results.push({ 
          logId: log.id, 
          success,
          message: success ? 'Processed successfully' : result.error 
        })
        
        console.log(`Automation log ${log.id} processed: ${success ? 'success' : 'failed'}`)
      } catch (error) {
        console.error(`Error processing log ${log.id}:`, error)
        
        await supabase
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', log.id)

        results.push({ 
          logId: log.id, 
          success: false, 
          error: error.message 
        })
      }
    }

    console.log(`Processed ${results.length} automations`)
    
    return new Response(
      JSON.stringify({ 
        message: 'Processing complete',
        processed: results.length, 
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Queue processor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
