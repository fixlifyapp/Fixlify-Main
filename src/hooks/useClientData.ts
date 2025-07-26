// UNIFIED CLIENT DATA HOOK
// Handles all client CRUD operations with proper typing

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedClient, ClientFilters, ClientSortOptions } from '@/types/client';

export const useClientData = () => {
  const [clients, setClients] = useState<UnifiedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async (filters?: ClientFilters, sortOptions?: ClientSortOptions) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('clients')
        .select('*');

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`);
      }

      // Apply sorting
      if (sortOptions) {
        query = query.order(sortOptions.field, { ascending: sortOptions.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedClients: UnifiedClient[] = (data || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
        zip: client.zip,
        country: client.country || 'USA',
        company: client.company,
        notes: client.notes,
        status: client.status || 'active',
        type: client.type || 'Residential',
        tags: client.tags || [],
        created_at: client.created_at,
        updated_at: client.updated_at,
        created_by: client.created_by,
        user_id: client.user_id
      }));

      setClients(transformedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const createClient = async (clientData: Partial<UnifiedClient>): Promise<UnifiedClient | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          state: clientData.state,
          zip: clientData.zip,
          country: clientData.country || 'USA',
          company: clientData.company,
          notes: clientData.notes,
          status: clientData.status || 'active',
          type: clientData.type || 'Residential',
          tags: clientData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      const newClient = {
        ...data,
        country: data.country || 'USA',
        status: data.status || 'active',
        type: data.type || 'Residential',
        tags: data.tags || []
      } as UnifiedClient;

      setClients(prev => [newClient, ...prev]);
      toast.success('Client created successfully');
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      toast.error('Failed to create client');
      return null;
    }
  };

  const updateClient = async (id: string, clientData: Partial<UnifiedClient>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          state: clientData.state,
          zip: clientData.zip,
          country: clientData.country,
          company: clientData.company,
          notes: clientData.notes,
          status: clientData.status,
          type: clientData.type,
          tags: clientData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id 
          ? { ...client, ...clientData, updated_at: new Date().toISOString() }
          : client
      ));

      toast.success('Client updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating client:', err);
      toast.error('Failed to update client');
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      toast.success('Client deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client');
      return false;
    }
  };

  const getClientById = (id: string): UnifiedClient | undefined => {
    return clients.find(client => client.id === id);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    refetch: () => fetchClients()
  };
};