
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOrganization } from "./use-organization";

export interface JobCustomFieldValue {
  id: string;
  job_id: string;
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

export const useJobCustomFields = (jobId?: string) => {
  const { organization } = useOrganization();
  const [customFieldValues, setCustomFieldValues] = useState<JobCustomFieldValue[]>([]);
  const [availableFields, setAvailableFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available custom fields for jobs (organization-scoped)
  const fetchAvailableFields = async () => {
    if (!organization?.id) {
      setAvailableFields([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('entity_type', 'job')
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      setAvailableFields(data || []);
    } catch (error) {
      console.error('Error fetching available custom fields:', error);
      toast.error('Failed to load custom fields');
    }
  };

  // Fetch custom field values for a specific job
  const fetchJobCustomFields = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_custom_field_values')
        .select(`
          id,
          job_id,
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
        .eq('job_id', jobId);

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        id: item.id,
        job_id: item.job_id,
        custom_field_id: item.custom_field_id,
        value: item.value || '',
        custom_field: {
          name: item.custom_fields?.name || '',
          field_type: item.custom_fields?.field_type || 'text',
          entity_type: item.custom_fields?.entity_type || 'job',
          required: item.custom_fields?.required || false,
          placeholder: item.custom_fields?.placeholder,
          options: item.custom_fields?.options
        }
      })) || [];

      setCustomFieldValues(formattedData);
    } catch (error) {
      console.error('Error fetching job custom fields:', error);
      toast.error('Failed to load job custom fields');
    }
  };

  // Save custom field values for a job
  const saveCustomFieldValues = async (jobId: string, values: Record<string, string>) => {
    try {
      const promises = Object.entries(values).map(async ([fieldId, value]) => {
        const { error } = await supabase
          .from('job_custom_field_values')
          .upsert({
            job_id: jobId,
            custom_field_id: fieldId,
            value: value
          }, {
            onConflict: 'job_id,custom_field_id'
          });

        if (error) throw error;
      });

      await Promise.all(promises);
      
      if (jobId) {
        await fetchJobCustomFields(jobId);
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
  const updateCustomFieldValue = async (jobId: string, fieldId: string, value: string) => {
    try {
      const { error } = await supabase
        .from('job_custom_field_values')
        .upsert({
          job_id: jobId,
          custom_field_id: fieldId,
          value: value
        }, {
          onConflict: 'job_id,custom_field_id'
        });

      if (error) throw error;
      
      if (jobId) {
        await fetchJobCustomFields(jobId);
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
      if (jobId) {
        await fetchJobCustomFields(jobId);
      }
      setIsLoading(false);
    };

    initializeData();
  }, [jobId, organization?.id]);

  return {
    customFieldValues,
    availableFields,
    isLoading,
    saveCustomFieldValues,
    updateCustomFieldValue,
    refreshFields: () => {
      fetchAvailableFields();
      if (jobId) {
        fetchJobCustomFields(jobId);
      }
    }
  };
};
