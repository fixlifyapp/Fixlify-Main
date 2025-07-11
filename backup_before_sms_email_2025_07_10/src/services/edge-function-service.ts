import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EdgeFunction {
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EdgeFunctionSecret {
  name: string;
  created_at?: string;
}

export class EdgeFunctionService {
  // List all edge functions
  static async listFunctions(): Promise<EdgeFunction[]> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.data.functions.map((name: string) => ({
        name,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('Failed to list edge functions:', error);
      toast.error('Failed to list edge functions');
      throw error;
    }
  }

  // Get edge function details
  static async getFunction(functionName: string): Promise<EdgeFunction> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'get', functionName }
      });

      if (error) throw error;
      return data.data;
    } catch (error: any) {
      console.error('Failed to get edge function:', error);
      toast.error('Failed to get edge function details');
      throw error;
    }
  }

  // Delete edge function
  static async deleteFunction(functionName: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'delete', functionName }
      });

      if (error) throw error;
      toast.info(data.data.message);
    } catch (error: any) {
      console.error('Failed to delete edge function:', error);
      toast.error('Failed to delete edge function');
      throw error;
    }
  }

  // Update edge function
  static async updateFunction(functionName: string, functionCode: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'update', functionName, functionCode }
      });

      if (error) throw error;
      toast.info(data.data.message);
    } catch (error: any) {
      console.error('Failed to update edge function:', error);
      toast.error('Failed to update edge function');
      throw error;
    }
  }

  // List secrets
  static async listSecrets(): Promise<EdgeFunctionSecret[]> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'list-secrets' }
      });

      if (error) throw error;
      return data.data.secrets.map((name: string) => ({
        name,
        created_at: new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('Failed to list secrets:', error);
      toast.error('Failed to list secrets');
      throw error;
    }
  }

  // Set secret
  static async setSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'set-secret', secretName, secretValue }
      });

      if (error) throw error;
      toast.info(data.data.message);
    } catch (error: any) {
      console.error('Failed to set secret:', error);
      toast.error('Failed to set secret');
      throw error;
    }
  }

  // Delete secret
  static async deleteSecret(secretName: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-edge-functions', {
        body: { action: 'delete-secret', secretName }
      });

      if (error) throw error;
      toast.info(data.data.message);
    } catch (error: any) {
      console.error('Failed to delete secret:', error);
      toast.error('Failed to delete secret');
      throw error;
    }
  }

  // Deploy a new edge function
  static async deployFunction(name: string, code: string): Promise<void> {
    // This would use the Supabase CLI or API in production
    toast.info(`To deploy ${name}, use: supabase functions deploy ${name}`);
  }

  // Get function logs
  static async getFunctionLogs(functionName: string): Promise<any[]> {
    // This would fetch from Supabase logs API
    return [];
  }
}