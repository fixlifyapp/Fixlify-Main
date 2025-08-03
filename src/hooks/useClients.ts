import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateNextId } from "@/utils/idGeneration";
import { useAuth } from "@/hooks/use-auth";
import { formatPhoneForTelnyx } from "@/utils/phoneUtils";

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tags?: string[];
  type?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseClientsOptions {
  page?: number;
  pageSize?: number;
}

export const useClients = (options: UseClientsOptions = {}) => {
  const { page = 1, pageSize = 10 } = options;
  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      if (!isAuthenticated) {
        console.log("User not authenticated, skipping client fetch");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching clients with simplified RLS...");
        
        // Get total count - filtered by user_id
        const { count, error: countError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${user?.id},created_by.eq.${user?.id}`);
        
        if (countError) {
          console.error("Error getting client count:", countError);
          throw countError;
        }
        
        setTotalCount(count || 0);

        // Get paginated data - filtered by user_id
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`user_id.eq.${user?.id},created_by.eq.${user?.id}`)
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);
          
        if (error) {
          console.error("Error fetching clients:", error);
          throw error;
        }
        
        console.log("✅ Clients fetched successfully:", data?.length || 0);
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [refreshTrigger, page, pageSize, isAuthenticated]);

  const addClient = async (client: { name: string } & Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => {
    console.log('=== addClient Debug Start ===');
    console.log('1. isAuthenticated:', isAuthenticated);
    console.log('2. User:', user);
    console.log('3. User ID:', user?.id);
    console.log('4. Input client data:', client);
    
    if (!isAuthenticated) {
      toast.error('Please log in to add clients');
      throw new Error('Not authenticated');
    }
    
    try {
      // Generate new client ID using the database function
      let clientId = await generateNextId('client');
      console.log('5. Generated client ID:', clientId);
      
      // Double-check the ID doesn't exist (belt and suspenders approach)
      let idCheckAttempts = 0;
      while (idCheckAttempts < 5) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('id', clientId)
          .single();
          
        if (!existingClient) {
          // ID is unique, we can use it
          break;
        }
        
        console.warn(`ID ${clientId} already exists, generating a new one...`);
        idCheckAttempts++;
        clientId = await generateNextId('client');
      }
      
      if (idCheckAttempts >= 5) {
        throw new Error('Failed to generate unique client ID after 5 attempts');
      }
      
      // Format phone number if provided
      const clientData = {
        ...client,
        phone: client.phone ? formatPhoneForTelnyx(client.phone) : client.phone,
        id: clientId,
        user_id: user?.id,
        created_by: user?.id
      };
      
      console.log('6. Final client data to insert:', clientData);
      console.log('7. Phone formatting details:', {
        original: client.phone,
        formatted: clientData.phone,
        isEmpty: !client.phone,
        isNull: client.phone === null,
        isUndefined: client.phone === undefined
      });
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();
      
      console.log('8. Supabase response:', { data, error });
      
      if (error) {
        console.error('9. Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Extract the actual ID from the error message if it's a duplicate key error
        if (error.code === '23505') {
          console.error('DUPLICATE KEY ERROR - Attempted to use ID:', clientData.id);
          console.error('Full client data that failed:', clientData);
          
          // Try to find what client has this ID
          const { data: existingClient } = await supabase
            .from('clients')
            .select('id, name, created_at, user_id')
            .eq('id', clientData.id)
            .single();
            
          if (existingClient) {
            console.error('Existing client with this ID:', existingClient);
            toast.error(`Client ID ${clientData.id} already exists for client: ${existingClient.name}`);
          }
        }
        
        throw error;
      }
      
      // If we're on the first page, add the new client to the list
      if (page === 1) {
        setClients(prev => [data, ...prev.slice(0, pageSize - 1)]);
      }
      setTotalCount(prev => prev + 1);
      
      toast.success('Client added successfully');
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update clients');
      return null;
    }
    
    try {
      // Format phone number if it's being updated
      const updateData = {
        ...updates,
        phone: updates.phone ? formatPhoneForTelnyx(updates.phone) : updates.phone
      };
      
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .or(`user_id.eq.${user?.id},created_by.eq.${user?.id}`)
        .select()
        .single();
        
      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));
      
      toast.success('Client updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to delete clients');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .or(`user_id.eq.${user?.id},created_by.eq.${user?.id}`);
        
      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      setTotalCount(prev => prev - 1);
      
      toast.success('Client deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    clients,
    isLoading,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage,
    hasPreviousPage,
    addClient,
    updateClient,
    deleteClient,
    refreshClients: () => setRefreshTrigger(prev => prev + 1)
  };
};
