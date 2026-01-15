import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useOrganization } from '@/hooks/use-organization';
import { toast } from 'sonner';
import { useCallback } from 'react';

// Types for upsell configuration

/** Conditional upsell rule based on document amount */
export interface UpsellRule {
  id: string;
  name: string;
  min_amount: number | null;  // null = no minimum
  max_amount: number | null;  // null = no maximum
  products: string[];         // product IDs
  priority: number;           // lower = higher priority
}

export interface UpsellDocumentConfig {
  enabled: boolean;
  auto_select: boolean;
  products: string[];         // default products (fallback)
  rules?: UpsellRule[];       // conditional rules based on amount
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
    products: [],
    rules: []
  },
  invoices: {
    enabled: true,
    auto_select: false,
    products: [],
    rules: []
  }
};

export const useUpsellSettings = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch upsell configuration - prefer organization_id for multi-tenant support
  const { data: config, isLoading: isConfigLoading } = useQuery({
    queryKey: ['upsell-settings', organization?.id || user?.id],
    queryFn: async (): Promise<UpsellConfig> => {
      let query = supabase
        .from('company_settings')
        .select('upsell_config');

      // Use organization_id if available and valid, otherwise fall back to user_id
      const orgId = organization?.id;
      if (orgId && orgId !== '00000000-0000-0000-0000-000000000001') {
        query = query.eq('organization_id', orgId);
      } else if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.maybeSingle();

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
        estimates: {
          ...DEFAULT_UPSELL_CONFIG.estimates,
          ...savedConfig.estimates,
          rules: savedConfig.estimates?.rules || []
        },
        invoices: {
          ...DEFAULT_UPSELL_CONFIG.invoices,
          ...savedConfig.invoices,
          rules: savedConfig.invoices?.rules || []
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch all products available for upsell (any product can be selected)
  // Includes deduplication to handle products loaded from multiple sources
  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['upsell-products', user?.id],
    queryFn: async (): Promise<UpsellProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Deduplicate by name (case-insensitive) - keep first occurrence
      // This handles products that may have been loaded multiple times from different sources
      const seen = new Map<string, UpsellProduct>();
      data.forEach((product) => {
        const normalizedName = product.name.toLowerCase().trim();
        if (!seen.has(normalizedName)) {
          seen.set(normalizedName, product);
        }
      });

      return Array.from(seen.values());
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get products that should be auto-added for estimates (default/fallback)
  // Returns empty array if estimates upsell is disabled
  const estimateProducts = config?.estimates.enabled
    ? allProducts.filter(p => config?.estimates.products.includes(p.id))
    : [];

  // Get products that should be auto-added for invoices (default/fallback)
  // Returns empty array if invoices upsell is disabled
  const invoiceProducts = config?.invoices.enabled
    ? allProducts.filter(p => config?.invoices.products.includes(p.id))
    : [];

  /**
   * Get upsell products based on document amount
   * Evaluates rules in priority order and returns matching products
   * Falls back to default products if no rules match
   * Returns empty array if upsell is disabled for this document type
   */
  const getProductsForAmount = useCallback((
    amount: number,
    type: 'estimates' | 'invoices'
  ): UpsellProduct[] => {
    const docConfig = config?.[type];
    // Return empty if config not found OR upsell is disabled for this document type
    if (!docConfig || !docConfig.enabled) return [];

    const rules = docConfig.rules || [];

    // Sort rules by priority (lower = higher priority)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    // Find first matching rule
    for (const rule of sortedRules) {
      const minOk = rule.min_amount === null || amount >= rule.min_amount;
      const maxOk = rule.max_amount === null || amount <= rule.max_amount;

      if (minOk && maxOk && rule.products.length > 0) {
        return allProducts.filter(p => rule.products.includes(p.id));
      }
    }

    // Fallback to default products
    return allProducts.filter(p => docConfig.products.includes(p.id));
  }, [config, allProducts]);

  /**
   * Get the matching rule for a given amount (for UI display)
   */
  const getMatchingRule = useCallback((
    amount: number,
    type: 'estimates' | 'invoices'
  ): UpsellRule | null => {
    const docConfig = config?.[type];
    if (!docConfig) return null;

    const rules = docConfig.rules || [];
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const minOk = rule.min_amount === null || amount >= rule.min_amount;
      const maxOk = rule.max_amount === null || amount <= rule.max_amount;

      if (minOk && maxOk) {
        return rule;
      }
    }

    return null;
  }, [config]);

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

      // Build upsert data with organization_id if available
      const upsertData: any = {
        user_id: user.id,
        upsell_config: updatedConfig,
        updated_at: new Date().toISOString()
      };

      const orgId = organization?.id;
      if (orgId && orgId !== '00000000-0000-0000-0000-000000000001') {
        upsertData.organization_id = orgId;
      }

      const { error } = await supabase
        .from('company_settings')
        .upsert(upsertData, {
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

    // All available products for upsell selection
    allProducts,
    // Keep alias for backward compatibility
    allWarrantyProducts: allProducts,

    // Default products (fallback when no rules match)
    estimateProducts,
    invoiceProducts,

    // Conditional products based on amount
    getProductsForAmount,
    getMatchingRule,

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
