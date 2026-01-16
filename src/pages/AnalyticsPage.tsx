
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Target, FileX } from "lucide-react";
import { BusinessDashboard } from "@/components/analytics/BusinessDashboard";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { RevenueAnalytics } from "@/components/analytics/RevenueAnalytics";
import { TeamPerformance } from "@/components/analytics/TeamPerformance";
import { PredictiveAnalytics } from "@/components/analytics/PredictiveAnalytics";
import { CustomReports } from "@/components/analytics/CustomReports";
import { ClientInsights } from "@/components/analytics/ClientInsights";

const AnalyticsPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("last30days");

  return (
    <PageLayout>
      <PageHeader
        title="Business Analytics & Intelligence"
        subtitle="Advanced analytics, KPI tracking, and business intelligence insights"
        icon={BarChart3}
        badges={[
          { text: "Real-time Data", icon: TrendingUp, variant: "fixlyfy" },
          { text: "Predictive AI", icon: Target, variant: "success" },
          { text: "Custom Reports", icon: Calendar, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <FileX className="h-3.5 w-3.5" />
              Client Insights
            </TabsTrigger>
            <TabsTrigger value="team">Team Analytics</TabsTrigger>
            <TabsTrigger value="predictive">Forecasting</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <BusinessDashboard timeframe={selectedTimeframe} onTimeframeChange={setSelectedTimeframe} />
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalytics timeframe={selectedTimeframe} />
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics timeframe={selectedTimeframe} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ClientInsights timeframe={selectedTimeframe} />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamPerformance timeframe={selectedTimeframe} />
          </TabsContent>
          
          <TabsContent value="predictive" className="space-y-6">
            <PredictiveAnalytics />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <CustomReports />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AnalyticsPage;
