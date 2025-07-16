// Edge Function Management Examples for Fixlify
// This file demonstrates how to use Supabase MCP for edge function management

import { supabase } from '@/integrations/supabase/client';

// ============================================
// 1. LIST ALL EDGE FUNCTIONS
// ============================================
export async function listAllEdgeFunctions() {
  try {
    console.log('📋 Listing all edge functions...');
    
    // Using Supabase MCP to list edge functions
    const functions = await supabase.functions.list();
    
    console.log(`Found ${functions.length} edge functions:`);
    functions.forEach(func => {
      console.log(`- ${func.name} (${func.slug}) - Status: ${func.status}`);
    });
    
    return functions;
  } catch (error) {
    console.error('Error listing edge functions:', error);
    throw error;
  }
}

// ============================================
// 2. DEPLOY A NEW EDGE FUNCTION
// ============================================
export async function deployCustomEdgeFunction() {
  const functionCode = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, data } = await req.json();
    
    // Custom business logic here
    let result;
    
    switch (action) {
      case 'calculate_estimate':
        result = await calculateEstimate(data, supabase);
        break;
      case 'generate_report':
        result = await generateReport(data, supabase);
        break;
      default:
        throw new Error('Unknown action');
    }
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function calculateEstimate(data, supabase) {
  // Business logic for estimate calculation
  const { serviceType, hours, materials } = data;
  const laborRate = 75; // per hour
  const markup = 1.2; // 20% markup
  
  const laborCost = hours * laborRate;
  const materialsCost = materials.reduce((sum, item) => sum + item.cost, 0);
  const totalCost = (laborCost + materialsCost) * markup;
  
  return {
    laborCost,
    materialsCost,
    totalCost,
    breakdown: {
      serviceType,
      hours,
      materials
    }
  };
}

