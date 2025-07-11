import { supabase } from '@/integrations/supabase/client';

interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    data: string | Buffer;
    contentType?: string;
  }>;
  variables?: Record<string, any>;
  tags?: string[];
  tracking?: boolean;
  trackingClicks?: boolean;
  trackingOpens?: boolean;
}

export class MailgunService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;
  private fromEmail: string;
  private fromName: string;
  private initialized = false;

  constructor() {
    // Delay initialization
  }

  private initialize() {
    if (this.initialized) return;
    
    this.apiKey = import.meta.env.VITE_MAILGUN_API_KEY || '';
    this.domain = import.meta.env.VITE_MAILGUN_DOMAIN || '';
    this.baseUrl = import.meta.env.VITE_MAILGUN_EU ? 
      'https://api.eu.mailgun.net/v3' : 
      'https://api.mailgun.net/v3';
    this.fromEmail = import.meta.env.VITE_MAILGUN_FROM_EMAIL || `no-reply@${this.domain}`;
    this.fromName = import.meta.env.VITE_MAILGUN_FROM_NAME || 'Fixlify';
    this.initialized = true;
  }

  private getAuthHeader(): string {
    this.initialize();
    return `Basic ${btoa(`api:${this.apiKey}`)}`;
  }

  async sendEmail({
    to,
    subject,
    html,
    text,
    from,
    replyTo,
    cc,
    bcc,
    attachments,
    variables,
    tags,
    tracking = true,
    trackingClicks = true,
    trackingOpens = true
  }: EmailMessage) {
    this.initialize();
    try {
      const formData = new FormData();
      
      // Recipients
      formData.append('from', from || `${this.fromName} <${this.fromEmail}>`);
      formData.append('to', Array.isArray(to) ? to.join(',') : to);
      formData.append('subject', subject);
      
      // Content
      if (html) formData.append('html', html);
      if (text) formData.append('text', text);
      
      // Optional fields
      if (replyTo) formData.append('h:Reply-To', replyTo);
      if (cc) formData.append('cc', Array.isArray(cc) ? cc.join(',') : cc);
      if (bcc) formData.append('bcc', Array.isArray(bcc) ? bcc.join(',') : bcc);
      
      // Variables for template
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          formData.append(`v:${key}`, String(value));
        });
      }
      
      // Tags for analytics
      if (tags) {
        tags.forEach(tag => formData.append('o:tag', tag));
      }
      
      // Tracking options
      formData.append('o:tracking', tracking ? 'yes' : 'no');
      formData.append('o:tracking-clicks', trackingClicks ? 'yes' : 'no');
      formData.append('o:tracking-opens', trackingOpens ? 'yes' : 'no');
      
      // Attachments
      if (attachments) {
        attachments.forEach(attachment => {
          const blob = new Blob([attachment.data], { 
            type: attachment.contentType || 'application/octet-stream' 
          });
          formData.append('attachment', blob, attachment.filename);
        });
      }

      const response = await fetch(`${this.baseUrl}/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader()
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      const data = await response.json();
      
      // Log email
      await this.logEmail({
        to: Array.isArray(to) ? to : [to],
        subject,
        status: 'sent',
        messageId: data.id,
        tags
      });

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendBulkEmails(recipients: Array<{
    to: string;
    variables?: Record<string, any>;
  }>, template: {
    subject: string;
    html: string;
    text?: string;
  }) {
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        this.sendEmail({
          to: recipient.to,
          subject: this.interpolateTemplate(template.subject, recipient.variables || {}),
          html: this.interpolateTemplate(template.html, recipient.variables || {}),
          text: template.text ? this.interpolateTemplate(template.text, recipient.variables || {}) : undefined,
          variables: recipient.variables
        })
      )
    );

    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  // Analytics
  async getStats(event: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked', duration = '7d') {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.domain}/stats/total?event=${event}&duration=${duration}`,
        {
          headers: {
            'Authorization': this.getAuthHeader()
          }
        }
      );

      if (!response.ok) throw new Error('Failed to get stats');
      
      return await response.json();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Utility Functions
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private async logEmail(data: {
    to: string[];
    subject: string;
    status: string;
    messageId: string;
    tags?: string[];
  }) {
    const { data: profile } = await supabase.auth.getUser();
    
    await supabase.from('communication_logs').insert({
      organization_id: profile?.user?.user_metadata?.organization_id,
      type: 'email',
      direction: 'outbound',
      to_email: data.to.join(','),
      subject: data.subject,
      status: data.status,
      external_id: data.messageId,
      provider: 'mailgun',
      metadata: { tags: data.tags },
      created_at: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const mailgunService = new MailgunService();
