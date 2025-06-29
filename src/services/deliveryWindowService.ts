import { supabase } from '@/integrations/supabase/client';
import { format, isWithinInterval, setHours, setMinutes, addDays, parse } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface DeliveryWindow {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  weekdays?: number[]; // 0-6, where 0 is Sunday
}

export class DeliveryWindowService {
  /**
   * Check if current time is within delivery window
   */
  static isWithinDeliveryWindow(
    deliveryWindow: DeliveryWindow,
    timezone: string = 'America/New_York'
  ): boolean {
    if (!deliveryWindow.enabled) return true;

    const now = new Date();
    const zonedNow = toZonedTime(now, deliveryWindow.timezone || timezone);
    
    // Check weekday
    const currentWeekday = zonedNow.getDay();
    const allowedWeekdays = deliveryWindow.weekdays || [1, 2, 3, 4, 5]; // Mon-Fri default
    
    if (!allowedWeekdays.includes(currentWeekday)) {
      return false;
    }

    // Check time
    const [startHour, startMinute] = deliveryWindow.startTime.split(':').map(Number);
    const [endHour, endMinute] = deliveryWindow.endTime.split(':').map(Number);
    
    const startTime = setMinutes(setHours(zonedNow, startHour), startMinute);
    const endTime = setMinutes(setHours(zonedNow, endHour), endMinute);
    
    return isWithinInterval(zonedNow, { start: startTime, end: endTime });
  }

  /**
   * Get next available delivery time
   */
  static getNextDeliveryTime(
    deliveryWindow: DeliveryWindow,
    timezone: string = 'America/New_York'
  ): Date {
    if (!deliveryWindow.enabled) return new Date();

    const now = new Date();
    let zonedNow = toZonedTime(now, deliveryWindow.timezone || timezone);
    
    const [startHour, startMinute] = deliveryWindow.startTime.split(':').map(Number);
    const allowedWeekdays = deliveryWindow.weekdays || [1, 2, 3, 4, 5];

    // Find next available day
    let daysToAdd = 0;
    let checkDate = new Date(zonedNow);
    
    while (daysToAdd < 7) {
      checkDate = addDays(zonedNow, daysToAdd);
      const weekday = checkDate.getDay();
      
      // Check if this day is allowed
      if (allowedWeekdays.includes(weekday)) {
        // If it's today, check if we're past the start time
        if (daysToAdd === 0) {
          const todayStartTime = setMinutes(setHours(checkDate, startHour), startMinute);
          if (checkDate < todayStartTime) {
            // We can send today at start time
            return fromZonedTime(todayStartTime, deliveryWindow.timezone || timezone);
          }
        } else {
          // Future day - send at start time
          const futureStartTime = setMinutes(setHours(checkDate, startHour), startMinute);
          return fromZonedTime(futureStartTime, deliveryWindow.timezone || timezone);
        }
      }
      
      daysToAdd++;
    }

    // Fallback - should not reach here
    return now;
  }

  /**
   * Queue message for delivery
   */
  static async queueMessageForDelivery(
    workflowId: string,
    stepId: string,
    messageData: any,
    deliveryWindow: DeliveryWindow,
    timezone: string
  ) {
    const nextDeliveryTime = this.getNextDeliveryTime(deliveryWindow, timezone);
    
    const { error } = await supabase
      .from('automation_message_queue')
      .insert({
        workflow_id: workflowId,
        step_id: stepId,
        message_type: messageData.type, // 'sms' or 'email'
        recipient: messageData.recipient,
        content: messageData.content,
        scheduled_at: nextDeliveryTime.toISOString(),
        status: 'pending',
        delivery_window: deliveryWindow,
        metadata: messageData.metadata
      });

    if (error) {
      console.error('Error queuing message:', error);
      throw error;
    }

    return {
      scheduledAt: nextDeliveryTime,
      willSendToday: nextDeliveryTime.toDateString() === new Date().toDateString()
    };
  }

  /**
   * Process pending messages in queue
   */
  static async processPendingMessages() {
    const now = new Date();
    
    // Get pending messages that are due
    const { data: pendingMessages, error } = await supabase
      .from('automation_message_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at');

    if (error) {
      console.error('Error fetching pending messages:', error);
      return;
    }

    // Process each message
    for (const message of pendingMessages || []) {
      try {
        // Update status to processing
        await supabase
          .from('automation_message_queue')
          .update({ status: 'processing' })
          .eq('id', message.id);

        // Send the message based on type
        if (message.message_type === 'sms') {
          await this.sendSMS(message);
        } else if (message.message_type === 'email') {
          await this.sendEmail(message);
        }

        // Update status to sent
        await supabase
          .from('automation_message_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', message.id);

      } catch (error) {
        console.error('Error processing message:', error);
        
        // Update status to failed
        await supabase
          .from('automation_message_queue')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', message.id);
      }
    }
  }

  private static async sendSMS(message: any) {
    // Implementation depends on your SMS provider
    console.log('Sending SMS:', message);
    // TODO: Integrate with Twilio or other SMS service
  }

  private static async sendEmail(message: any) {
    // Implementation depends on your email provider
    console.log('Sending Email:', message);
    // TODO: Integrate with SendGrid, SES, or other email service
  }
}

// Create table for message queue if not exists
export const createMessageQueueTable = async () => {
  const migration = `
    CREATE TABLE IF NOT EXISTS automation_message_queue (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE,
      step_id TEXT NOT NULL,
      message_type TEXT NOT NULL CHECK (message_type IN ('sms', 'email')),
      recipient TEXT NOT NULL,
      content JSONB NOT NULL,
      scheduled_at TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
      delivery_window JSONB,
      metadata JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_message_queue_status ON automation_message_queue(status);
    CREATE INDEX IF NOT EXISTS idx_message_queue_scheduled ON automation_message_queue(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_message_queue_workflow ON automation_message_queue(workflow_id);
  `;

  // This would be run as a Supabase migration
  return migration;
};