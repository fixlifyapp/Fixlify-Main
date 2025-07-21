// Comprehensive stub implementations for all automation-related functionality

import { useState, useCallback } from 'react';

// Types
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
  status: string;
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
  status: string;
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

// Stub services
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

// Organization context stub
export const useOrganization = () => ({
  organization: { id: 'test-org-id', name: 'Test Organization' }
});

// Hook stubs
export const useAutomations = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(false);

  const createWorkflow = useCallback(async (data: Partial<AutomationWorkflow>) => {
    console.log('Creating workflow:', data);
    return { id: 'new-workflow-id', ...data } as AutomationWorkflow;
  }, []);

  return {
    workflows,
    rules,
    loading,
    createWorkflow,
    updateWorkflow: createWorkflow,
    deleteWorkflow: async (id: string) => console.log('Deleting workflow:', id),
    refetch: () => Promise.resolve()
  };
};

export const useAutomationTemplates = () => {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(false);

  return {
    templates,
    categories,
    loading,
    refetch: () => Promise.resolve(),
    createFromTemplate: async (template: AutomationTemplate) => {
      console.log('Creating from template:', template);
      return { id: 'new-workflow-id' };
    }
  };
};

export const useAutomationBuilder = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);

  const builder: WorkflowBuilder = {
    nodes,
    edges,
    addNode: (node) => setNodes(prev => [...prev, node]),
    removeNode: (id) => setNodes(prev => prev.filter(n => n.id !== id)),
    addEdge: (edge) => setEdges(prev => [...prev, edge]),
    removeEdge: (id) => setEdges(prev => prev.filter(e => e.id !== id))
  };

  return {
    builder,
    saveWorkflow: async (data: any) => {
      console.log('Saving workflow:', data);
      return { id: 'saved-workflow-id' };
    },
    loadWorkflow: async (id: string) => {
      console.log('Loading workflow:', id);
      return { nodes: [], edges: [] };
    }
  };
};