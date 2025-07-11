
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar
} from "lucide-react";

interface FinancialDashboardProps {
  totalRevenue: number;
  totalPaid: number;
  pendingPayments: number;
  overdueAmount: number;
  monthlyGoal: number;
  averageJobValue: number;
  paymentTrends: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export const FinancialDashboard = ({
  totalRevenue,
  totalPaid,
  pendingPayments,
  overdueAmount,
  monthlyGoal,
  averageJobValue,
  paymentTrends
}: FinancialDashboardProps) => {
  const goalProgress = (totalPaid / monthlyGoal) * 100;
  const isGrowthPositive = paymentTrends.growth >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPaid)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isGrowthPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={isGrowthPositive ? "text-green-600" : "text-red-600"}>
                {Math.abs(paymentTrends.growth)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {formatCurrency(totalPaid)} of {formatCurrency(monthlyGoal)}
            </span>
            <Badge variant={goalProgress >= 100 ? "default" : goalProgress >= 75 ? "secondary" : "outline"}>
              {Math.round(goalProgress)}%
            </Badge>
          </div>
          <Progress value={Math.min(goalProgress, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Goal Achievement</span>
            <span>
              {goalProgress >= 100 
                ? "🎉 Goal exceeded!" 
                : `${formatCurrency(monthlyGoal - totalPaid)} remaining`
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Job Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(averageJobValue)}
            </div>
            <p className="text-sm text-muted-foreground">
              Per completed job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">{formatCurrency(paymentTrends.thisMonth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Month</span>
                <span className="font-medium">{formatCurrency(paymentTrends.lastMonth)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium">Growth</span>
                <Badge variant={isGrowthPositive ? "default" : "destructive"}>
                  {isGrowthPositive ? "+" : ""}{paymentTrends.growth}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
