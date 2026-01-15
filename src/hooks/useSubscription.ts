import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/use-organization";
import { toast } from "sonner";

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  max_users: number;
  max_jobs_per_month: number | null;
  max_clients: number | null;
  included_phone_numbers: number;
  included_credits_monthly: number;
  extra_user_price_cents: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  current_period_start: string;
  current_period_end: string;
  extra_users: number;
  jobs_used_this_period: number;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
}

export interface PlanDetails {
  plan_name: string;
  plan_display_name: string;
  price_cents: number;
  max_users: number;
  current_users: number;
  extra_users: number;
  max_jobs: number | null;
  jobs_used: number;
  included_credits: number;
  included_phone_numbers: number;
  status: string;
  period_end: string;
}

// Hook
export function useSubscription() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  // Fetch all available plans
  const {
    data: plans,
    isLoading: isLoadingPlans,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch current organization's subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["organization-subscription", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from("organization_subscriptions")
        .select("*")
        .eq("organization_id", organizationId)
        .single();

      if (error) {
        // If no subscription exists, return null (will be created on first use)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as OrganizationSubscription;
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
  });

  // Fetch plan details (combines plan + usage info)
  const {
    data: planDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["plan-details", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase.rpc("get_org_plan_details", {
        p_organization_id: organizationId,
      });

      if (error) throw error;

      // RPC returns array, get first item
      const result = Array.isArray(data) ? data[0] : data;
      return result as PlanDetails;
    },
    enabled: !!organizationId,
    staleTime: 30000,
  });

  // Get current plan object
  const currentPlan = plans?.find(
    (p) => p.name === planDetails?.plan_name
  );

  // Check if can create job
  const canCreateJob = async (): Promise<{
    allowed: boolean;
    jobsUsed: number;
    jobsLimit: number | null;
    isUnlimited: boolean;
  }> => {
    if (!organizationId) {
      return { allowed: false, jobsUsed: 0, jobsLimit: 0, isUnlimited: false };
    }

    const { data, error } = await supabase.rpc("can_create_job", {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error("Error checking job limit:", error);
      return { allowed: false, jobsUsed: 0, jobsLimit: 0, isUnlimited: false };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return {
      allowed: result?.allowed ?? false,
      jobsUsed: result?.jobs_used ?? 0,
      jobsLimit: result?.jobs_limit ?? null,
      isUnlimited: result?.is_unlimited ?? false,
    };
  };

  // Check if can add user
  const canAddUser = async (): Promise<{
    allowed: boolean;
    currentUsers: number;
    maxUsers: number;
    canAddExtra: boolean;
  }> => {
    if (!organizationId) {
      return { allowed: false, currentUsers: 0, maxUsers: 0, canAddExtra: false };
    }

    const { data, error } = await supabase.rpc("can_add_user", {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error("Error checking user limit:", error);
      return { allowed: false, currentUsers: 0, maxUsers: 0, canAddExtra: false };
    }

    const result = Array.isArray(data) ? data[0] : data;
    return {
      allowed: result?.allowed ?? false,
      currentUsers: result?.current_users ?? 0,
      maxUsers: result?.max_users ?? 0,
      canAddExtra: result?.can_add_extra ?? false,
    };
  };

  // Format price
  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  // Get days remaining in period
  const getDaysRemaining = (): number => {
    if (!planDetails?.period_end) return 0;
    const end = new Date(planDetails.period_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Check if on free plan
  const isFreePlan = planDetails?.plan_name === "free";

  // Check if feature is available
  const hasFeature = (featureKey: string): boolean => {
    if (!currentPlan?.features) return false;
    return currentPlan.features.includes(featureKey);
  };

  // Get usage percentage for jobs
  const getJobsUsagePercent = (): number => {
    if (!planDetails?.max_jobs) return 0; // Unlimited
    if (planDetails.max_jobs === 0) return 100;
    return Math.min(100, (planDetails.jobs_used / planDetails.max_jobs) * 100);
  };

  // Get users usage percentage
  const getUsersUsagePercent = (): number => {
    if (!planDetails) return 0;
    const totalAllowed = planDetails.max_users + planDetails.extra_users;
    if (totalAllowed === 0) return 100;
    return Math.min(100, (planDetails.current_users / totalAllowed) * 100);
  };

  return {
    // Plans
    plans: plans ?? [],
    isLoadingPlans,

    // Current subscription
    subscription,
    isLoadingSubscription,
    refetchSubscription,

    // Plan details
    planDetails,
    currentPlan,
    isLoadingDetails,
    refetchDetails,

    // Helpers
    canCreateJob,
    canAddUser,
    formatPrice,
    getDaysRemaining,
    isFreePlan,
    hasFeature,
    getJobsUsagePercent,
    getUsersUsagePercent,

    // Computed
    isLoading: isLoadingPlans || isLoadingSubscription || isLoadingDetails,
  };
}

// Utility hook for checking plan limits before action
export function useRequirePlan(requiredFeature?: string) {
  const { planDetails, currentPlan, hasFeature, isFreePlan } = useSubscription();

  const canAccess = !requiredFeature || hasFeature(requiredFeature);

  return {
    canAccess,
    isFreePlan,
    currentPlanName: planDetails?.plan_display_name ?? "Free",
    upgradeRequired: !canAccess,
  };
}
