import { supabase } from '@/integrations/supabase/client';
import { CommunicationType, CommunicationCategory, Communication } from '@/types/communications';
import { toast } from 'sonner';

interface SendEmailParams {
  to: string;
  subject: string;
  content: string;
  category?: CommunicationCategory;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: 'client' | 'job' | 'estimate' | 'invoice';
}

interface SendSMSParams {
  to: string;
  content: string;
  category?: CommunicationCategory;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: 'client' | 'job' | 'estimate' | 'invoice';
}

export class CommunicationService {
  // Send generic email using mailgun-email edge function
  static async sendEmail(params: SendEmailParams): Promise<{ success: boolean; communication?: Communication; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, send the email via edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('mailgun-email', {
        body: {
          to: params.to,
          subject: params.subject,
          html: params.content,
          ...params.metadata
        }
      });

      if (sendError) throw sendError;

      // Log the communication
      const communication = await this.logCommunication({
        type: 'email',
        category: params.category || 'general',
        from: user.email || 'system',
        to: params.to,
        subject: params.subject,
        content: params.content,
        metadata: params.metadata,
        status: sendData?.success ? 'sent' : 'failed',
        [`${params.relatedEntityType}_id`]: params.relatedEntityId
      });

      return { success: true, communication };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }
  // Send SMS using sms-send edge function
  static async sendSMS(params: SendSMSParams): Promise<{ success: boolean; communication?: Communication; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Send SMS via edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          recipientPhone: params.to,
          message: params.content,
          user_id: user.id,
          ...params.metadata
        }
      });

      if (sendError) throw sendError;

      // Log the communication
      const communication = await this.logCommunication({
        type: 'sms',
        category: params.category || 'general',
        from: 'system',
        to: params.to,
        content: params.content,
        metadata: params.metadata,
        status: sendData?.success ? 'sent' : 'failed',
        [`${params.relatedEntityType}_id`]: params.relatedEntityId
      });

      return { success: true, communication };
    } catch (error: any) {      console.error('Failed to send SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send estimate notification (email or SMS)
  static async sendEstimateNotification(estimateId: string, method: 'email' | 'sms'): Promise<{ success: boolean; error?: string }> {
    try {
      const functionName = method === 'email' ? 'send-estimate' : 'send-estimate-sms';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { estimateId }
      });

      if (error) throw error;
      
      toast.success(`Estimate ${method === 'email' ? 'emailed' : 'sent via SMS'} successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to send estimate via ${method}:`, error);
      toast.error(`Failed to send estimate: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Send invoice notification (email or SMS)
  static async sendInvoiceNotification(invoiceId: string, method: 'email' | 'sms'): Promise<{ success: boolean; error?: string }> {
    try {
      const functionName = method === 'email' ? 'send-invoice' : 'send-invoice-sms';
            const { data, error } = await supabase.functions.invoke(functionName, {
        body: { invoiceId }
      });

      if (error) throw error;
      
      toast.success(`Invoice ${method === 'email' ? 'emailed' : 'sent via SMS'} successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`Failed to send invoice via ${method}:`, error);
      toast.error(`Failed to send invoice: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Log communication to database
  private static async logCommunication(data: Partial<Communication>): Promise<Communication> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const { data: communication, error } = await supabase
      .from('communications')
      .insert({
        ...data,
        organization_id: profile?.organization_id || user.id,        created_by: user.id,
        sent_at: data.status === 'sent' ? new Date().toISOString() : undefined
      })
      .select()
      .single();

    if (error) throw error;
    return communication;
  }

  // Get communications history
  static async getHistory(filters?: {
    type?: CommunicationType;
    category?: CommunicationCategory;
    clientId?: string;
    jobId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Communication[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('communications')
      .select('*')
      .eq('organization_id', profile?.organization_id || user.id)      .order('created_at', { ascending: false });

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.clientId) query = query.eq('client_id', filters.clientId);
    if (filters?.jobId) query = query.eq('job_id', filters.jobId);
    if (filters?.startDate) query = query.gte('created_at', filters.startDate);
    if (filters?.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }
}