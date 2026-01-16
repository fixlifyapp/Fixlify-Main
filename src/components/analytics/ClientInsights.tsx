import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  FileX,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  PieChart,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useDeclineAnalytics, DeclineData, DeclineReason } from "@/hooks/useDeclineAnalytics";

interface ClientInsightsProps {
  timeframe?: string;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];

export function ClientInsights({ timeframe: propTimeframe }: ClientInsightsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const [showAllReasons, setShowAllReasons] = useState(false);
  const [showAllDeclines, setShowAllDeclines] = useState(false);

  const { data, isLoading, error, refetch } = useDeclineAnalytics(selectedTimeframe, true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load insights</h3>
          <p className="text-red-600 mb-4">There was an error fetching decline analytics.</p>
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
      {/* Header with Timeframe Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileX className="h-6 w-6 text-orange-500" />
            Client Decline Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Understand why clients decline estimates and invoices
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : data ? (
          <>
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileX className="h-4 w-4" />
                  <span className="text-sm">Total Declines</span>
                </div>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {data.summary.totalDeclines}
                </p>
                <div className="flex gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="border-blue-300">
                    <FileText className="h-3 w-3 mr-1" />
                    {data.summary.estimateDeclines} Est
                  </Badge>
                  <Badge variant="outline" className="border-green-300">
                    <Receipt className="h-3 w-3 mr-1" />
                    {data.summary.invoiceDeclines} Inv
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Lost Revenue</span>
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data.summary.totalLostRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Avg: {formatCurrency(data.summary.averageDeclinedValue)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Estimate Rate</span>
                </div>
                <p className="text-3xl font-bold">
                  {data.summary.estimateDeclineRate}%
                </p>
                <Progress
                  value={data.summary.estimateDeclineRate}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Invoice Rate</span>
                </div>
                <p className="text-3xl font-bold">
                  {data.summary.invoiceDeclineRate}%
                </p>
                <Progress
                  value={data.summary.invoiceDeclineRate}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* AI Insights Section */}
      {data?.aiAnalysis && (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Analysis and recommendations to improve your conversion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Insights */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Key Findings
                </h4>
                <ul className="space-y-2">
                  {data.aiAnalysis.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg"
                    >
                      <span className="text-purple-500 mt-0.5">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {data.aiAnalysis.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200/50 dark:border-green-800/50"
                    >
                      <span className="text-green-500 font-bold">{index + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
                {data.aiAnalysis.potentialRecovery > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Potential Recovery:{" "}
                      <span className="text-lg font-bold">
                        {formatCurrency(data.aiAnalysis.potentialRecovery)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Decline Reasons Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-500" />
              Decline Reasons Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : data?.topReasons.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={data.topReasons.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="reason"
                    label={({ reason, percentage }) =>
                      percentage > 5 ? `${percentage}%` : ""
                    }
                  >
                    {data.topReasons.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} (${props.payload.percentage}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) =>
                      value.length > 15 ? value.substring(0, 15) + "..." : value
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No decline data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Decline Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : data?.trendData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name === "estimates" ? "Estimates" : "Invoices",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="estimates" name="Estimates" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="invoices" name="Invoices" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lost Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-500" />
            Lost Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : data?.trendData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Lost Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Reasons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Top Decline Reasons
          </CardTitle>
          <CardDescription>
            Understanding why clients decline helps improve conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.topReasons.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Reason</TableHead>
                    <TableHead className="text-center">Count</TableHead>
                    <TableHead className="text-center">Percentage</TableHead>
                    <TableHead className="text-right">Revenue Lost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAllReasons ? data.topReasons : data.topReasons.slice(0, 5)).map(
                    (reason, index) => (
                      <TableRow key={reason.reason}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            {reason.reason}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{reason.count}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{reason.percentage}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(reason.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              {data.topReasons.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowAllReasons(!showAllReasons)}
                >
                  {showAllReasons ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> Show All ({data.topReasons.length})
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No decline reasons recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Declines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-red-500" />
            Recent Declines
          </CardTitle>
          <CardDescription>Latest documents declined by clients</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data?.recentDeclines.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAllDeclines ? data.recentDeclines : data.recentDeclines.slice(0, 10)).map(
                    (decline) => (
                      <TableRow key={decline.id}>
                        <TableCell>
                          <Badge variant={decline.type === "estimate" ? "default" : "secondary"}>
                            {decline.type === "estimate" ? (
                              <FileText className="h-3 w-3 mr-1" />
                            ) : (
                              <Receipt className="h-3 w-3 mr-1" />
                            )}
                            {decline.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">#{decline.number}</TableCell>
                        <TableCell>{decline.client_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {decline.decline_reason || (
                            <span className="text-muted-foreground italic">No reason</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(decline.total)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatDate(decline.declined_at)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              {data.recentDeclines.length > 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowAllDeclines(!showAllDeclines)}
                >
                  {showAllDeclines ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> Show All ({data.recentDeclines.length})
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recent declines</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
