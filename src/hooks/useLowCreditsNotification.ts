import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCredits } from "./useCredits";
import { usePermissions } from "./usePermissions";

const LOW_CREDITS_THRESHOLD = 50;
const CRITICAL_CREDITS_THRESHOLD = 10;

/**
 * Hook that shows notification when credits are running low.
 * Only shows once per session to avoid spam.
 * Only admins/managers see these notifications.
 */
export function useLowCreditsNotification() {
  const { balance, balanceData, isLoadingBalance } = useCredits();
  const { isAdminOrManager } = usePermissions();
  const navigate = useNavigate();
  const hasShownLowNotification = useRef(false);
  const hasShownCriticalNotification = useRef(false);

  const canViewCredits = isAdminOrManager();

  useEffect(() => {
    // Only show for admins/managers
    // IMPORTANT: Check balanceData exists to avoid showing 0 during loading
    if (!canViewCredits || isLoadingBalance || !balanceData) return;

    // Critical balance notification (<=10 credits)
    if (balance <= CRITICAL_CREDITS_THRESHOLD && !hasShownCriticalNotification.current) {
      hasShownCriticalNotification.current = true;
      toast.error("Credits Almost Depleted!", {
        description: `Only ${balance} credits remaining. Top up now to avoid service interruption.`,
        duration: 10000,
        action: {
          label: "Top Up",
          onClick: () => navigate("/settings/billing?tab=credits"),
        },
      });
      return;
    }

    // Low balance notification (<=50 credits)
    if (balance <= LOW_CREDITS_THRESHOLD && balance > CRITICAL_CREDITS_THRESHOLD && !hasShownLowNotification.current) {
      hasShownLowNotification.current = true;
      toast.warning("Credits Running Low", {
        description: `You have ${balance} credits remaining. Consider topping up soon.`,
        duration: 8000,
        action: {
          label: "Top Up",
          onClick: () => navigate("/settings/billing?tab=credits"),
        },
      });
    }
  }, [balance, balanceData, isLoadingBalance, canViewCredits, navigate]);

  return {
    isLowBalance: balance <= LOW_CREDITS_THRESHOLD,
    isCriticalBalance: balance <= CRITICAL_CREDITS_THRESHOLD,
    balance,
  };
}

/**
 * Hook to check credits before performing an action.
 * Returns a function that checks credits and shows modal if insufficient.
 */
export function useCheckCredits() {
  const { balance, getCreditRate, hasEnoughCredits } = useCredits();

  const checkCredits = (
    featureKey: string,
    onInsufficientCredits: (required: number, current: number) => void
  ): boolean => {
    const requiredCredits = getCreditRate(featureKey);

    if (!hasEnoughCredits(requiredCredits)) {
      onInsufficientCredits(requiredCredits, balance);
      return false;
    }

    return true;
  };

  return {
    checkCredits,
    balance,
    hasEnoughCredits,
    getCreditRate,
  };
}
