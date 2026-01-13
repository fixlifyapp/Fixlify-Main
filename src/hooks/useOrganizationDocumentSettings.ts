import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';

// Types for organization document settings
export interface OrganizationDocumentSettings {
  id?: string;
  organization_id: string;

  // Footer Settings
  footer_thank_you_message: string;
  footer_confidentiality_text: string;
  footer_contact_text: string;
  footer_show_website: boolean;

  // Estimate Settings
  estimate_validity_days: number;
  estimate_terms_text: string;

  // Invoice Settings
  invoice_payment_terms: string;
  invoice_late_fee_text: string | null;

  // General Settings
  default_tax_rate: number;
  show_company_logo: boolean;
}

// Template variable type
export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

// Available template variables
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: '{{company_name}}', label: 'Company Name', example: 'Kyky Services' },
  { key: '{{document_type}}', label: 'Document Type', example: 'estimate / invoice' },
  { key: '{{phone}}', label: 'Phone Number', example: '+1 289-819-2158' },
  { key: '{{email}}', label: 'Email Address', example: 'info@company.com' },
  { key: '{{website}}', label: 'Website', example: 'https://www.company.com' },
  { key: '{{validity_days}}', label: 'Validity Days', example: '30' },
];

// Default settings values
export const DEFAULT_DOCUMENT_SETTINGS: Omit<OrganizationDocumentSettings, 'id' | 'organization_id'> = {
  footer_thank_you_message: 'Thank you for choosing {{company_name}}!',
  footer_confidentiality_text: 'This {{document_type}} contains confidential information.',
  footer_contact_text: 'For questions, contact us at {{phone}} or {{email}}.',
  footer_show_website: true,
  estimate_validity_days: 30,
  estimate_terms_text: 'This estimate is valid for {{validity_days}} days from the issue date.',
  invoice_payment_terms: 'Payment is due within 30 days of the invoice date.',
  invoice_late_fee_text: null,
  default_tax_rate: 13.00,
  show_company_logo: true,
};

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  values: {
    company_name?: string;
    document_type?: 'estimate' | 'invoice';
    phone?: string;
    email?: string;
    website?: string;
    validity_days?: number;
  }
): string {
  let result = template;

  if (values.company_name) {
    result = result.replace(/\{\{company_name\}\}/g, values.company_name);
  }
  if (values.document_type) {
    result = result.replace(/\{\{document_type\}\}/g, values.document_type);
  }
  if (values.phone) {
    result = result.replace(/\{\{phone\}\}/g, values.phone);
  }
  if (values.email) {
    result = result.replace(/\{\{email\}\}/g, values.email);
  }
  if (values.website) {
    result = result.replace(/\{\{website\}\}/g, values.website);
  }
  if (values.validity_days !== undefined) {
    result = result.replace(/\{\{validity_days\}\}/g, String(values.validity_days));
  }

  return result;
}

export const useOrganizationDocumentSettings = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch organization document settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['organization-document-settings', organization?.id],
    queryFn: async (): Promise<OrganizationDocumentSettings | null> => {
      if (!organization?.id) return null;

      const { data, error } = await supabase
        .from('organization_document_settings')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching document settings:', error);
        return null;
      }

      return data as OrganizationDocumentSettings | null;
    },
    enabled: !!organization?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get effective settings (with defaults merged)
  const effectiveSettings: OrganizationDocumentSettings = {
    ...DEFAULT_DOCUMENT_SETTINGS,
    organization_id: organization?.id || '',
    ...settings,
  };

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<OrganizationDocumentSettings, 'id' | 'organization_id'>>) => {
      if (!organization?.id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('organization_document_settings')
        .upsert({
          organization_id: organization.id,
          ...effectiveSettings,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-document-settings'] });
      toast.success('Document settings saved successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating document settings:', error);
      toast.error('Failed to save document settings');
    },
  });

  // Reset to defaults mutation
  const resetToDefaultsMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('organization_document_settings')
        .upsert({
          organization_id: organization.id,
          ...DEFAULT_DOCUMENT_SETTINGS,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-document-settings'] });
      toast.success('Settings reset to defaults');
    },
    onError: (error: Error) => {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    },
  });

  return {
    // Data
    settings: effectiveSettings,
    rawSettings: settings,
    isLoading,
    error,

    // Mutations
    updateSettings: updateSettingsMutation.mutate,
    updateSettingsAsync: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,

    resetToDefaults: resetToDefaultsMutation.mutate,
    isResetting: resetToDefaultsMutation.isPending,

    // Helpers
    hasCustomSettings: !!settings,
    replaceVariables: replaceTemplateVariables,
    templateVariables: TEMPLATE_VARIABLES,
    defaults: DEFAULT_DOCUMENT_SETTINGS,
  };
};
