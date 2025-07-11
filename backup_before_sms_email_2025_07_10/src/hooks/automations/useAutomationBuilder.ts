import { useState, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { telnyxService } from '@/services/communications/TelnyxService';
import { mailgunService } from '@/services/communications/MailgunService';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface WorkflowBuilder {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
}

export const useAutomationBuilder = () => {
  const [builder, setBuilder] = useState<WorkflowBuilder>({
    nodes: [],
    edges: [],
    selectedNode: null
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { organization } = useOrganization();

  // Add node to workflow
  const addNode = useCallback((type: WorkflowNode['type'], position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: `New ${type}`,
        config: {}
      }
    };

    setBuilder(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    return newNode;
  }, []);

  // Update node configuration
  const updateNode = useCallback((nodeId: string, data: any) => {
    setBuilder(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, data } : node
      )
    }));
  }, []);

  // Remove node
  const removeNode = useCallback((nodeId: string) => {
    setBuilder(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNode: prev.selectedNode?.id === nodeId ? null : prev.selectedNode
    }));
  }, []);

  // Add edge between nodes
  const addEdge = useCallback((source: string, target: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}`,
      source,
      target
    };

    setBuilder(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));

    return newEdge;
  }, []);

  // Remove edge
  const removeEdge = useCallback((edgeId: string) => {
    setBuilder(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId)
    }));
  }, []);

  // Select node
  const selectNode = useCallback((node: WorkflowNode | null) => {
    setBuilder(prev => ({
      ...prev,
      selectedNode: node
    }));
  }, []);

  // Validate workflow
  const validateWorkflow = useCallback(async () => {
    setIsValidating(true);
    setValidationErrors([]);
    const errors: string[] = [];

    // Check for at least one trigger
    const triggerNodes = builder.nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger');
    }

    // Check for at least one action
    const actionNodes = builder.nodes.filter(n => n.type === 'action');
    if (actionNodes.length === 0) {
      errors.push('Workflow must have at least one action');
    }

    // Check all nodes are connected
    const connectedNodes = new Set<string>();
    builder.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const unconnectedNodes = builder.nodes.filter(node => 
      !connectedNodes.has(node.id) && builder.nodes.length > 1
    );

    if (unconnectedNodes.length > 0) {
      errors.push(`${unconnectedNodes.length} node(s) are not connected`);
    }

    // Validate node configurations
    for (const node of builder.nodes) {
      if (node.type === 'action' && node.data.config.type === 'send_sms') {
        if (!node.data.config.message) {
          errors.push(`SMS action "${node.data.label}" is missing message content`);
        }
      }
      if (node.type === 'action' && node.data.config.type === 'send_email') {
        if (!node.data.config.subject || !node.data.config.content) {
          errors.push(`Email action "${node.data.label}" is missing subject or content`);
        }
      }
    }

    setValidationErrors(errors);
    setIsValidating(false);

    return errors.length === 0;
  }, [builder]);

  // Convert visual workflow to database format
  const convertToWorkflow = useCallback(() => {
    const workflow = {
      visual_config: {
        nodes: builder.nodes,
        edges: builder.edges
      },
      triggers: builder.nodes
        .filter(n => n.type === 'trigger')
        .map(n => ({
          trigger_type: n.data.config.trigger_type || 'event',
          event_type: n.data.config.event_type,
          conditions: n.data.config.conditions || {},
          schedule_config: n.data.config.schedule_config
        })),
      actions: builder.nodes
        .filter(n => n.type === 'action')
        .map((n, index) => ({
          action_type: n.data.config.type,
          action_config: n.data.config,
          sequence_order: index,
          delay_minutes: n.data.config.delay || 0
        }))
    };

    return workflow;
  }, [builder]);

  // Test workflow with sample data
  const testWorkflow = useCallback(async (testData: any) => {
    try {
      // Simulate trigger evaluation
      const triggers = builder.nodes.filter(n => n.type === 'trigger');
      console.log('Evaluating triggers with test data:', testData);

      // Simulate action execution
      const actions = builder.nodes.filter(n => n.type === 'action');
      for (const action of actions) {
        console.log(`Executing action: ${action.data.label}`);
        
        if (action.data.config.type === 'send_sms') {
          // Preview SMS
          const message = interpolateVariables(
            action.data.config.message,
            testData
          );
          console.log('SMS Preview:', message);
        } else if (action.data.config.type === 'send_email') {
          // Preview Email
          const subject = interpolateVariables(
            action.data.config.subject,
            testData
          );
          const content = interpolateVariables(
            action.data.config.content,
            testData
          );
          console.log('Email Preview:', { subject, content });
        }
      }

      toast.success('Workflow test completed successfully');
      return true;
    } catch (error) {
      console.error('Error testing workflow:', error);
      toast.error('Failed to test workflow');
      return false;
    }
  }, [builder]);

  // Clear builder
  const clearBuilder = useCallback(() => {
    setBuilder({
      nodes: [],
      edges: [],
      selectedNode: null
    });
    setValidationErrors([]);
  }, []);

  // Load workflow from template or existing workflow
  const loadWorkflow = useCallback((visualConfig: any) => {
    if (visualConfig?.nodes && visualConfig?.edges) {
      setBuilder({
        nodes: visualConfig.nodes,
        edges: visualConfig.edges,
        selectedNode: null
      });
    }
  }, []);

  return {
    builder,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    selectNode,
    validateWorkflow,
    convertToWorkflow,
    testWorkflow,
    clearBuilder,
    loadWorkflow,
    isValidating,
    validationErrors
  };
};

// Helper function to interpolate variables
function interpolateVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}