
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface AutomationVariable {
  id: string;
  name: string;
  variable_key: string;
  description: string;
  data_source: string;
  field_path: string;
}

export interface AutomationTrigger {
  id: string;
  automation_id: string;
  trigger_type: 'event' | 'schedule' | 'condition';
  event_type?: string;
  conditions: Record<string, any>;
  schedule_config?: Record<string, any>;
}

export interface AutomationAction {
  id: string;
  automation_id: string;
  action_type: 'send_sms' | 'send_email' | 'make_call' | 'create_task' | 'webhook';
  action_config: Record<string, any>;
  sequence_order: number;
  delay_minutes: number;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  category: string;
  template_id?: string;
  status: 'active' | 'inactive' | 'draft';
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  success_count: number;
  failure_count: number;
  triggers?: AutomationTrigger[];
  actions?: AutomationAction[];
}

export interface AutomationPerformance {
  id: string;
  automation_id: string;
  date: string;
  triggers_fired: number;
  actions_executed: number;
  success_rate: number;
  engagement_rate: number;
}

export const useAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [variables, setVariables] = useState<AutomationVariable[]>([]);
  const [performance, setPerformance] = useState<AutomationPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAutomations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('automations')
        .select(`
          *,
          triggers:automation_triggers(*),
          actions:automation_actions(*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Type cast the data to ensure status field compatibility
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'active' | 'inactive' | 'draft'
      })) as Automation[];
      
      setAutomations(typedData);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    }
  };

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_variables')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setVariables(data || []);
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };

  const fetchPerformance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('automation_performance')
        .select('*')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });
        
      if (error) throw error;
      setPerformance(data || []);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchAutomations(),
        fetchVariables(),
        fetchPerformance()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const createAutomation = async (automation: Omit<Automation, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'run_count' | 'success_count' | 'failure_count'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('automations')
        .insert({
          ...automation,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await fetchAutomations();
      toast.success('Automation created successfully');
      return data;
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
      return null;
    }
  };

  const updateAutomation = async (id: string, updates: Partial<Automation>) => {
    try {
      const { error } = await supabase
        .from('automations')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      await fetchAutomations();
      toast.success('Automation updated successfully');
    } catch (error) {
      console.error('Error updating automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistic update - remove from local state immediately
      setAutomations(prev => prev.filter(automation => automation.id !== id));
      
      toast.success('Automation deleted successfully');
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
      // On error, refresh to restore correct state
      await fetchAutomations();
    }
  };

  const executeAutomation = async (id: string, triggerData?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: { automationId: id, triggerData }
      });
      
      if (error) throw error;
      
      toast.success('Automation executed successfully');
      await fetchAutomations();
      return data;
    } catch (error) {
      console.error('Error executing automation:', error);
      toast.error('Failed to execute automation');
      return null;
    }
  };

  return {
    automations,
    variables,
    performance,
    isLoading,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    executeAutomation,
    refreshAutomations: fetchAutomations
  };
};
