import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DeclineData {
  id: string;
  type: "estimate" | "invoice";
  number: string;
  client_name: string;
  total: number;
  decline_reason: string | null;
  declined_at: string;
  created_at: string;
}

export interface DeclineReason {
  reason: string;
  count: number;
  percentage: number;
  totalRevenue: number;
}

export interface TrendDataPoint {
  label: string;
  estimates: number;
  invoices: number;
  total: number;
  revenue: number;
}

export interface DeclineAnalyticsSummary {
  totalDeclines: number;
  estimateDeclines: number;
  invoiceDeclines: number;
  estimateDeclineRate: number;
  invoiceDeclineRate: number;
  totalLostRevenue: number;
  averageDeclinedValue: number;
}

export interface AIAnalysis {
  insights: string[];
  recommendations: string[];
  priority: string;
  potentialRecovery: number;
}

export interface DeclineAnalyticsResponse {
  summary: DeclineAnalyticsSummary;
  topReasons: DeclineReason[];
  trendData: TrendDataPoint[];
  recentDeclines: DeclineData[];
  aiAnalysis: AIAnalysis | null;
  timeframe: string;
}

type Timeframe = "7days" | "30days" | "90days" | "1year";

export function useDeclineAnalytics(
  timeframe: Timeframe = "30days",
  includeAiAnalysis: boolean = false
) {
  return useQuery({
    queryKey: ["decline-analytics", timeframe, includeAiAnalysis],
    queryFn: async (): Promise<DeclineAnalyticsResponse> => {
      const { data, error } = await supabase.functions.invoke("get-decline-analytics", {
        body: { timeframe, includeAiAnalysis },
      });

      if (error) {
        console.error("[useDeclineAnalytics] Error:", error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Simplified version for dashboard widget
export function useDeclineQuickStats() {
  return useQuery({
    queryKey: ["decline-quick-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-decline-analytics", {
        body: { timeframe: "30days", includeAiAnalysis: false },
      });

      if (error) {
        console.error("[useDeclineQuickStats] Error:", error);
        throw error;
      }

      return {
        totalDeclines: data.summary.totalDeclines,
        declineRate: Math.round(
          (data.summary.estimateDeclineRate + data.summary.invoiceDeclineRate) / 2
        ),
        topReason: data.topReasons[0]?.reason || "No data",
        lostRevenue: data.summary.totalLostRevenue,
        trend: calculateTrend(data.trendData),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for quick stats
  });
}

function calculateTrend(trendData: TrendDataPoint[]): "up" | "down" | "stable" {
  if (!trendData || trendData.length < 2) return "stable";

  const recentPeriods = trendData.slice(-2);
  const [previous, current] = recentPeriods;

  if (current.total > previous.total * 1.1) return "up";
  if (current.total < previous.total * 0.9) return "down";
  return "stable";
}
