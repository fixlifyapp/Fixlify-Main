
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  preview_image_url?: string;
  template_config: {
    triggers: any[];
    actions: any[];
    variables: any[];
    visual_config?: any;
  };
  usage_count: number;
  is_featured: boolean;
  success_rate?: number;
  average_revenue?: number;
  estimated_time_saved?: string;
  required_integrations: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  templateCount: number;
}

export const useAutomationTemplates = () => {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { organization } = useOrganization();

  // Template categories
  const categories: TemplateCategory[] = [
    { 
      id: 'all', 
      name: 'All Templates', 
      icon: '🎯', 
      description: 'Browse all automation templates',
      templateCount: templates.length 
    },
    { 
      id: 'missed_call', 
      name: 'Missed Call Follow-ups', 
      icon: '📞', 
      description: 'Automatically follow up on missed calls',
      templateCount: templates.filter(t => t.category === 'missed_call').length 
    },
    { 
      id: 'appointment', 
      name: 'Appointment Reminders', 
      icon: '📅', 
      description: 'Send reminders before appointments',
      templateCount: templates.filter(t => t.category === 'appointment').length 
    },
    { 
      id: 'payment', 
      name: 'Payment Collection', 
      icon: '💰', 
      description: 'Automate payment reminders and collection',
      templateCount: templates.filter(t => t.category === 'payment').length 
    },
    { 
      id: 'review', 
      name: 'Review Requests', 
      icon: '⭐', 
      description: 'Request reviews from satisfied customers',
      templateCount: templates.filter(t => t.category === 'review').length 
    },
    { 
      id: 'estimate', 
      name: 'Estimate Follow-ups', 
      icon: '📋', 
      description: 'Follow up on sent estimates',
      templateCount: templates.filter(t => t.category === 'estimate').length 
    },
    { 
      id: 'customer_journey', 
      name: 'Customer Journey', 
      icon: '🛤️', 
      description: 'Complete customer lifecycle automations',
      templateCount: templates.filter(t => t.category === 'customer_journey').length 
    }
  ];

  // Fetch templates from database
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load automation templates');
    } finally {
      setLoading(false);
    }
  };

  // Get recommended templates based on organization type
  const recommendedTemplates = useMemo(() => {
    if (!templates.length) return [];

    // Basic recommendation logic - can be enhanced with AI
    const featuredTemplates = templates.filter(t => t.is_featured);
    const popularTemplates = templates
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 3);

    // Combine and deduplicate
    const recommended = [...featuredTemplates, ...popularTemplates];
    const uniqueTemplates = Array.from(
      new Map(recommended.map(t => [t.id, t])).values()
    );

    return uniqueTemplates.slice(0, 6);
  }, [templates]);

  // Filter templates based on category and search
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  // Use template - FIXED VERSION
  const useTemplate = async (templateId: string) => {
    try {
      console.log('Loading template:', templateId);
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        throw new Error('Template not found');
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from('automation_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      if (updateError) {
        console.error('Error updating usage count:', updateError);
      }

      // Log template usage for analytics
      if (organization?.id) {
        const { error: logError } = await supabase
          .from('automation_template_usage')
          .insert({
            template_id: templateId,
            organization_id: organization.id,
            used_at: new Date().toISOString()
          });

        if (logError) {
          console.error('Error logging template usage:', logError);
        }
      }

      console.log('Template loaded successfully:', template);
      return template;
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to load template');
      return null;
    }
  };

  // Create custom template
  const createTemplate = async (template: Omit<AutomationTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      const { data, error } = await supabase
        .from('automation_templates')
        .insert({
          ...template,
          organization_id: organization?.id,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates([data, ...templates]);
      toast.success('Template created successfully');
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  };

  // Get template preview data
  const getTemplatePreview = (template: AutomationTemplate) => {
    const previewData: any = {
      client: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, USA'
      },
      job: {
        id: 'JOB-001',
        title: 'HVAC System Repair',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        scheduled_time: '2:00 PM',
        total: '$450.00'
      },
      company: {
        name: organization?.name || 'Your Company',
        phone: organization?.phone || '(555) 987-6543',
        email: organization?.email || 'info@company.com'
      }
    };

    return previewData;
  };

  // Initialize
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    filteredTemplates,
    recommendedTemplates,
    categories,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    useTemplate,
    createTemplate,
    getTemplatePreview,
    refetch: fetchTemplates
  };
};
