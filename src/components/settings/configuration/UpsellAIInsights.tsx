import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Zap,
  Info,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpsellAnalytics, type DateRange } from "@/hooks/useUpsellAnalytics";
import { cn } from "@/lib/utils";
import { subDays } from "date-fns";

const dateRangeOptions = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
];

// AI confidence factors explanation
const confidenceFactors = [
  {
    name: "Base Score",
    description: "Starting confidence level for all products",
    weight: "50%",
    icon: Target,
    color: "text-gray-600 bg-gray-100"
  },
  {
    name: "Conversion Rate",
    description: "Historical acceptance rate of the product",
    weight: "up to +25%",
    icon: TrendingUp,
    color: "text-green-600 bg-green-100"
  },
  {
    name: "Sales Volume",
    description: "Number of successful sales (reliability factor)",
    weight: "up to +10%",
    icon: BarChart3,
    color: "text-blue-600 bg-blue-100"
  },
  {
    name: "Price Match",
    description: "How well product price fits job value (5-20% ratio)",
    weight: "up to +10%",
    icon: DollarSign,
    color: "text-amber-600 bg-amber-100"
  },
  {
    name: "Featured Status",
    description: "Manually marked as top-performing product",
    weight: "+5%",
    icon: Star,
    color: "text-purple-600 bg-purple-100"
  },
  {
    name: "Client History",
    description: "Repeat customers or previous warranty purchases",
    weight: "up to +10%",
    icon: Users,
    color: "text-indigo-600 bg-indigo-100"
  }
];

// Job type patterns the AI looks for
const jobTypePatterns = [
  { type: "HVAC", keywords: ["hvac", "heating", "cooling", "ac", "furnace"], insight: "2-3 year warranties preferred due to seasonal issues" },
  { type: "Plumbing", keywords: ["plumb", "pipe", "drain", "water"], insight: "Water damage coverage increases uptake by 55%" },
  { type: "Electrical", keywords: ["electric", "wiring", "circuit"], insight: "Safety concerns drive warranty acceptance" },
  { type: "Appliance", keywords: ["appliance", "washer", "dryer"], insight: "Extended coverage popular for expensive repairs" },
];

export const UpsellAIInsights = () => {
  const [selectedRange, setSelectedRange] = useState("30d");
  const { useOverallStats, useTopPerformers } = useUpsellAnalytics();

  const dateRange: DateRange = useMemo(() => {
    const option = dateRangeOptions.find(o => o.value === selectedRange);
    return {
      from: subDays(new Date(), option?.days || 30),
      to: new Date()
    };
  }, [selectedRange]);

  const { data: overallStats, isLoading: isLoadingOverall, refetch: refetchOverall } = useOverallStats(dateRange);
  const { data: topPerformers, isLoading: isLoadingTop, refetch: refetchTop } = useTopPerformers(10, dateRange);

  const isLoading = isLoadingOverall || isLoadingTop;

  const handleRefresh = () => {
    refetchOverall();
    refetchTop();
  };

  // Calculate learned patterns from real data
  const learnedPatterns = useMemo(() => {
    if (!topPerformers || topPerformers.length === 0) return [];

    return topPerformers
      .filter(p => p.conversionRate > 30)
      .map(p => ({
        productName: p.productName,
        pattern: p.conversionRate > 60
          ? `High performer - ${Math.round(p.conversionRate)}% conversion rate`
          : `Moderate performer - ${Math.round(p.conversionRate)}% conversion rate`,
        confidence: p.conversionRate > 60 ? "high" : "medium",
        revenue: p.totalRevenue,
        sales: p.totalAccepted
      }));
  }, [topPerformers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Learning Insights
          </h2>
          <p className="text-muted-foreground">
            Understand how AI makes upsell recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* How AI Works Explanation */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
            <Lightbulb className="h-5 w-5" />
            How AI Recommendations Work
          </CardTitle>
          <CardDescription>
            AI analyzes multiple factors to calculate a confidence score (0-95%) for each product recommendation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Decision Formula</span>
            </div>
            <code className="text-xs bg-purple-100 px-3 py-2 rounded block text-purple-900">
              Confidence = Base(50%) + ConversionRate(≤25%) + Volume(≤10%) + PriceMatch(≤10%) + Featured(5%) + ClientHistory(≤10%)
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {confidenceFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 p-3 rounded-lg border border-purple-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("p-1.5 rounded-full", factor.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-sm">{factor.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {factor.weight}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learned Patterns from Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Patterns Learned from Your Data
          </CardTitle>
          <CardDescription>
            AI has identified these high-performing products based on historical sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : learnedPatterns.length > 0 ? (
            <div className="space-y-3">
              {learnedPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    pattern.confidence === "high" ? "bg-green-100" : "bg-amber-100"
                  )}>
                    <Zap className={cn(
                      "h-5 w-5",
                      pattern.confidence === "high" ? "text-green-600" : "text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{pattern.productName}</h4>
                      <Badge className={cn(
                        "text-xs",
                        pattern.confidence === "high"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {pattern.confidence === "high" ? "High Confidence" : "Growing"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pattern.pattern} • {pattern.sales} sales • ${pattern.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{Math.round(Math.min(pattern.sales * 0.1, 10))}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      confidence boost
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Not enough data to identify patterns yet</p>
              <p className="text-sm mt-1">AI needs more sales data to learn from</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Type Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Job Type Intelligence
          </CardTitle>
          <CardDescription>
            AI adjusts recommendations based on job type keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobTypePatterns.map((pattern, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-white">
                    {pattern.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Detected keywords:</span>{" "}
                  {pattern.keywords.join(", ")}
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{pattern.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Decision Summary */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
            <BarChart3 className="h-5 w-5" />
            AI Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Recommendations</div>
              <div className="text-2xl font-bold text-emerald-700">
                {isLoading ? "..." : (overallStats?.totalShown || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Warranty offers shown to technicians
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
              <div className="text-2xl font-bold text-emerald-700">
                {isLoading ? "..." : `${(overallStats?.conversionRate || 0).toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommendations accepted by customers
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
              <div className="text-2xl font-bold text-emerald-700">
                {isLoading ? "..." : `$${(overallStats?.totalRevenue || 0).toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From AI-recommended upsells
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Improve AI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Improve AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">✅ Do This</h4>
              <ul className="text-sm space-y-2 text-blue-700">
                <li>• Mark best products as "Featured" in Products settings</li>
                <li>• Add cost prices for accurate profit margin display</li>
                <li>• Use descriptive job types (e.g., "HVAC Repair" not "Service")</li>
                <li>• Track warranty sales consistently</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-amber-50">
              <h4 className="font-medium text-amber-800 mb-2">📈 More Data = Better AI</h4>
              <ul className="text-sm space-y-2 text-amber-700">
                <li>• AI learns from every accepted/rejected offer</li>
                <li>• Conversion patterns improve over time</li>
                <li>• Job type matching becomes more accurate</li>
                <li>• Client history builds recommendation context</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
