import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileX,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Brain,
  Sparkles,
  Target,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useDeclineAnalytics } from "@/hooks/useDeclineAnalytics";

export function DeclineInsightsAI() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const { data, isLoading, error, refetch } = useDeclineAnalytics(selectedTimeframe, true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load AI insights</h3>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Decline Analysis
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered insights to improve your conversion rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={(v: any) => setSelectedTimeframe(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : data ? (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <FileX className="h-3.5 w-3.5" />
                  Total Declines
                </div>
                <p className="text-2xl font-bold text-orange-600">{data.summary.totalDeclines}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Lost Revenue
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.totalLostRevenue)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Estimate Rate
                </div>
                <p className="text-2xl font-bold text-blue-600">{data.summary.estimateDeclineRate}%</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Target className="h-3.5 w-3.5" />
                  Recovery Potential
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {data.aiAnalysis ? formatCurrency(data.aiAnalysis.potentialRecovery) : "$0"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Priority Focus Card */}
          {data.aiAnalysis && data.topReasons.length > 0 && (
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/30 dark:to-violet-950/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Priority Focus Area</CardTitle>
                    <CardDescription>AI-identified top issue to address</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="text-lg font-semibold">{data.aiAnalysis.priority}</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      This reason accounts for {data.topReasons[0]?.percentage || 0}% of all declines,
                      representing {formatCurrency(data.topReasons[0]?.totalRevenue || 0)} in lost revenue.
                    </p>
                    <Badge variant="destructive" className="text-sm">
                      {data.topReasons[0]?.count || 0} occurrences
                    </Badge>
                  </div>
                  <div className="flex-1 bg-white/50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-3">
                      Recommended Action
                    </h4>
                    {data.aiAnalysis.recommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {data.aiAnalysis && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Findings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.aiAnalysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-800/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">{index + 1}</span>
                      </div>
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.aiAnalysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Decline Reasons Quick View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Top Decline Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topReasons.slice(0, 5).map((reason, index) => (
                  <div key={reason.reason} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{reason.reason}</span>
                        <Badge variant="outline">{reason.percentage}%</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{reason.count} declines</span>
                        <span>•</span>
                        <span className="text-red-600">{formatCurrency(reason.totalRevenue)} lost</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recovery Opportunity */}
          {data.aiAnalysis && data.aiAnalysis.potentialRecovery > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Potential Revenue Recovery
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        By addressing the top issues, you could recover up to:
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(data.aiAnalysis.potentialRecovery)}
                    </p>
                    <p className="text-xs text-green-600/80">Based on 15% conversion improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Decline Data Yet</h3>
            <p className="text-muted-foreground">
              AI insights will appear once clients start providing feedback on declined estimates and invoices.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
