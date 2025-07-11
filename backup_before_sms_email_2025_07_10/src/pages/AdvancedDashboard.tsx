
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Brain, Filter, TrendingUp } from "lucide-react";
import { TimePeriod } from "@/types/dashboard";
import {
  AdvancedAnalytics,
  SmartFilters,
  PredictiveInsights
} from "@/components/dashboard";

const AdvancedDashboard = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Handle filter changes here
  };

  return (
    <PageLayout>
      <PageHeader
        title="Advanced Analytics Dashboard"
        subtitle="Deep insights, predictive analytics, and smart filtering for your business"
        icon={Brain}
        badges={[
          { text: "AI-Powered", icon: Brain, variant: "fixlyfy" },
          { text: "Predictive", icon: TrendingUp, variant: "success" },
          { text: "Smart Filters", icon: Filter, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="predictions">Predictive Insights</TabsTrigger>
            <TabsTrigger value="filters">Smart Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics timePeriod={timePeriod} dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-6">
            <PredictiveInsights />
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-6">
            <SmartFilters 
              onFiltersChange={handleFiltersChange}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdvancedDashboard;