async function generateReport(data, supabase) {
  // Business logic for report generation
  const { startDate, endDate, reportType } = data;
  
  // Fetch relevant data from database
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
    
  // Process and return report data
  return {
    reportType,
    period: { startDate, endDate },
    totalJobs: jobs.length,
    totalRevenue: jobs.reduce((sum, job) => sum + (job.revenue || 0), 0),
    jobs: jobs
  };
}
`;

  try {
    console.log('🚀 Deploying custom edge function...');
    
    const deployment = await supabase.functions.deploy('business-tools', {
      files: [{
        name: 'index.ts',
        content: functionCode
      }]
    });
    
    console.log('✅ Edge function deployed successfully!');
    return deployment;
  } catch (error) {
    console.error('Error deploying edge function:', error);
    throw error;
  }
}

// ============================================
// 3. INVOKE EDGE FUNCTIONS
// ============================================
export async function invokeEdgeFunctions() {
  try {
    // Example 1: Send an email
    console.log('📧 Sending email...');
    const emailResult = await supabase.functions.invoke('send-email', {
      body: {
        to: 'customer@example.com',
        subject: 'Service Appointment Reminder',
        html: `
          <h2>Appointment Reminder</h2>
          <p>Your service appointment is scheduled for tomorrow at 2:00 PM.</p>
          <p>Thank you for choosing Fixlify!</p>
        `,
        text: 'Your service appointment is scheduled for tomorrow at 2:00 PM.'
      }
    });
    console.log('Email sent:', emailResult);

    // Example 2: Generate AI content
    console.log('🤖 Generating AI content...');
    const aiResult = await supabase.functions.invoke('generate-with-ai', {
      body: {
        prompt: 'Create a professional follow-up message for a completed HVAC repair job',
        context: 'HVAC service business, job completed successfully, customer satisfaction focus',
        mode: 'text',
        temperature: 0.7
      }
    });
    console.log('AI generated content:', aiResult.data.generatedText);

    // Example 3: Send SMS notification
    console.log('📱 Sending SMS...');
    const smsResult = await supabase.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: '+1234567890',
        message: 'Your service technician will arrive in 30 minutes.',
        userId: 'current-user-id'
      }
    });
    console.log('SMS sent:', smsResult);

  } catch (error) {
    console.error('Error invoking edge functions:', error);
    throw error;
  }
}

// ============================================
// 4. MONITOR EDGE FUNCTION LOGS
// ============================================
export async function getEdgeFunctionLogs(functionName?: string) {
  try {
    console.log('📊 Getting edge function logs...');
    
    const logs = await supabase.functions.invoke('get_logs', {
      body: {
        service: 'edge-function',
        functionName: functionName,
        limit: 50
      }
    });
    
    console.log(`Found ${logs.data.length} log entries`);
    logs.data.forEach(log => {
      console.log(`[${log.timestamp}] ${log.level}: ${log.message}`);
    });
    
    return logs.data;
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
}

// ============================================
// 5. AUTOMATION WORKFLOW EXAMPLE
// ============================================
export async function executeAutomationWorkflow(jobId: string) {
  try {
    console.log('⚙️ Executing automation workflow...');
    
    // First, get job details
    const { data: job } = await supabase
      .from('jobs')
      .select('*, clients(*)')
      .eq('id', jobId)
      .single();
    
    if (!job) throw new Error('Job not found');
    
    // Execute automation
    const result = await supabase.functions.invoke('automation-executor', {
      body: {
        workflowId: 'job-completion-workflow',
        triggeredBy: 'manual',
        entityId: jobId,
        entityType: 'job',
        context: {
          clientId: job.client_id,
          clientName: job.clients.name,
          clientEmail: job.clients.email,
          clientPhone: job.clients.phone,
          jobTitle: job.title,
          jobStatus: job.status,
          revenue: job.revenue
        }
      }
    });
    
    console.log('✅ Automation workflow executed:', result);
    return result;
  } catch (error) {
    console.error('Error executing automation:', error);
    throw error;
  }
}

// ============================================
// 6. BATCH OPERATIONS
// ============================================
export async function batchSendNotifications(notifications: Array<{
  type: string;
  recipient: string;
  data: any;
}>) {
  console.log(`📨 Sending ${notifications.length} notifications...`);
  
  const results = await Promise.allSettled(
    notifications.map(async (notification) => {
      if (notification.recipient.includes('@')) {
        // Email
        return supabase.functions.invoke('send-email', {
          body: {
            to: notification.recipient,
            subject: `Notification: ${notification.type}`,
            html: `<p>${notification.data.message}</p>`,
            text: notification.data.message
          }
        });
      } else {
        // SMS
        return supabase.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: notification.recipient,
            message: notification.data.message
          }
        });
      }
    })
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`✅ Sent ${successful} notifications, ${failed} failed`);
  return results;
}

// ============================================
// 7. ERROR HANDLING AND RETRY LOGIC
// ============================================
export async function invokeWithRetry(
  functionName: string,
  payload: any,
  maxRetries = 3
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} for ${functionName}`);
      
      const result = await supabase.functions.invoke(functionName, {
        body: payload
      });
      
      if (result.error) throw result.error;
      
      console.log(`✅ Successfully invoked ${functionName}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// ============================================
// 8. USAGE EXAMPLES IN COMPONENTS
// ============================================
export const EdgeFunctionExamples = {
  // Use in a React component
  async sendInvoiceEmail(invoiceId: string) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, clients(*), jobs(*)')
      .eq('id', invoiceId)
      .single();
    
    return supabase.functions.invoke('send-invoice', {
      body: {
        invoiceId,
        recipientEmail: invoice.clients.email,
        invoiceData: invoice
      }
    });
  },
  
  // Use in an automation trigger
  async onJobCompleted(jobId: string) {
    // Trigger multiple actions
    await Promise.all([
      // Send completion notification
      supabase.functions.invoke('notifications', {
        body: {
          type: 'job_completed',
          jobId,
          recipients: ['client', 'technician']
        }
      }),
      
      // Generate AI follow-up
      supabase.functions.invoke('generate-with-ai', {
        body: {
          prompt: 'Generate follow-up email for completed job',
          context: { jobId },
          fetchBusinessData: true
        }
      }),
      
      // Execute automation workflow
      supabase.functions.invoke('automation-executor', {
        body: {
          workflowId: 'job-completion',
          entityId: jobId,
          entityType: 'job'
        }
      })
    ]);
  }
};

// Export all functions for use in components
export default {
  listAllEdgeFunctions,
  deployCustomEdgeFunction,
  invokeEdgeFunctions,
  getEdgeFunctionLogs,
  executeAutomationWorkflow,
  batchSendNotifications,
  invokeWithRetry,
  EdgeFunctionExamples
};
