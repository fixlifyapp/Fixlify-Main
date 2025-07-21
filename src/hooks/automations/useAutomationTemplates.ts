// Stub implementation for automation templates
import { useState } from 'react';
import { AutomationTemplate } from './automation-stubs';

export interface TemplateCategory {
  name: string;
  count: number;
}

export const useAutomationTemplates = () => {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(false);

  return {
    templates,
    categories,
    loading,
    refetch: () => Promise.resolve(),
    createFromTemplate: async () => ({ id: 'test' })
  };
};