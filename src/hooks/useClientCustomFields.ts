import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "./use-organization";

export interface ClientCustomFieldValue {
  id: string;
  client_id: string;
  custom_field_id: string;
  value: string;
  custom_field: {
    name: string;
    field_type: string;
    entity_type: string;
    required: boolean;
    placeholder?: string;
    options?: any;
  };
}

export const useClientCustomFields = (clientId?: string) => {
  const { organization } = useOrganization();
  const [customFieldValues, setCustomFieldValues] = useState<ClientCustomFieldValue[]>([]);
  const [availableFields, setAvailableFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available custom fields for clients (organization-scoped)
  const fetchAvailableFields = async () => {
    if (!organization?.id) {
      setAvailableFields([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('entity_type', 'client')
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      setAvailableFields(data || []);
    } catch (error) {
      console.error('Error fetching available custom fields:', error);
      toast.error('Failed to load custom fields');
    }
  };

  // Fetch custom field values for a specific client
  const fetchClientCustomFields = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_custom_field_values')
        .select(`
          id,
          client_id,
          custom_field_id,
          value,
          custom_fields!inner(
            name,
            field_type,
            entity_type,
            required,
            placeholder,
            options
          )
        `)
        .eq('client_id', clientId);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        client_id: item.client_id,
        custom_field_id: item.custom_field_id,
        value: item.value || '',
        custom_field: {
          name: (item.custom_fields as any)?.name || '',
          field_type: (item.custom_fields as any)?.field_type || 'text',
          entity_type: (item.custom_fields as any)?.entity_type || 'client',
          required: (item.custom_fields as any)?.required || false,
          placeholder: (item.custom_fields as any)?.placeholder,
          options: (item.custom_fields as any)?.options
        }
      })) || [];

      setCustomFieldValues(formattedData);
    } catch (error) {
      console.error('Error fetching client custom fields:', error);
      toast.error('Failed to load client custom fields');
    }
  };

  // Save custom field values for a client
  const saveCustomFieldValues = async (clientId: string, values: Record<string, string>) => {
    try {
      const promises = Object.entries(values).map(async ([fieldId, value]) => {
        const { error } = await supabase
          .from('client_custom_field_values')
          .upsert({
            client_id: clientId,
            custom_field_id: fieldId,
            value: value
          }, {
            onConflict: 'client_id,custom_field_id'
          });

        if (error) throw error;
      });

      await Promise.all(promises);

      if (clientId) {
        await fetchClientCustomFields(clientId);
      }

      toast.success('Custom field values saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving custom field values:', error);
      toast.error('Failed to save custom field values');
      return false;
    }
  };

  // Update a single custom field value
  const updateCustomFieldValue = async (clientId: string, fieldId: string, value: string) => {
    try {
      const { error } = await supabase
        .from('client_custom_field_values')
        .upsert({
          client_id: clientId,
          custom_field_id: fieldId,
          value: value
        }, {
          onConflict: 'client_id,custom_field_id'
        });

      if (error) throw error;

      if (clientId) {
        await fetchClientCustomFields(clientId);
      }

      return true;
    } catch (error) {
      console.error('Error updating custom field value:', error);
      toast.error('Failed to update custom field value');
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchAvailableFields();
      if (clientId) {
        await fetchClientCustomFields(clientId);
      }
      setIsLoading(false);
    };

    initializeData();
  }, [clientId, organization?.id]);

  return {
    customFieldValues,
    availableFields,
    isLoading,
    saveCustomFieldValues,
    updateCustomFieldValue,
    refreshFields: () => {
      fetchAvailableFields();
      if (clientId) {
        fetchClientCustomFields(clientId);
      }
    }
  };
};
