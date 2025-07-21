// Automation types and stubs

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger_type: string;
  action_type: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  status: 'active' | 'paused' | 'draft';
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  action_type: string;
  template_config: {
    triggers: any[];
    actions: any[];
    variables: any[];
    visual_config?: any;
  };
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

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger_type: string;
  action_type: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  name: string;
  count: number;
}

export interface ExecutionStep {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

export interface ExecutionContext {
  workflowId: string;
  trigger: any;
  variables: Record<string, any>;
}

export interface AutomationMetrics {
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface WorkflowPerformance {
  workflowId: string;
  metrics: AutomationMetrics;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowBuilder {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (id: string) => void;
}

// Service stubs
export const telnyxService = {
  sendSMS: async (to: string, message: string) => {
    console.log('Sending SMS:', { to, message });
    return { id: 'test-sms-id', success: true };
  }
};

export const mailgunService = {
  sendEmail: async (to: string, subject: string, content: string) => {
    console.log('Sending email:', { to, subject, content });
    return { id: 'test-email-id', success: true };
  }
};