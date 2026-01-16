import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  FileX
} from "lucide-react";
import { useDeclineQuickStats } from "@/hooks/useDeclineAnalytics";
import { useNavigate } from "react-router-dom";

export function DeclineInsightsWidget() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDeclineQuickStats();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Failed to load decline stats</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileX className="h-5 w-5 text-orange-500" />
            Client Declines
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Last 30 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Declines</span>
                  {data.trend && (
                    <div className={`flex items-center gap-0.5 ${getTrendColor(data.trend)}`}>
                      {getTrendIcon(data.trend)}
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data.totalDeclines}
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 p-3">
                <span className="text-xs text-muted-foreground block mb-1">Lost Revenue</span>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data.lostRevenue)}
                </p>
              </div>
            </div>

            {/* Top Reason */}
            {data.topReason && data.topReason !== "No data" && (
              <div className="rounded-lg border border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                      Top Decline Reason
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-300 truncate">
                      {data.topReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Decline Rate */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Decline Rate</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={data.declineRate > 25 ? "destructive" : data.declineRate > 15 ? "warning" : "secondary"}
                  className="font-mono"
                >
                  {data.declineRate}%
                </Badge>
              </div>
            </div>

            {/* View Details Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/analytics?tab=insights")}
            >
              View detailed insights
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FileX className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No decline data yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
