import { supabase } from '@/integrations/supabase/client';

/**
 * Utility to trigger automations from app events
 * This should be called whenever events happen in the app that could trigger automations
 */

interface TriggerAutomationParams {
  triggerType: string;
  eventId: string;
  organizationId: string;
  contextData: any;
}

// Main function to trigger automations
export const triggerAutomations = async ({
  triggerType,
  eventId,
  organizationId,
  contextData
}: TriggerAutomationParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/automation-trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({
        type: 'trigger_event',
        trigger_type: triggerType,
        event_id: eventId,
        organization_id: organizationId,
        context_data: contextData
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Automation trigger result for ${triggerType}:`, result);
    
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error triggering automations:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions for specific events

export const triggerJobCreated = async (job: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'job_created',
    eventId: job.id,
    organizationId,
    contextData: await buildJobContext(job, organizationId)
  });
};

export const triggerJobCompleted = async (job: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'job_completed',
    eventId: job.id,
    organizationId,
    contextData: await buildJobContext(job, organizationId)
  });
};

export const triggerJobScheduled = async (job: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'job_scheduled',
    eventId: job.id,
    organizationId,
    contextData: await buildJobContext(job, organizationId)
  });
};

export const triggerJobStatusChanged = async (job: any, organizationId: string, oldStatus: string, newStatus: string) => {
  const contextData = await buildJobContext(job, organizationId);
  contextData.old_status = oldStatus;
  contextData.new_status = newStatus;
  
  return triggerAutomations({
    triggerType: 'job_status_changed',
    eventId: job.id,
    organizationId,
    contextData
  });
};

export const triggerEstimateSent = async (estimate: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'estimate_sent',
    eventId: estimate.id,
    organizationId,
    contextData: await buildEstimateContext(estimate, organizationId)
  });
};

export const triggerEstimateApproved = async (estimate: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'estimate_approved',
    eventId: estimate.id,
    organizationId,
    contextData: await buildEstimateContext(estimate, organizationId)
  });
};

export const triggerInvoiceCreated = async (invoice: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'invoice_created',
    eventId: invoice.id,
    organizationId,
    contextData: await buildInvoiceContext(invoice, organizationId)
  });
};

export const triggerInvoiceOverdue = async (invoice: any, organizationId: string) => {
  const contextData = await buildInvoiceContext(invoice, organizationId);
  const today = new Date();
  const dueDate = new Date(invoice.due_date);
  contextData.days_overdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return triggerAutomations({
    triggerType: 'invoice_overdue',
    eventId: invoice.id,
    organizationId,
    contextData
  });
};

export const triggerPaymentReceived = async (invoice: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'payment_received',
    eventId: invoice.id,
    organizationId,
    contextData: await buildInvoiceContext(invoice, organizationId)
  });
};

// Task-related automation triggers
export const triggerTaskCreated = async (task: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'task_created',
    eventId: task.id,
    organizationId,
    contextData: await buildTaskContext(task, organizationId)
  });
};

export const triggerTaskCompleted = async (task: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'task_completed',
    eventId: task.id,
    organizationId,
    contextData: await buildTaskContext(task, organizationId)
  });
};

export const triggerTaskOverdue = async (task: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'task_overdue',
    eventId: task.id,
    organizationId,
    contextData: await buildTaskContext(task, organizationId)
  });
};

export const triggerTaskStatusChanged = async (task: any, organizationId: string, oldStatus: string, newStatus: string) => {
  const contextData = await buildTaskContext(task, organizationId);
  contextData.old_status = oldStatus;
  contextData.new_status = newStatus;
  
  return triggerAutomations({
    triggerType: 'task_status_changed',
    eventId: task.id,
    organizationId,
    contextData
  });
};

export const triggerMissedCall = async (callData: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'missed_call',
    eventId: callData.id || `call-${Date.now()}`,
    organizationId,
    contextData: {
      caller_phone: callData.from,
      caller_name: callData.caller_name || 'Unknown Caller',
      call_time: callData.timestamp || new Date().toISOString(),
      client_phone: callData.from,
      client_name: callData.caller_name || 'Unknown Caller',
      ...await buildOrganizationContext(organizationId)
    }
  });
};

export const triggerCustomerInquiry = async (inquiry: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'customer_inquiry',
    eventId: inquiry.id,
    organizationId,
    contextData: {
      inquiry_id: inquiry.id,
      customer_name: inquiry.name,
      customer_phone: inquiry.phone,
      customer_email: inquiry.email,
      inquiry_message: inquiry.message,
      inquiry_source: inquiry.source || 'website',
      client_name: inquiry.name,
      client_phone: inquiry.phone,
      client_email: inquiry.email,
      ...await buildOrganizationContext(organizationId)
    }
  });
};

export const triggerAppointmentTomorrow = async (job: any, organizationId: string) => {
  return triggerAutomations({
    triggerType: 'appointment_tomorrow',
    eventId: job.id,
    organizationId,
    contextData: await buildJobContext(job, organizationId)
  });
};

// Helper functions to build context data

async function buildJobContext(job: any, organizationId: string) {
  try {
    // Get client information
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', job.client_id)
      .single();

    // Get technician information
    const { data: technician } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', job.assigned_to)
      .single();

    // Get organization information
    const orgContext = await buildOrganizationContext(organizationId);

    const scheduledDate = job.scheduled_date ? new Date(job.scheduled_date) : null;

    return {
      // Job information
      job_id: job.id,
      job_title: job.title || job.description || 'Service Call',
      job_type: job.job_type || job.type || 'Service',
      job_status: job.status,
      scheduled_date: scheduledDate ? scheduledDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '',
      scheduled_time: scheduledDate ? scheduledDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }) : '',
      total_amount: job.total_amount ? `$${job.total_amount.toFixed(2)}` : '$0.00',

      // Client information
      client_id: client?.id,
      client_name: client?.name || 'Valued Customer',
      client_first_name: client?.name ? client.name.split(' ')[0] : 'Customer',
      client_phone: client?.phone || '',
      client_email: client?.email || '',
      client_address: client?.address || '',
      client_city: client?.city || '',
      client_zip: client?.zip || '',

      // Technician information
      technician_id: technician?.id,
      technician_name: technician?.name || 'Our Technician',
      technician_phone: technician?.phone || '',

      // Organization context
      ...orgContext
    };
  } catch (error) {
    console.error('Error building job context:', error);
    return {
      job_id: job.id,
      job_title: job.title || 'Service Call',
      job_type: job.job_type || 'Service',
      job_status: job.status,
      client_name: 'Valued Customer',
      client_first_name: 'Customer',
      ...await buildOrganizationContext(organizationId)
    };
  }
}

async function buildEstimateContext(estimate: any, organizationId: string) {
  try {
    // Get client information
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', estimate.client_id)
      .single();

    const orgContext = await buildOrganizationContext(organizationId);

    return {
      // Estimate information
      estimate_id: estimate.id,
      estimate_number: estimate.estimate_number || estimate.id,
      total_amount: estimate.total_amount ? `$${estimate.total_amount.toFixed(2)}` : '$0.00',
      estimate_status: estimate.status,

      // Client information
      client_id: client?.id,
      client_name: client?.name || 'Valued Customer',
      client_first_name: client?.name ? client.name.split(' ')[0] : 'Customer',
      client_phone: client?.phone || '',
      client_email: client?.email || '',
      client_address: client?.address || '',

      // Organization context
      ...orgContext
    };
  } catch (error) {
    console.error('Error building estimate context:', error);
    return {
      estimate_id: estimate.id,
      total_amount: estimate.total_amount ? `$${estimate.total_amount.toFixed(2)}` : '$0.00',
      client_name: 'Valued Customer',
      ...await buildOrganizationContext(organizationId)
    };
  }
}

async function buildInvoiceContext(invoice: any, organizationId: string) {
  try {
    // Get client information
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', invoice.client_id)
      .single();

    const orgContext = await buildOrganizationContext(organizationId);

    const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;

    return {
      // Invoice information
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number || invoice.id,
      total_amount: invoice.total_amount ? `$${invoice.total_amount.toFixed(2)}` : '$0.00',
      overdue_amount: invoice.total_amount ? `$${invoice.total_amount.toFixed(2)}` : '$0.00',
      invoice_status: invoice.status,
      due_date: dueDate ? dueDate.toLocaleDateString() : '',

      // Client information
      client_id: client?.id,
      client_name: client?.name || 'Valued Customer',
      client_first_name: client?.name ? client.name.split(' ')[0] : 'Customer',
      client_phone: client?.phone || '',
      client_email: client?.email || '',
      client_address: client?.address || '',

      // Organization context
      ...orgContext
    };
  } catch (error) {
    console.error('Error building invoice context:', error);
    return {
      invoice_id: invoice.id,
      total_amount: invoice.total_amount ? `$${invoice.total_amount.toFixed(2)}` : '$0.00',
      client_name: 'Valued Customer',
      ...await buildOrganizationContext(organizationId)
    };
  }
}

async function buildTaskContext(task: any, organizationId: string) {
  try {
    // Get client information if task has client
    let client = null;
    if (task.client_id) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', task.client_id)
        .single();
      client = data;
    }

    // Get job information if task has job
    let job = null;
    if (task.job_id) {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', task.job_id)
        .single();
      job = data;
    }

    // Get assigned technician information
    let technician = null;
    if (task.assigned_to) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', task.assigned_to)
        .single();
      technician = data;
    }

    const orgContext = await buildOrganizationContext(organizationId);
    const dueDate = task.due_date ? new Date(task.due_date) : null;

    return {
      // Task information
      task_id: task.id,
      task_description: task.description || '',
      task_status: task.status || 'pending',
      task_priority: task.priority || 'medium',
      task_notes: task.notes || '',
      due_date: dueDate ? dueDate.toLocaleDateString() : '',
      due_time: dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',

      // Client information
      client_id: client?.id || '',
      client_name: client?.name || 'No Client',
      client_first_name: client?.name ? client.name.split(' ')[0] : 'Customer',
      client_phone: client?.phone || '',
      client_email: client?.email || '',
      client_address: client?.address || '',

      // Job information
      job_id: job?.id || '',
      job_title: job?.title || '',
      job_type: job?.job_type || '',
      job_status: job?.status || '',

      // Technician information
      technician_id: technician?.id || '',
      technician_name: technician?.name || 'Unassigned',
      technician_phone: technician?.phone || '',
      technician_email: technician?.email || '',

      // Organization context
      ...orgContext
    };
  } catch (error) {
    console.error('Error building task context:', error);
    return {
      task_id: task.id,
      task_description: task.description || '',
      task_status: task.status || 'pending',
      ...await buildOrganizationContext(organizationId)
    };
  }
}

async function buildOrganizationContext(organizationId: string) {
  try {
    // This would normally get organization data from a profiles or organizations table
    // For now, return default values
    return {
      company_name: 'Your Service Company',
      company_phone: '(555) 999-0000',
      company_email: 'info@yourcompany.com',
      company_address: '123 Business St',
      company_website: 'www.yourcompany.com',
      booking_link: 'https://your-booking-link.com',
      payment_link: 'https://your-payment-link.com'
    };
  } catch (error) {
    console.error('Error building organization context:', error);
    return {
      company_name: 'Your Service Company',
      company_phone: '(555) 999-0000',
      company_email: 'info@yourcompany.com',
      booking_link: 'https://your-booking-link.com',
      payment_link: 'https://your-payment-link.com'
    };
  }
}

// Test function to manually trigger automations
export const testAutomationTrigger = async (triggerType: string, organizationId: string, testData?: any) => {
  const defaultTestData = {
    client_name: 'Test Customer',
    client_first_name: 'Test',
    client_phone: '+1234567890',
    client_email: 'test@example.com',
    client_address: '123 Test Street',
    job_id: 'TEST-001',
    job_title: 'Test HVAC Repair',
    job_type: 'HVAC',
    job_status: 'completed',
    scheduled_date: 'Tomorrow',
    scheduled_time: '2:00 PM',
    total_amount: '$450.00',
    technician_name: 'Test Technician',
    company_name: 'Test Company',
    company_phone: '(555) 999-0000',
    booking_link: 'https://test-booking.com',
    payment_link: 'https://test-payment.com'
  };

  return triggerAutomations({
    triggerType,
    eventId: `test-${Date.now()}`,
    organizationId,
    contextData: { ...defaultTestData, ...testData }
  });
};
