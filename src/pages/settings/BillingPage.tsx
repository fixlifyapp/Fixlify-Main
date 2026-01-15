import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCredits } from "@/hooks/useCredits";
import { TopUpModal } from "@/components/credits/TopUpModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const BillingPage = () => {
  const [showTopUp, setShowTopUp] = useState(false);
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

  const loyaltyBonus = getLoyaltyBonus();

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
      <Tabs defaultValue="transactions" className="space-y-4">
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
