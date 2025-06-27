import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AutomationRule {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger_type: string;
  trigger_conditions?: any[];
  action_type: string;
  action_config: any;
  conditions?: {
    operator: 'AND' | 'OR';
    rules: any[];
  };
  delivery_window: {
    businessHoursOnly: boolean;
    allowedDays: string[];
    timeRange?: { start: string; end: string };
  };
  multi_channel_config: {
    primaryChannel: 'sms' | 'email';
    fallbackEnabled: boolean;
    fallbackChannel?: 'sms' | 'email';
    fallbackDelayHours: number;
  };
  execution_count?: number;
  success_count?: number;
  last_executed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AutomationMetrics {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successRate: number;
  messagesSent: number;
  responsesReceived: number;
  revenueGenerated: number;
  recentExecutions: number;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_config: any;
  usage_count: number;
  is_featured: boolean;
  average_success_rate?: number;
  tags: string[];
}

export const useAutomations = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalRules: 0,
    activeRules: 0,
    totalExecutions: 0,
    successRate: 0,
    messagesSent: 0,
    responsesReceived: 0,
    revenueGenerated: 0,
    recentExecutions: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // Load all automations
  const loadAutomations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        trigger_type: item.trigger_type,
        trigger_conditions: item.trigger_conditions,
        action_type: item.action_type,
        action_config: item.action_config,
        conditions: item.conditions,
        delivery_window: item.delivery_window,
        multi_channel_config: item.multi_channel_config,
        execution_count: item.execution_count,
        success_count: item.success_count,
        last_executed_at: item.last_executed_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setAutomations(formattedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load automations';
      setError(errorMessage);
      console.error('Error loading automations:', err);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load automation templates
  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('automation_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  }, []);

  // Load automation metrics
  const loadMetrics = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_automation_analytics', { org_id: user.id });

      if (error) throw error;

      if (data) {
        setMetrics({
          totalRules: data.totalrules || 0,
          activeRules: data.activerules || 0,
          totalExecutions: data.totalexecutions || 0,
          successRate: Number(data.successrate) || 0,
          messagesSent: data.messagessent || 0,
          responsesReceived: data.responsesreceived || 0,
          revenueGenerated: Number(data.revenuegenerated) || 0,
          recentExecutions: data.recentexecutions || 0
        });
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }, [user?.id]);

  // Create or update automation
  const saveAutomation = useCallback(async (automation: AutomationRule) => {
    if (!user?.id) return;

    try {
      const automationData = {
        organization_id: user.id,
        name: automation.name,
        description: automation.description,
        status: automation.status,
        trigger_type: automation.trigger_type,
        trigger_conditions: automation.trigger_conditions || [],
        action_type: automation.action_type,
        action_config: automation.action_config,
        conditions: automation.conditions,
        delivery_window: automation.delivery_window,
        multi_channel_config: automation.multi_channel_config,
        ai_enhanced: true // Mark as AI enhanced since we have AI features
      };

      let result;
      if (automation.id) {
        // Update existing
        result = await supabase
          .from('automation_workflows')
          .update(automationData)
          .eq('id', automation.id)
          .eq('organization_id', user.id);
      } else {
        // Create new
        result = await supabase
          .from('automation_workflows')
          .insert(automationData);
      }

      if (result.error) throw result.error;

      toast.success(automation.id ? 'Automation updated successfully' : 'Automation created successfully');
      await loadAutomations();
      await loadMetrics();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save automation';
      console.error('Error saving automation:', err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, loadAutomations, loadMetrics]);

  // Delete automation
  const deleteAutomation = useCallback(async (automationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', automationId)
        .eq('organization_id', user.id);

      if (error) throw error;

      toast.success('Automation deleted successfully');
      await loadAutomations();
      await loadMetrics();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete automation';
      console.error('Error deleting automation:', err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, loadAutomations, loadMetrics]);

  // Toggle automation status
  const toggleAutomationStatus = useCallback(async (automationId: string, currentStatus: string) => {
    if (!user?.id) return;

    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('automation_workflows')
        .update({ status: newStatus })
        .eq('id', automationId)
        .eq('organization_id', user.id);

      if (error) throw error;

      toast.success(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
      await loadAutomations();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update automation status';
      console.error('Error toggling automation status:', err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, loadAutomations]);

  // Test automation
  const testAutomation = useCallback(async (automationId: string, testData?: any) => {
    if (!user?.id) return;

    try {
      // Get automation details
      const { data: automation, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('id', automationId)
        .eq('organization_id', user.id)
        .single();

      if (error || !automation) {
        throw new Error('Automation not found');
      }

      // Call the automation trigger function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/automation-trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          type: 'test_automation',
          organization_id: user.id,
          trigger_type: automation.trigger_type,
          test_data: {
            client_name: 'Test Customer',
            client_phone: '+1234567890',
            client_email: 'test@example.com',
            job_title: 'Test Job',
            job_type: 'Test',
            company_name: 'Your Company',
            company_phone: '(555) 999-0000',
            ...testData
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Test automation executed successfully');
      } else {
        toast.error(`Test failed: ${result.error || 'Unknown error'}`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test automation';
      console.error('Error testing automation:', err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id]);

  // Trigger automation manually
  const triggerAutomation = useCallback(async (triggerType: string, contextData: any) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/automation-trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          type: 'trigger_event',
          trigger_type: triggerType,
          event_id: `manual-${Date.now()}`,
          organization_id: user.id,
          context_data: contextData
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Triggered ${result.workflows_found} automation(s)`);
      } else {
        toast.error(`Trigger failed: ${result.error || 'Unknown error'}`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger automation';
      console.error('Error triggering automation:', err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id]);

  // Use template to create automation
  const useTemplate = useCallback(async (templateId: string) => {
    try {
      const { data: template, error } = await supabase
        .from('automation_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        throw new Error('Template not found');
      }

      // Increment usage count
      await supabase
        .from('automation_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', templateId);

      return template.template_config;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load template';
      console.error('Error using template:', err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Get automation history
  const getAutomationHistory = useCallback(async (automationId?: string, limit = 50) => {
    if (!user?.id) return [];

    try {
      let query = supabase
        .from('automation_executions')
        .select(`
          *,
          automation_workflows!inner(name)
        `)
        .eq('organization_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(limit);

      if (automationId) {
        query = query.eq('workflow_id', automationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading automation history:', err);
      return [];
    }
  }, [user?.id]);

  // Get message logs
  const getMessageLogs = useCallback(async (automationId?: string, limit = 50) => {
    if (!user?.id) return [];

    try {
      let query = supabase
        .from('automation_messages')
        .select(`
          *,
          automation_workflows!inner(name)
        `)
        .eq('organization_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (automationId) {
        query = query.eq('workflow_id', automationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading message logs:', err);
      return [];
    }
  }, [user?.id]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadAutomations();
      loadTemplates();
      loadMetrics();
    }
  }, [user?.id, loadAutomations, loadTemplates, loadMetrics]);

  return {
    // State
    automations,
    templates,
    metrics,
    loading,
    error,

    // Actions
    loadAutomations,
    loadTemplates,
    loadMetrics,
    saveAutomation,
    deleteAutomation,
    toggleAutomationStatus,
    testAutomation,
    triggerAutomation,
    useTemplate,
    getAutomationHistory,
    getMessageLogs,

    // Computed values
    activeAutomations: automations.filter(a => a.status === 'active'),
    draftAutomations: automations.filter(a => a.status === 'draft'),
    pausedAutomations: automations.filter(a => a.status === 'paused'),
    featuredTemplates: templates.filter(t => t.is_featured),
  };
};
