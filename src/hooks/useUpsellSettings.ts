import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// Types for upsell configuration
export interface UpsellDocumentConfig {
  enabled: boolean;
  auto_select: boolean;
  products: string[];
}

export interface UpsellConfig {
  estimates: UpsellDocumentConfig;
  invoices: UpsellDocumentConfig;
}

export interface UpsellProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

const DEFAULT_UPSELL_CONFIG: UpsellConfig = {
  estimates: {
    enabled: true,
    auto_select: true,
    products: []
  },
  invoices: {
    enabled: true,
    auto_select: false,
    products: []
  }
};

export const useUpsellSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch upsell configuration
  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ['upsell-settings', user?.id],
    queryFn: async (): Promise<UpsellConfig> => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('upsell_config')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching upsell config:', error);
        return DEFAULT_UPSELL_CONFIG;
      }

      if (!data?.upsell_config) {
        return DEFAULT_UPSELL_CONFIG;
      }

      // Merge with defaults to ensure all fields exist
      const savedConfig = data.upsell_config as UpsellConfig;
      return {
        estimates: { ...DEFAULT_UPSELL_CONFIG.estimates, ...savedConfig.estimates },
        invoices: { ...DEFAULT_UPSELL_CONFIG.invoices, ...savedConfig.invoices }
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch all warranty products
  const { data: allWarrantyProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['warranty-products', user?.id],
    queryFn: async (): Promise<UpsellProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, category')
        .eq('category', 'Warranties')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching warranty products:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get products that should be auto-added for estimates
  const estimateProducts = allWarrantyProducts.filter(
    p => config?.estimates.products.includes(p.id)
  );

  // Get products that should be auto-added for invoices
  const invoiceProducts = allWarrantyProducts.filter(
    p => config?.invoices.products.includes(p.id)
  );

  // Update upsell configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<UpsellConfig>) => {
      if (!user?.id) throw new Error('No user found');

      const updatedConfig: UpsellConfig = {
        estimates: {
          ...DEFAULT_UPSELL_CONFIG.estimates,
          ...config?.estimates,
          ...newConfig.estimates
        },
        invoices: {
          ...DEFAULT_UPSELL_CONFIG.invoices,
          ...config?.invoices,
          ...newConfig.invoices
        }
      };

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          upsell_config: updatedConfig,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      return updatedConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upsell-settings'] });
      toast.success('Upsell settings saved successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating upsell settings:', error);
      toast.error('Failed to save upsell settings');
    }
  });

  return {
    // Configuration
    config: config || DEFAULT_UPSELL_CONFIG,
    isLoading: isConfigLoading || isProductsLoading,

    // All available warranty products
    allWarrantyProducts,

    // Products configured for auto-select
    estimateProducts,
    invoiceProducts,

    // Update function
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,

    // Helper flags
    isEstimateUpsellEnabled: config?.estimates.enabled ?? true,
    isInvoiceUpsellEnabled: config?.invoices.enabled ?? true,
    shouldAutoSelectForEstimates: config?.estimates.auto_select ?? true,
    shouldAutoSelectForInvoices: config?.invoices.auto_select ?? false,
  };
};
