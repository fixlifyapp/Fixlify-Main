import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import {
  CreditCard,
  Coins,
  History,
  TrendingUp,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Phone,
  MessageSquare,
  Brain,
  FileText,
  RefreshCw,
  Crown,
  Users,
  Briefcase,
  Check,
  Info,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { TopUpModal } from "@/components/credits/TopUpModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const BillingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTopUp, setShowTopUp] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["transactions", "usage", "rates", "plans", "settings", "credits"].includes(tabParam)) {
      // "credits" is an alias for "transactions" (for deep linking from notifications)
      setActiveTab(tabParam === "credits" ? "transactions" : tabParam);
      // Open top-up modal if coming from insufficient credits flow
      if (tabParam === "credits") {
        setShowTopUp(true);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const {
    balance,
    balanceData,
    isLoadingBalance,
    packages,
    usageRates,
    transactions,
    isLoadingTransactions,
    formatCreditsAsCurrency,
    loyaltyTier,
    getLoyaltyBonus,
  } = useCredits();

  const {
    planDetails,
    currentPlan,
    plans,
    isLoading: isLoadingPlan,
    isFreePlan,
    formatPrice,
    getDaysRemaining,
    getJobsUsagePercent,
    getUsersUsagePercent,
  } = useSubscription();

  const loyaltyBonus = getLoyaltyBonus();
  const daysRemaining = getDaysRemaining();

  // Calculate usage by category
  const usageByCategory = transactions
    .filter((t) => t.type === "usage")
    .reduce((acc, t) => {
      const category = t.reference_type || "other";
      if (!acc[category]) {
        acc[category] = { count: 0, credits: 0 };
      }
      acc[category].count++;
      acc[category].credits += Math.abs(t.amount);
      return acc;
    }, {} as Record<string, { count: number; credits: number }>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sms_outbound":
      case "sms_inbound":
        return <MessageSquare className="h-4 w-4" />;
      case "voice_call":
      case "ai_dispatcher":
        return <Phone className="h-4 w-4" />;
      case "ai_text_generation":
      case "ai_job_summary":
      case "ai_chat_response":
        return <Brain className="h-4 w-4" />;
      case "branded_pdf":
      case "ai_contract":
        return <FileText className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "usage":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "bonus":
      case "referral":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getLoyaltyColor = () => {
    switch (loyaltyTier) {
      case "platinum":
        return "text-purple-500 bg-purple-100";
      case "gold":
        return "text-yellow-600 bg-yellow-100";
      case "silver":
        return "text-gray-500 bg-gray-100";
      case "bronze":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Billing & Credits"
        subtitle="Manage your credit balance, view usage history, and configure payment settings"
        icon={CreditCard}
        badges={[
          { text: `${balance.toLocaleString()} credits`, icon: Coins, variant: "fixlyfy" },
          loyaltyTier !== "none" && { text: `${loyaltyTier} tier`, icon: Sparkles, variant: "success" },
        ].filter(Boolean)}
      />

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Current Plan Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base sm:text-lg">Current Plan</CardTitle>
              </div>
              {!isFreePlan && (
                <Badge variant="outline" className="text-xs">
                  {daysRemaining} days left
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {isLoadingPlan ? (
              <div className="text-center py-4 text-muted-foreground">Loading plan info...</div>
            ) : (
              <div className="space-y-4">
                {/* Plan Name & Price */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {planDetails?.plan_display_name || "Free"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isFreePlan ? "Get started with basic features" : `${formatPrice(planDetails?.price_cents || 0)}/month`}
                    </p>
                  </div>
                  {isFreePlan ? (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Zap className="h-4 w-4 mr-1" />
                      Upgrade
                    </Button>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>

                {/* Usage Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jobs Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Jobs this month</span>
                      </div>
                      <span className="font-medium">
                        {planDetails?.jobs_used ?? 0} / {planDetails?.max_jobs == null ? "∞" : planDetails.max_jobs}
                      </span>
                    </div>
                    <Progress
                      value={getJobsUsagePercent()}
                      className="h-2"
                    />
                  </div>

                  {/* Users */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Team members</span>
                      </div>
                      <span className="font-medium">
                        {planDetails?.current_users || 0} / {(planDetails?.max_users || 0) + (planDetails?.extra_users || 0)}
                      </span>
                    </div>
                    <Progress
                      value={getUsersUsagePercent()}
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Included Credits Info */}
                {(planDetails?.included_credits || 0) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
                    <Coins className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700">
                      {planDetails?.included_credits} credits included monthly
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works Card */}
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base sm:text-lg">How It Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Plans</span> set your base limits: team size, monthly jobs, and included credits
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Credits</span> are used for premium features: SMS, calls, AI, and branded PDFs
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Top up</span> credits anytime without changing your plan
                </p>
              </div>
            </div>
            <div className="mt-4 p-2 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Pro tip:</span> Need more SMS but happy with your team size? Just buy more credits!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Current Balance */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-2xl sm:text-3xl font-bold">{balance.toLocaleString()}</span>
                <span className="text-xs sm:text-sm text-muted-foreground ml-1">credits</span>
              </div>
              <Button size="sm" onClick={() => setShowTopUp(true)} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden xs:inline">Top Up</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ≈ {formatCreditsAsCurrency(balance)}
            </p>
          </CardContent>
        </Card>

        {/* Lifetime Stats */}
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Usage</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Purchased:</span>
                <span className="font-medium">{(balanceData?.lifetime_purchased || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Used:</span>
                <span className="font-medium">{(balanceData?.lifetime_used || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Bonus received:</span>
                <span className="font-medium text-green-600">+{(balanceData?.lifetime_bonus || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Tier */}
        <Card>
          <CardHeader className="pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn("p-2 sm:p-3 rounded-full shrink-0", getLoyaltyColor())}>
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold capitalize text-sm sm:text-base">{loyaltyTier === "none" ? "Standard" : loyaltyTier}</p>
                {loyaltyBonus > 0 ? (
                  <p className="text-xs sm:text-sm text-green-600 truncate">+{loyaltyBonus}% bonus on purchases</p>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Purchase more to unlock bonuses</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="transactions" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Transactions</span>
              <span className="xs:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="rates" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Auto Top-Up</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
              <CardDescription className="text-xs sm:text-sm">All credit transactions for your organization</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {isLoadingTransactions ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                  No transactions yet. Purchase credits to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-full bg-muted shrink-0">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), "MMM d, yyyy")}
                            <span className="hidden sm:inline"> at {format(new Date(tx.created_at), "h:mm a")}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "font-semibold text-sm sm:text-base",
                            tx.amount > 0 ? "text-green-600" : "text-red-500"
                          )}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          <span className="hidden sm:inline">Balance: </span>{tx.balance_after.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Usage Breakdown</CardTitle>
              <CardDescription className="text-xs sm:text-sm">See how your credits are being used</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {Object.keys(usageByCategory).length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                  No usage data yet. Start using features to see your breakdown!
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(usageByCategory)
                    .sort((a, b) => b[1].credits - a[1].credits)
                    .map(([category, data]) => {
                      const rate = usageRates.find((r) => r.feature_key === category);
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border gap-2"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="p-1.5 sm:p-2 rounded-full bg-muted shrink-0">
                              {getCategoryIcon(category)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                {rate?.feature_name || category.replace(/_/g, " ")}
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {data.count} {data.count === 1 ? "use" : "uses"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-red-500 text-sm sm:text-base">
                              -{data.credits.toLocaleString()}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {formatCreditsAsCurrency(data.credits)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Credit Pricing</CardTitle>
              <CardDescription className="text-xs sm:text-sm">How many credits each feature costs</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {["messaging", "voice", "ai", "documents", "phone_numbers"].map((category) => {
                  const categoryRates = usageRates.filter((r) => r.category === category);
                  if (categoryRates.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize text-xs sm:text-sm text-muted-foreground">
                        {category.replace("_", " ")}
                      </h4>
                      <div className="space-y-1">
                        {categoryRates.map((rate) => (
                          <div
                            key={rate.id}
                            className="flex items-center justify-between p-2 rounded bg-muted/50 gap-2"
                          >
                            <span className="text-xs sm:text-sm truncate">{rate.feature_name}</span>
                            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                              {rate.credits_per_unit} / {rate.unit_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <div className="space-y-4">
            {/* Plan Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan = planDetails?.plan_name === plan.name;
                const isUpgrade = (plan.price_cents || 0) > (planDetails?.price_cents || 0);

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative",
                      plan.is_featured && "border-purple-500 border-2",
                      isCurrentPlan && "bg-purple-50/50"
                    )}
                  >
                    {plan.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="pt-6 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg sm:text-xl">{plan.display_name}</CardTitle>
                        {isCurrentPlan && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <div className="mb-4">
                        <span className="text-2xl sm:text-3xl font-bold">
                          {plan.price_cents === 0 ? "Free" : `$${(plan.price_cents / 100).toFixed(0)}`}
                        </span>
                        {plan.price_cents > 0 && (
                          <span className="text-muted-foreground text-sm">/month</span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.max_users} {plan.max_users === 1 ? "user" : "users"} included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.max_jobs_per_month === null ? "Unlimited" : plan.max_jobs_per_month} jobs/month</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.included_credits_monthly} credits/month</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.included_phone_numbers} phone {plan.included_phone_numbers === 1 ? "number" : "numbers"}</span>
                        </div>
                      </div>

                      {/* Key Features */}
                      <div className="border-t pt-3 space-y-1.5">
                        {(plan.features as string[] || []).slice(0, 5).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                            <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="capitalize">{feature.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                        {(plan.features as string[] || []).length > 5 && (
                          <p className="text-xs text-muted-foreground pl-5">
                            +{(plan.features as string[] || []).length - 5} more features
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        {isCurrentPlan ? (
                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : isUpgrade ? (
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            <Zap className="h-4 w-4 mr-1" />
                            Upgrade
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            Contact Support
                          </Button>
                        )}
                      </div>

                      {plan.extra_user_price_cents > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          +${(plan.extra_user_price_cents / 100).toFixed(0)}/user for extra seats
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Credits Explanation */}
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base sm:text-lg">About Credits</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">What are credits?</h4>
                    <p className="text-sm text-muted-foreground">
                      Credits are our universal currency for premium features like SMS messaging,
                      voice calls, AI assistance, and branded documents. 1 credit = $0.10.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Why use credits?</h4>
                    <p className="text-sm text-muted-foreground">
                      Credits give you flexibility. Need more SMS but don't need more team members?
                      Just buy credits without upgrading your plan. Pay only for what you actually use.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auto Top-Up Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Auto Top-Up Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Automatically add credits when your balance runs low
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm">Enable Auto Top-Up</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Automatically purchase credits when balance is low
                  </p>
                </div>
                <Switch disabled className="shrink-0" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Trigger when balance falls below</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="20"
                    className="w-24 sm:w-32"
                    disabled
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">credits</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Top-up package</Label>
                <Select disabled>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${(pkg.price_cents / 100).toFixed(0)} ({pkg.credits} credits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Monthly spending limit</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    placeholder="200"
                    className="w-24 sm:w-32"
                    disabled
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Auto top-up requires a saved payment method. Configure your payment method to enable this feature.
                </p>
                <Button className="mt-3 w-full sm:w-auto" disabled>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
    </PageLayout>
  );
};

export default BillingPage;
