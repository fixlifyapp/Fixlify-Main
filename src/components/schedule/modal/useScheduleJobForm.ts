import { useState, useEffect } from "react";
import { useClientsOptimized } from "@/hooks/useClientsOptimized";
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

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

interface CompanySettings {
  timezone?: string;
  business_hours?: BusinessHours;
  default_job_duration?: number;
}

interface UseScheduleJobFormProps {
  preselectedClientId?: string;
  companySettings?: CompanySettings | null;
}

export const useScheduleJobForm = ({ preselectedClientId, companySettings }: UseScheduleJobFormProps) => {
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
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  // Configuration hooks with dynamic data from database
  const { clients, isLoading: clientsLoading } = useClientsOptimized();
  const { items: jobTypes, isLoading: jobTypesLoading } = useJobTypes();
  const { items: leadSources, isLoading: leadSourcesLoading } = useLeadSources();
  const { items: tags, isLoading: tagsLoading } = useTags();
  const { availableFields: customFields, isLoading: customFieldsLoading } = useJobCustomFields();
  const { properties: clientProperties, isLoading: propertiesLoading } = useClientProperties(formData.client_id);

  // Apply defaults from settings and config items on load
  useEffect(() => {
    if (defaultsApplied) return;

    // Wait for config items to load
    if (jobTypesLoading || leadSourcesLoading) return;

    const updates: Partial<FormData> = {};

    // Auto-select default job type on load (not just during validation)
    if (!formData.job_type && jobTypes.length > 0) {
      const defaultJobType = jobTypes.find(jt => jt.is_default) || jobTypes[0];
      updates.job_type = defaultJobType.name;
    }

    // Auto-select default lead source on load
    if (!formData.lead_source && leadSources.length > 0) {
      const defaultLeadSource = leadSources.find(ls => ls.is_default) || leadSources[0];
      updates.lead_source = defaultLeadSource.name;
    }

    // Apply duration from settings if available
    if (companySettings?.default_job_duration) {
      updates.duration = String(companySettings.default_job_duration);
    }

    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      setDefaultsApplied(true);
    }
  }, [jobTypes, leadSources, jobTypesLoading, leadSourcesLoading, companySettings, defaultsApplied, formData.job_type, formData.lead_source]);

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

  // Apply a job template to populate form fields
  const applyTemplate = (template: {
    name: string;
    description: string;
    category?: string;
    estimatedDuration?: number;
    tasks?: string[];
  }) => {
    setFormData(prev => ({
      ...prev,
      description: `${template.name}\n\n${template.description}`,
      job_type: template.category || prev.job_type,
      tasks: template.tasks || [],
      duration: template.estimatedDuration
        ? String(template.estimatedDuration * 60) // Convert hours to minutes
        : prev.duration,
    }));
    setFormErrors([]);
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
    setDefaultsApplied(false); // Allow defaults to be re-applied on next open
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.client_id) {
      errors.push("Please select a client");
    }

    // Validate schedule date/time
    if (!formData.schedule_start) {
      errors.push("Please select a scheduled date and time");
    } else {
      const startDate = new Date(formData.schedule_start);
      const now = new Date();

      // Check if schedule_start is in the past (allow some buffer for same-day scheduling)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (startDate < startOfToday) {
        errors.push("Scheduled date cannot be in the past");
      }

      // Validate schedule_end is after schedule_start
      if (formData.schedule_end) {
        const endDate = new Date(formData.schedule_end);
        if (endDate <= startDate) {
          errors.push("End time must be after start time");
        }
      }
    }

    // Job type validation - now just check if selected (defaults applied on load)
    if (!formData.job_type) {
      errors.push("Please select a job type");
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
    companySettings, // Expose settings for business hours etc.
    handleChange,
    handleSelectChange,
    handleTagToggle,
    handleAddTask,
    handleRemoveTask,
    handleCustomFieldChange,
    applyTemplate,
    resetForm,
    validateForm
  };
}; 