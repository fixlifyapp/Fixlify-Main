export { telnyxService, TelnyxService } from './TelnyxService';
export { mailgunService, MailgunService } from './MailgunService';

// Unified communication interface
export interface CommunicationService {
  sendMessage(params: {
    type: 'sms' | 'email';
    to: string | string[];
    content: string;
    subject?: string;
    variables?: Record<string, any>;
  }): Promise<any>;
}

// Unified service that delegates to appropriate provider
export class UnifiedCommunicationService implements CommunicationService {
  async sendMessage(params: {
    type: 'sms' | 'email';
    to: string | string[];
    content: string;
    subject?: string;
    variables?: Record<string, any>;
  }) {
    if (params.type === 'sms') {
      const recipients = Array.isArray(params.to) ? params.to : [params.to];
      return Promise.all(
        recipients.map(to => 
          telnyxService.sendSMS({
            to,
            message: this.interpolateVariables(params.content, params.variables || {})
          })
        )
      );
    } else if (params.type === 'email') {
      return mailgunService.sendEmail({
        to: params.to,
        subject: params.subject || 'Message from Fixlify',
        html: this.interpolateVariables(params.content, params.variables || {}),
        variables: params.variables
      });
    }
    
    throw new Error(`Unsupported communication type: ${params.type}`);
  }

  private interpolateVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}

export const communicationService = new UnifiedCommunicationService();
