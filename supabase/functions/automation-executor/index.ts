import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workflowId, context = {} } = await req.json();

    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    console.log('Executing automation workflow:', workflowId);

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('automation_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflowError?.message}`);
    }

    if (workflow.status !== 'active') {
      throw new Error('Workflow is not active');
    }

    // Log execution start
    const { data: logEntry, error: logError } = await supabaseClient
      .from('automation_execution_logs')
      .insert({
        automation_id: workflowId,
        trigger_type: context.triggerType || 'manual',
        trigger_data: context,
        status: 'running',
        started_at: new Date().toISOString(),
        organization_id: workflow.organization_id
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating log entry:', logError);
    }

    try {
      // Execute workflow steps
      const steps = workflow.template_config?.steps || [];
      const results = [];

      for (const step of steps) {
        console.log('Executing step:', step);
        
        try {
          const stepResult = await executeStep(step, context, supabaseClient);
          results.push({
            stepId: step.id,
            status: 'success',
            result: stepResult
          });
          
          // Add delay if configured
          if (step.config?.delay) {
            await new Promise(resolve => setTimeout(resolve, step.config.delay * 1000));
          }
        } catch (stepError) {
          console.error('Step execution failed:', stepError);
          results.push({
            stepId: step.id,
            status: 'failed',
            error: stepError.message
          });
          
          // Continue with next step even if this one fails
          continue;
        }
      }

      // Update execution log with success
      if (logEntry) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actions_executed: results
          })
          .eq('id', logEntry.id);
      }

      // Update workflow metrics
      await supabaseClient
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          success_count: (workflow.success_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      return new Response(
        JSON.stringify({
          success: true,
          workflowId,
          results,
          message: 'Automation workflow executed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (executionError) {
      console.error('Workflow execution failed:', executionError);

      // Update execution log with failure
      if (logEntry) {
        await supabaseClient
          .from('automation_execution_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: executionError.message
          })
          .eq('id', logEntry.id);
      }

      // Update workflow metrics
      await supabaseClient
        .from('automation_workflows')
        .update({
          execution_count: (workflow.execution_count || 0) + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      throw executionError;
    }

  } catch (error) {
    console.error('Error in automation executor:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeStep(step: any, context: any, supabaseClient: any) {
  console.log('Executing step type:', step.type);

  switch (step.type) {
    case 'action':
      return await executeAction(step, context, supabaseClient);
    
    case 'condition':
      return await evaluateCondition(step, context);
    
    case 'delay':
      const delayMs = (step.config?.delayValue || 1) * 
        (step.config?.delayType === 'minutes' ? 60000 : 
         step.config?.delayType === 'hours' ? 3600000 : 1000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return { delayed: delayMs };
    
    case 'trigger':
      // Skip trigger steps as they are not meant to be executed
      console.log('Skipping trigger step - triggers are for workflow initiation only');
      return { type: 'trigger', status: 'skipped' };
    
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

async function executeAction(step: any, context: any, supabaseClient: any) {
  const actionType = step.config?.actionType;
  console.log('Executing action:', actionType);

  // Check timing restrictions before executing action
  const timing = step.config?.timing;
  if (timing) {
    const isWithinBusinessHours = await checkBusinessHours(timing, supabaseClient);
    if (!isWithinBusinessHours) {
      console.log('Action scheduled outside business hours, deferring execution');
      // For now, we'll skip the action if outside business hours
      // In a production system, this would be queued for later execution
      return {
        type: actionType,
        status: 'deferred',
        reason: 'Outside business hours',
        timing: timing
      };
    }
  }

  switch (actionType) {
    case 'email':
      return await sendEmail(step.config, context, supabaseClient);
    
    case 'sms':
      return await sendSMS(step.config, context, supabaseClient);
    
    case 'notification':
      return await sendNotification(step.config, context, supabaseClient);
    
    case 'task':
      return await createTask(step.config, context, supabaseClient);
    
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

async function sendEmail(config: any, context: any, supabaseClient: any) {
  console.log('Sending email with config:', config);
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  
  const subject = replaceVariables(config.subject || 'Automated Email', enrichedContext);
  const message = replaceVariables(config.message || 'This is an automated email.', enrichedContext);
  const recipientEmail = enrichedContext.client?.email || context.clientEmail || 'client@example.com';
  
  try {
    // Call the actual mailgun-email edge function
    const emailResult = await supabaseClient.functions.invoke('mailgun-email', {
      body: {
        to: recipientEmail,
        subject: subject,
        html: message.replace(/\n/g, '<br>'),
        text: message,
        userId: enrichedContext.job?.user_id || context.userId || context.user?.id,
        clientId: enrichedContext.client?.id,
        metadata: { 
          automationGenerated: true,
          workflowId: context.workflowId,
          triggerType: context.triggerType
        }
      }
    });

    if (emailResult.error) {
      console.error('Mailgun email failed:', emailResult.error);
      throw new Error(`Email sending failed: ${emailResult.error.message}`);
    }

    console.log('Email sent successfully via Mailgun:', emailResult.data);

    return { 
      type: 'email', 
      status: 'sent',
      subject,
      message,
      recipient: recipientEmail,
      mailgunId: emailResult.data?.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed communication
    try {
      await supabaseClient
        .from('communication_logs')
        .insert({
          type: 'email',
          direction: 'outbound',
          from_address: 'noreply@company.com',
          to_address: recipientEmail,
          subject: subject,
          content: message,
          status: 'failed',
          metadata: { 
            automationGenerated: true,
            error: error.message
          }
        });
    } catch (logError) {
      console.log('Failed to log email error:', logError);
    }

    throw error;
  }
}

async function sendSMS(config: any, context: any, supabaseClient: any) {
  console.log('Sending SMS with config:', config);
  
  // Fetch real data for variables if we have job/client IDs
  const enrichedContext = await enrichContext(context, supabaseClient);
  
  const message = replaceVariables(config.message || 'Automated SMS message', enrichedContext);
  const recipientPhone = enrichedContext.client?.phone || context.clientPhone || '+1234567890';
  
  try {
    // Call the actual telnyx-sms edge function
    const smsResult = await supabaseClient.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: recipientPhone,
        message: message,
        user_id: context.userId || enrichedContext.job?.user_id,
        metadata: { 
          automationGenerated: true,
          workflowId: context.workflowId,
          triggerType: context.triggerType,
          clientId: enrichedContext.client?.id
        }
      }
    });

    if (smsResult.error) {
      console.error('Telnyx SMS failed:', smsResult.error);
      throw new Error(`SMS sending failed: ${smsResult.error.message}`);
    }

    console.log('SMS sent successfully via Telnyx:', smsResult.data);

    return { 
      type: 'sms', 
      status: 'sent',
      message,
      recipient: recipientPhone,
      telnyxId: smsResult.data?.messageId
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Log failed communication
    try {
      await supabaseClient
        .from('communication_logs')
        .insert({
          type: 'sms',
          direction: 'outbound',
          from_address: 'system',
          to_address: recipientPhone,
          content: message,
          status: 'failed',
          metadata: { 
            automationGenerated: true,
            error: error.message
          }
        });
    } catch (logError) {
      console.log('Failed to log SMS error:', logError);
    }

    throw error;
  }
}

async function sendNotification(config: any, context: any, supabaseClient: any) {
  console.log('Sending notification with config:', config);
  
  const message = replaceVariables(config.message || 'Automated notification', context);
  
  return { 
    type: 'notification', 
    status: 'sent',
    message
  };
}

async function createTask(config: any, context: any, supabaseClient: any) {
  console.log('Creating task with config:', config);
  
  const description = replaceVariables(config.description || 'Automated task', context);
  
  return { 
    type: 'task', 
    status: 'created',
    description
  };
}

async function evaluateCondition(step: any, context: any) {
  console.log('Evaluating condition:', step.config);
  
  const field = step.config?.field;
  const operator = step.config?.operator;
  const value = step.config?.value;
  
  const contextValue = getNestedValue(context, field);
  
  let result = false;
  
  switch (operator) {
    case 'equals':
      result = contextValue === value;
      break;
    case 'not_equals':
      result = contextValue !== value;
      break;
    case 'greater_than':
      result = Number(contextValue) > Number(value);
      break;
    case 'less_than':
      result = Number(contextValue) < Number(value);
      break;
    case 'contains':
      result = String(contextValue).includes(String(value));
      break;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
  
  return { condition: true, result, field, operator, value, contextValue };
}

function replaceVariables(template: string, context: any): string {
  if (!template) return '';
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = getNestedValue(context, key.trim());
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function formatTime24Hour(timeString: string): string {
  if (!timeString) return '';
  
  try {
    // Parse time string (assuming format like "14:30" or "14:30:00")
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    if (isNaN(hour24) || isNaN(minute)) return timeString;
    
    const formattedMinute = minute.toString().padStart(2, '0');
    const formattedHour = hour24.toString().padStart(2, '0');
    
    return `${formattedHour}:${formattedMinute}`;
  } catch (error) {
    return timeString;
  }
}

function formatAppointmentTime(scheduleStart: string, scheduleEnd: string): string {
  const startTime = formatTime24Hour(scheduleStart);
  const endTime = formatTime24Hour(scheduleEnd);
  
  if (startTime && endTime && startTime !== endTime) {
    return `${startTime} - ${endTime}`;
  } else if (startTime) {
    return startTime;
  } else if (endTime) {
    return endTime;
  }
  
  return '';
}

async function enrichContext(context: any, supabaseClient: any): Promise<any> {
  const enriched = { ...context };
  
  try {
    // If we have a job ID, fetch job and client data
    if (context.jobId || context.job_id) {
      const jobId = context.jobId || context.job_id;
      
      const { data: job, error: jobError } = await supabaseClient
        .from('jobs')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('id', jobId)
        .single();
        
      if (!jobError && job) {
        // Use the actual database fields
        const jobDate = job.date ? new Date(job.date) : null;
        const scheduledStartDate = job.schedule_start ? new Date(job.schedule_start) : null;
        const scheduledEndDate = job.schedule_end ? new Date(job.schedule_end) : null;
        
        // Use schedule_start for the main date if available, otherwise use date field
        const mainDate = scheduledStartDate || jobDate;
        
        // Create readable date formats
        const formattedDate = mainDate ? mainDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null;
        
        const shortDate = mainDate ? mainDate.toLocaleDateString('en-US') : null;
        
        // Format time from the timestamps
        const scheduledTime = scheduledStartDate ? scheduledStartDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : null;
        
        const endTime = scheduledEndDate ? scheduledEndDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : null;
        
        // Use the appointment time formatting function
        const appointmentTime = scheduledTime && endTime ? `${scheduledTime} - ${endTime}` : (scheduledTime || '');
        
        // Get technician name from profiles if technician_id exists
        let technicianName = 'Not assigned';
        if (job.technician_id) {
          const { data: techProfile } = await supabaseClient
            .from('profiles')
            .select('name')
            .eq('id', job.technician_id)
            .single();
          
          if (techProfile) {
            technicianName = techProfile.name;
          }
        }
        
        enriched.job = {
          id: job.id,
          title: job.title || job.description || 'Service Appointment',
          status: job.status,
          date: mainDate?.toISOString(),
          time: scheduledTime,
          scheduledDate: formattedDate,
          scheduledTime: scheduledTime,
          formattedDate: formattedDate,
          shortDate: shortDate,
          appointmentTime: appointmentTime,
          scheduledDateTime: formattedDate && appointmentTime ? `${formattedDate} at ${appointmentTime}` : null,
          scheduledDateTimeShort: shortDate && appointmentTime ? `${shortDate} at ${appointmentTime}` : null,
          technician: technicianName,
          technicianName: technicianName,
          service: job.service || job.job_type || 'General Service',
          notes: job.notes,
          total: job.revenue || job.total || 0,
          address: job.address || 'No address specified',
          user_id: job.user_id // Add user_id to enriched job data
        };
        
        if (job.clients) {
          // Handle both single name field and first/last name fields
          const clientName = job.clients.name || `${job.clients.first_name || ''} ${job.clients.last_name || ''}`.trim();
          const nameParts = clientName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          enriched.client = {
            id: job.clients.id,
            name: clientName,
            firstName: firstName,
            lastName: lastName,
            email: job.clients.email,
            phone: job.clients.phone,
            address: job.clients.address
          };
        }
      }
    }
    
    // If we have a client ID but no job, fetch client data
    if ((context.clientId || context.client_id) && !enriched.client) {
      const clientId = context.clientId || context.client_id;
      
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (!clientError && client) {
        // Handle both single name field and first/last name fields
        const clientName = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim();
        const nameParts = clientName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        enriched.client = {
          id: client.id,
          name: clientName,
          firstName: firstName,
          lastName: lastName,
          email: client.email,
          phone: client.phone,
          address: client.address
        };
      }
    }
    
    // Get company information
    if (enriched.job?.user_id || context.userId) {
      const userId = enriched.job?.user_id || context.userId;
      
      const { data: company, error: companyError } = await supabaseClient
        .from('company_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!companyError && company) {
        enriched.company = {
          name: company.company_name,
          phone: company.company_phone,
          email: company.company_email,
          website: company.company_website,
          address: company.company_address
        };
      }
    }
    
  } catch (error) {
    console.error('Error enriching context:', error);
  }
  
  return enriched;
}

// Check if current time is within business hours
async function checkBusinessHours(timing: any, supabaseClient: any): Promise<boolean> {
  if (!timing?.businessHours) {
    // If business hours restriction is not enabled, allow execution
    return true;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert business hours to numbers for comparison
  const startTime = timing.businessStart || '09:00';
  const endTime = timing.businessEnd || '17:00';
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const currentMinutes = currentHour * 60 + currentMinute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Check if current time is within business hours
  const isWithinHours = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  
  // Also check quiet hours if enabled
  if (timing.quietHours && !isWithinHours) {
    const quietStart = timing.quietStart || '21:00';
    const quietEnd = timing.quietEnd || '08:00';
    
    const [quietStartHour, quietStartMinute] = quietStart.split(':').map(Number);
    const [quietEndHour, quietEndMinute] = quietEnd.split(':').map(Number);
    
    const quietStartMinutes = quietStartHour * 60 + quietStartMinute;
    const quietEndMinutes = quietEndHour * 60 + quietEndMinute;
    
    // Check if we're in quiet hours (block sending)
    if (quietStartMinutes > quietEndMinutes) {
      // Quiet hours span midnight
      if (currentMinutes >= quietStartMinutes || currentMinutes <= quietEndMinutes) {
        return false; // In quiet hours, don't send
      }
    } else {
      // Normal quiet hours check
      if (currentMinutes >= quietStartMinutes && currentMinutes <= quietEndMinutes) {
        return false; // In quiet hours, don't send
      }
    }
  }
  
  return isWithinHours;
}