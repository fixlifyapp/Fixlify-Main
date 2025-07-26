import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { useJobTypes, useLeadSources, useTags } from "@/hooks/useConfigItems";
import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { useClientProperties } from "@/hooks/useClientProperties";
import { toast } from "sonner";

export interface FormData {
  client_id: string;
  property_id: string;
  description: string;
  job_type: string;
  lead_source: string;
  schedule_start: string;
  schedule_end: string;
  technician_id: string;
  duration: string;
  tags: string[];
  tasks: string[];
  customFields: Record<string, string>;
  property_type?: string;
  property_age?: string;
  property_size?: string;
  previous_service_date?: string;
}

interface UseScheduleJobFormProps {
  preselectedClientId?: string;
}

export const useScheduleJobForm = ({ preselectedClientId }: UseScheduleJobFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    client_id: preselectedClientId || "",
    property_id: "",
    description: "",
    job_type: "",
    lead_source: "",
    schedule_start: "",
    schedule_end: "",
    technician_id: "",
    duration: "60",
    tags: [],
    tasks: [],
    customFields: {},
    property_type: "",
    property_age: "",
    property_size: "",
    previous_service_date: "",
  });
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  
  // Configuration hooks with dynamic data from database
  const { clients, isLoading: clientsLoading } = useClients();
  const { items: jobTypes, isLoading: jobTypesLoading } = useJobTypes();
  const { items: leadSources, isLoading: leadSourcesLoading } = useLeadSources();
  const { items: tags, isLoading: tagsLoading } = useTags();
  const { availableFields: customFields, isLoading: customFieldsLoading } = useJobCustomFields();
  const { properties: clientProperties, isLoading: propertiesLoading } = useClientProperties(formData.client_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setFormErrors([]);
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors([]);
  };

  const handleTagToggle = (tagId: string) => {
    // Find the tag by ID to get its name
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;
    
    const tagName = tag.name;
    const newTags = formData.tags.includes(tagName)
      ? formData.tags.filter(name => name !== tagName)
      : [...formData.tags, tagName];
    setFormData({ ...formData, tags: newTags });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setFormData({ 
        ...formData, 
        tasks: [...formData.tasks, newTask.trim()] 
      });
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setFormData({ 
      ...formData, 
      tasks: formData.tasks.filter((_, i) => i !== index) 
    });
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      customFields: { ...formData.customFields, [fieldId]: value }
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: preselectedClientId || "",
      property_id: "",
      description: "",
      job_type: "",
      lead_source: "",
      schedule_start: "",
      schedule_end: "",
      technician_id: "",
      duration: "60",
      tags: [],
      tasks: [],
      customFields: {},
      property_type: "",
      property_age: "",
      property_size: "",
      previous_service_date: "",
    });
    setNewTask("");
    setFormErrors([]);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.client_id) {
      errors.push("Please select a client");
    }
    
    // Auto-select default job type if none selected
    if (!formData.job_type && jobTypes.length > 0) {
      const defaultJobType = jobTypes.find(jt => jt.is_default) || jobTypes[0];
      setFormData(prev => ({ ...prev, job_type: defaultJobType.name }));
    }

    // Validate required custom fields
    const requiredFields = customFields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData.customFields[field.id]?.trim()) {
        errors.push(`${field.name} is required`);
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    newTask,
    setNewTask,
    clients,
    clientsLoading,
    jobTypes,
    jobTypesLoading,
    leadSources,
    leadSourcesLoading,
    tags,
    tagsLoading,
    customFields,
    customFieldsLoading,
    clientProperties,
    propertiesLoading,
    handleChange,
    handleSelectChange,
    handleTagToggle,
    handleAddTask,
    handleRemoveTask,
    handleCustomFieldChange,
    resetForm,
    validateForm
  };
}; 