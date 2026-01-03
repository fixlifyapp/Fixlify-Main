import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Package,
  BarChart3,
  Calendar,
  RefreshCw,
  Sparkles,
  Award,
  Eye
} from "lucide-react";
import { useUpsellAnalytics, type DateRange } from "@/hooks/useUpsellAnalytics";
import { cn } from "@/lib/utils";
import { format, subDays, subMonths } from "date-fns";

const dateRangeOptions = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const UpsellAnalytics = () => {
  const [selectedRange, setSelectedRange] = useState("30d");
  const { useDailyStats, useTopPerformers, useOverallStats, useTechnicianStats } = useUpsellAnalytics();

  // Calculate date range
  const dateRange: DateRange = useMemo(() => {
    const option = dateRangeOptions.find(o => o.value === selectedRange);
    return {
      from: subDays(new Date(), option?.days || 30),
      to: new Date()
    };
  }, [selectedRange]);

  // Fetch data
  const { data: dailyStats, isLoading: isLoadingDaily, refetch: refetchDaily } = useDailyStats(dateRange);
  const { data: topPerformers, isLoading: isLoadingTop, refetch: refetchTop } = useTopPerformers(5, dateRange);
  const { data: overallStats, isLoading: isLoadingOverall, refetch: refetchOverall } = useOverallStats(dateRange);
  const { data: technicianStats, isLoading: isLoadingTech, refetch: refetchTech } = useTechnicianStats(dateRange);

  const isLoading = isLoadingDaily || isLoadingTop || isLoadingOverall || isLoadingTech;

  const handleRefresh = () => {
    refetchDaily();
    refetchTop();
    refetchOverall();
    refetchTech();
  };

  // Calculate trend (compare to previous period)
  const revenueTrend = useMemo(() => {
    if (!dailyStats || dailyStats.length < 14) return null;
    const midpoint = Math.floor(dailyStats.length / 2);
    const recentRevenue = dailyStats.slice(0, midpoint).reduce((s, d) => s + d.totalRevenue, 0);
    const previousRevenue = dailyStats.slice(midpoint).reduce((s, d) => s + d.totalRevenue, 0);
    if (previousRevenue === 0) return null;
    return ((recentRevenue - previousRevenue) / previousRevenue) * 100;
  }, [dailyStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Upsell Analytics
          </h2>
          <p className="text-muted-foreground">
            Track warranty and upsell performance across your team
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Upsell Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-green-800">
                  {isLoadingOverall ? "..." : formatCurrency(overallStats?.totalRevenue || 0)}
                </div>
                {revenueTrend !== null && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm mt-1",
                    revenueTrend >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {revenueTrend >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{formatPercent(Math.abs(revenueTrend))} vs previous</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {isLoadingOverall ? "..." : formatPercent(overallStats?.conversionRate || 0)}
            </div>
            <Progress
              value={overallStats?.conversionRate || 0}
              className="mt-2 h-2 bg-blue-100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats?.totalAccepted || 0} accepted of {overallStats?.totalShown || 0} shown
            </p>
          </CardContent>
        </Card>

        {/* Total Shown */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Upsells Shown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {isLoadingOverall ? "..." : (overallStats?.totalShown || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total warranty offers presented
            </p>
          </CardContent>
        </Card>

        {/* Top Performers Count */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {isLoadingTop ? "..." : (topPerformers?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Warranty products with activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Product Performance
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Product Performance Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Products</CardTitle>
              <CardDescription>
                Warranties ranked by total revenue generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTop ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topPerformers && topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {topPerformers.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white"
                    >
                      {/* Rank Badge */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0 && "bg-amber-100 text-amber-700",
                        index === 1 && "bg-gray-200 text-gray-700",
                        index === 2 && "bg-orange-100 text-orange-700",
                        index > 2 && "bg-gray-100 text-gray-600"
                      )}>
                        {index === 0 && <Award className="h-4 w-4" />}
                        {index > 0 && `#${index + 1}`}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{product.productName}</h4>
                          {product.conversionRate > 50 && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              High Performer
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{product.totalAccepted} sold</span>
                          <span>•</span>
                          <span>{formatPercent(product.conversionRate)} conversion</span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(product.totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No product data available yet</p>
                  <p className="text-sm mt-1">Start offering warranties to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Leaderboard Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Performance</CardTitle>
              <CardDescription>
                Technician upsell performance ranking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTech ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : technicianStats && technicianStats.length > 0 ? (
                <div className="space-y-4">
                  {technicianStats.map((tech, index) => (
                    <div
                      key={tech.technicianId}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white"
                    >
                      {/* Rank Badge */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        index === 0 && "bg-amber-100 text-amber-700",
                        index === 1 && "bg-gray-200 text-gray-700",
                        index === 2 && "bg-orange-100 text-orange-700",
                        index > 2 && "bg-gray-100 text-gray-600"
                      )}>
                        {index === 0 && <Award className="h-4 w-4" />}
                        {index > 0 && `#${index + 1}`}
                      </div>

                      {/* Tech Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{tech.technicianName}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{tech.totalAccepted} upsells</span>
                          <span>•</span>
                          <span>{formatPercent(tech.conversionRate)} conversion</span>
                        </div>
                      </div>

                      {/* Conversion Progress */}
                      <div className="w-24">
                        <Progress
                          value={Math.min(tech.conversionRate, 100)}
                          className="h-2"
                        />
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(tech.totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          generated
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team data available yet</p>
                  <p className="text-sm mt-1">Track upsell activities to see team performance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-purple-800">
            <Sparkles className="h-4 w-4" />
            Insights & Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="font-medium text-purple-700">Boost Conversions</p>
              <p className="text-muted-foreground mt-1">
                Products in the $50-150 range have the highest acceptance rates.
              </p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="font-medium text-purple-700">Timing Matters</p>
              <p className="text-muted-foreground mt-1">
                Present warranties after explaining the job value, not at the end.
              </p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="font-medium text-purple-700">Auto-Add Strategy</p>
              <p className="text-muted-foreground mt-1">
                Enable auto-add for your best-performing warranties on estimates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
