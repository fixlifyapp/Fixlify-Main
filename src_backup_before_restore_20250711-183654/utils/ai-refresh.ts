
import { supabase } from "@/integrations/supabase/client";

const AI_REFRESH_KEY = "ai_insights_last_refresh";

export const shouldRefreshAIInsights = async (): Promise<boolean> => {
  try {
    // Get the last refresh timestamp from localStorage
    const lastRefreshStr = localStorage.getItem(AI_REFRESH_KEY);
    
    if (!lastRefreshStr) {
      // If no refresh has been recorded, we should refresh
      return true;
    }
    
    const lastRefresh = new Date(lastRefreshStr);
    const now = new Date();
    
    // Calculate days difference
    const diffTime = Math.abs(now.getTime() - lastRefresh.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return true if more than 7 days have passed
    return diffDays >= 7;
  } catch (error) {
    console.error("Error checking AI refresh status:", error);
    // If there's an error, we should refresh to be safe
    return true;
  }
};

export const updateLastRefreshTimestamp = (): void => {
  try {
    localStorage.setItem(AI_REFRESH_KEY, new Date().toISOString());
  } catch (error) {
    console.error("Error updating AI refresh timestamp:", error);
  }
};

export const forceRefreshAIInsights = (): void => {
  localStorage.removeItem(AI_REFRESH_KEY);
};
