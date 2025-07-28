import { supabase } from '@/integrations/supabase/client';

interface LogCommunicationParams {
  type: 'email' | 'sms';
  to: string;
  from?: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  userId: string;
  metadata?: any;
  errorMessage?: string;
  documentType?: 'estimate' | 'invoice';
  documentId?: string;
}

export class CommunicationLogger {
  static async log(params: LogCommunicationParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-communication-logger', {
        body: params
      });

      if (error) {
        console.error('Failed to log communication:', error);
        return null;
      }

      return data?.logId || null;
    } catch (error: any) {
      console.error('Error logging communication:', error);
      return null;
    }
  }

  static async logEmailSent(
    to: string, 
    content: string, 
    userId: string, 
    metadata?: any,
    documentType?: 'estimate' | 'invoice',
    documentId?: string
  ) {
    return this.log({
      type: 'email',
      to,
      content,
      status: 'sent',
      userId,
      metadata,
      documentType,
      documentId
    });
  }

  static async logEmailFailed(
    to: string, 
    content: string, 
    userId: string, 
    errorMessage: string,
    metadata?: any,
    documentType?: 'estimate' | 'invoice',
    documentId?: string
  ) {
    return this.log({
      type: 'email',
      to,
      content,
      status: 'failed',
      userId,
      errorMessage,
      metadata,
      documentType,
      documentId
    });
  }

  static async logSMSSent(
    to: string, 
    content: string, 
    userId: string, 
    metadata?: any,
    documentType?: 'estimate' | 'invoice',
    documentId?: string
  ) {
    return this.log({
      type: 'sms',
      to,
      content,
      status: 'sent',
      userId,
      metadata,
      documentType,
      documentId
    });
  }

  static async logSMSFailed(
    to: string, 
    content: string, 
    userId: string, 
    errorMessage: string,
    metadata?: any,
    documentType?: 'estimate' | 'invoice',
    documentId?: string
  ) {
    return this.log({
      type: 'sms',
      to,
      content,
      status: 'failed',
      userId,
      errorMessage,
      metadata,
      documentType,
      documentId
    });
  }

  static async getCommunicationStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('communication_logs')
        .select('type, status, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) throw error;

      const stats = {
        email: { total: 0, sent: 0, failed: 0, pending: 0 },
        sms: { total: 0, sent: 0, failed: 0, pending: 0 }
      };

      data?.forEach(log => {
        const type = log.type as 'email' | 'sms';
        stats[type].total++;
        stats[type][log.status as 'sent' | 'failed' | 'pending']++;
      });

      return {
        email: {
          ...stats.email,
          successRate: stats.email.total > 0 ? (stats.email.sent / stats.email.total) * 100 : 0
        },
        sms: {
          ...stats.sms,
          successRate: stats.sms.total > 0 ? (stats.sms.sent / stats.sms.total) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error getting communication stats:', error);
      return null;
    }
  }
}