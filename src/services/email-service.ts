import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
  clientId?: string;
  jobId?: string;
  templateId?: string;
}

export class EmailService {
  static async sendEmail(data: EmailData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.to,
          subject: data.subject,
          html: data.html || data.body,
          text: data.body,
          replyTo: data.replyTo || user.email,
          userId: user.id,
          clientId: data.clientId,
          jobId: data.jobId,
          templateId: data.templateId
        }
      });

      if (error) throw error;

      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendTemplateEmail(
    templateId: string, 
    to: string, 
    variables: Record<string, any>,
    context?: { clientId?: string; jobId?: string }
  ) {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('automation_message_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        throw new Error('Template not found');
      }

      // Replace variables
      let subject = template.subject || '';
      let body = template.content || '';

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, String(value));
        body = body.replace(regex, String(value));
      });

      // Send email
      return await this.sendEmail({
        to,
        subject,
        body,
        html: body,
        templateId,
        ...context
      });
    } catch (error) {
      console.error('Error sending template email:', error);
      throw error;
    }
  }

  static async testMailgunConnection() {
    try {
      const result = await this.sendEmail({
        to: 'test@example.com',
        subject: 'Mailgun Test',
        body: 'This is a test email to verify Mailgun configuration.'
      });
      
      toast.success('Mailgun connection test successful!');
      return true;
    } catch (error) {
      toast.error('Mailgun connection test failed');
      return false;
    }
  }
}
