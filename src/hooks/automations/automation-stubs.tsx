// Automation interfaces and stub implementations

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger_type: string;
  action_type: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  action_type: string;
  config: any;
  is_active: boolean;
  created_at: string;
}

export interface AutomationHistory {
  id: string;
  workflow_id: string;
  execution_status: string;
  created_at: string;
  error_details?: any;
}

// Stub services
export const telnyxService = {
  sendSMS: async (to: string, message: string) => {
    console.log('Sending SMS:', { to, message });
    return { success: true };
  }
};

export const mailgunService = {
  sendEmail: async (to: string, subject: string, content: string) => {
    console.log('Sending email:', { to, subject, content });
    return { success: true };
  }
};

// Hook stubs
export const useUniversalDocumentSend = () => {
  return {
    sendDocument: async () => ({ success: true }),
    isLoading: false
  };
};