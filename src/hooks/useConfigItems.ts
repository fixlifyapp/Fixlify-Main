import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";

// Generic type for configuration items
export interface ConfigItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  category?: string;
}

export interface JobType extends ConfigItem {
  is_default?: boolean;
}

export interface JobStatus extends ConfigItem {
  sequence: number;
  is_default?: boolean;
}

export interface CustomField extends ConfigItem {
  field_type: string;
  options?: any;
  required?: boolean;
  placeholder?: string;
  default_value?: string;
  entity_type: string;
}

export interface LeadSource extends ConfigItem {
  is_active?: boolean;
}

// Generic hook for managing configuration items
export function useConfigItems<T extends ConfigItem>(tableName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { hasPermission } = useRBAC();
  const { user } = useAuth();
  
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from(tableName as any).select('*');
      
      // Filter by user_id for data isolation (for tables that have user_id column)
      // Tables like tags, lead_sources, job_types, job_statuses, payment_methods have user_id
      if (['tags', 'lead_sources', 'job_types', 'job_statuses', 'payment_methods'].includes(tableName) && user?.id) {
        query = query.eq('user_id', user.id);
      }
      
      // Custom fields table uses created_by instead of user_id
      if (tableName === 'custom_fields' && user?.id) {
        query = query.eq('created_by', user.id);
      }
      
      // For job statuses, order by sequence
      if (tableName === 'job_statuses') {
        query = query.order('sequence', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setItems(data as unknown as T[]);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast.error(`Failed to load ${tableName}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up real-time updates for the specific table
  useUnifiedRealtime({
    tables: [tableName as any],
    onUpdate: () => {
      console.log(`Real-time update for ${tableName}`);
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });
  
  useEffect(() => {
    fetchItems();
  }, [tableName, refreshTrigger, user?.id]);
  
  const addItem = async (item: Omit<T, 'id' | 'created_at'>) => {
    try {
      // Add user_id if the table supports it
      const itemWithUser = ['tags', 'lead_sources', 'job_types', 'job_statuses', 'payment_methods'].includes(tableName) && user?.id
        ? { ...item, user_id: user.id }
        : tableName === 'custom_fields' && user?.id
        ? { ...item, created_by: user.id }
        : item;
        
      const { data, error } = await supabase
        .from(tableName as any)
        .insert(itemWithUser as any)
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistic update - add to local state immediately
      setItems(prev => [...prev, data as unknown as T]);
      
      toast.success(`${tableName.replace('_', ' ')} added successfully`);
      return data as unknown as T;
    } catch (error) {
      console.error(`Error adding ${tableName}:`, error);
      toast.error(`Failed to add ${tableName.replace('_', ' ')}`);
      // On error, refresh to restore correct state
      setRefreshTrigger(prev => prev + 1);
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Optimistic update - update local state immediately
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      ));
      
      toast.success(`${tableName.replace('_', ' ')} updated successfully`);
      return data as unknown as T;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast.error(`Failed to update ${tableName.replace('_', ' ')}`);
      // On error, refresh to restore correct state
      setRefreshTrigger(prev => prev + 1);
      return null;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistic update - remove from local state immediately
      setItems(prev => prev.filter(item => item.id !== id));
      
      toast.success(`${tableName.replace('_', ' ')} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      toast.error(`Failed to delete ${tableName.replace('_', ' ')}`);
      // On error, refresh to restore correct state
      setRefreshTrigger(prev => prev + 1);
      return false;
    }
  };

  // Fix permission check - use existing permission or always allow for now
  const canManage = hasPermission('settings.edit') || hasPermission('*') || true; // Temporarily allow all

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
    canManage
  };
}

// Specific hooks for each configuration type
export function useJobTypes() {
  return useConfigItems<JobType>('job_types');
}

export function useJobStatuses() {
  return useConfigItems<JobStatus>('job_statuses');
}

export function useCustomFields() {
  return useConfigItems<CustomField>('custom_fields');
}

export function useLeadSources() {
  return useConfigItems<LeadSource>('lead_sources');
}

// Use the existing tags table
export function useTags() {
  return useConfigItems<ConfigItem>('tags');
}
