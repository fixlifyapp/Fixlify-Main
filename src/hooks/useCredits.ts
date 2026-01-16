import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/use-organization";
import { toast } from "sonner";

// Types
export interface CreditBalance {
  id: string;
  organization_id: string;
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
  lifetime_bonus: number;
  loyalty_tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  updated_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  bonus_credits: number;
  price_cents: number;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CreditUsageRate {
  id: string;
  feature_key: string;
  feature_name: string;
  credits_per_unit: number;
  unit_type: 'each' | 'minute' | 'month';
  category: string;
  description: string | null;
}

export interface CreditTransaction {
  id: string;
  organization_id: string;
  user_id: string | null;
  type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'plan_included' | 'referral' | 'adjustment';
  amount: number;
  balance_after: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UseCreditsResult {
  success: boolean;
  transaction_id: string | null;
  new_balance: number;
  error_message: string | null;
}

// Hook
export function useCredits() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  // Fetch credit balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["credit-balance", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("organization_id", organizationId)
        .single();

      if (error) {
        // If no balance exists, it will be created on first use
        if (error.code === "PGRST116") {
          return {
            balance: 0,
            lifetime_purchased: 0,
            lifetime_used: 0,
            lifetime_bonus: 0,
            loyalty_tier: "none" as const,
          } as CreditBalance;
        }
        throw error;
      }

      return data as CreditBalance;
    },
    enabled: !!organizationId,
    staleTime: 10000, // 10 seconds
  });

  // Fetch credit packages
  const {
    data: packages,
    isLoading: isLoadingPackages,
  } = useQuery({
    queryKey: ["credit-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as CreditPackage[];
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch usage rates
  const {
    data: usageRates,
    isLoading: isLoadingRates,
  } = useQuery({
    queryKey: ["credit-usage-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_usage_rates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data as CreditUsageRate[];
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch recent transactions
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["credit-transactions", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
  });

  // Use credits mutation
  const useCredits = useMutation({
    mutationFn: async ({
      amount,
      referenceType,
      referenceId,
      description,
    }: {
      amount: number;
      referenceType: string;
      referenceId?: string;
      description?: string;
    }): Promise<UseCreditsResult> => {
      if (!organizationId) {
        return {
          success: false,
          transaction_id: null,
          new_balance: 0,
          error_message: "No organization selected",
        };
      }

      const { data, error } = await supabase.rpc("use_credits", {
        p_organization_id: organizationId,
        p_amount: amount,
        p_reference_type: referenceType,
        p_reference_id: referenceId || null,
        p_description: description || null,
        p_user_id: null,
        p_metadata: {},
      });

      if (error) throw error;

      // The RPC returns a table, get first row
      const result = data?.[0] || data;
      return {
        success: result?.success ?? false,
        transaction_id: result?.transaction_id ?? null,
        new_balance: result?.new_balance ?? 0,
        error_message: result?.error_message ?? null,
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["credit-balance", organizationId] });
        queryClient.invalidateQueries({ queryKey: ["credit-transactions", organizationId] });
      }
    },
    onError: (error) => {
      console.error("Error using credits:", error);
      toast.error("Failed to use credits");
    },
  });

  // Check if has enough credits
  const hasEnoughCredits = (requiredCredits: number): boolean => {
    return (balance?.balance ?? 0) >= requiredCredits;
  };

  // Get credit rate for a feature
  const getCreditRate = (featureKey: string): number => {
    const rate = usageRates?.find((r) => r.feature_key === featureKey);
    return rate?.credits_per_unit ?? 0;
  };

  // Get feature info
  const getFeatureInfo = (featureKey: string): CreditUsageRate | undefined => {
    return usageRates?.find((r) => r.feature_key === featureKey);
  };

  // Format credits as currency
  const formatCreditsAsCurrency = (credits: number): string => {
    const dollars = credits * 0.1;
    return `$${dollars.toFixed(2)}`;
  };

  // Get loyalty bonus percentage
  const getLoyaltyBonus = (): number => {
    switch (balance?.loyalty_tier) {
      case "platinum":
        return 20;
      case "gold":
        return 15;
      case "silver":
        return 10;
      case "bronze":
        return 5;
      default:
        return 0;
    }
  };

  return {
    // Balance
    balance: balance?.balance ?? 0,
    balanceData: balance,
    isLoadingBalance,
    balanceError,
    refetchBalance,

    // Packages
    packages: packages ?? [],
    isLoadingPackages,

    // Usage rates
    usageRates: usageRates ?? [],
    isLoadingRates,

    // Transactions
    transactions: transactions ?? [],
    isLoadingTransactions,
    refetchTransactions,

    // Actions
    useCredits: useCredits.mutateAsync,
    isUsingCredits: useCredits.isPending,

    // Helpers
    hasEnoughCredits,
    getCreditRate,
    getFeatureInfo,
    formatCreditsAsCurrency,
    getLoyaltyBonus,
    loyaltyTier: balance?.loyalty_tier ?? "none",
  };
}

// Utility hook for checking credits before action
export function useRequireCredits(featureKey: string) {
  const { balance, getCreditRate, hasEnoughCredits, useCredits: deductCredits } = useCredits();

  const requiredCredits = getCreditRate(featureKey);
  const canUse = hasEnoughCredits(requiredCredits);

  const consumeCredits = async (
    referenceId?: string,
    description?: string
  ): Promise<UseCreditsResult> => {
    if (!canUse) {
      return {
        success: false,
        transaction_id: null,
        new_balance: balance,
        error_message: "Insufficient credits",
      };
    }

    return deductCredits({
      amount: requiredCredits,
      referenceType: featureKey,
      referenceId,
      description,
    });
  };

  return {
    requiredCredits,
    canUse,
    currentBalance: balance,
    consumeCredits,
  };
}
