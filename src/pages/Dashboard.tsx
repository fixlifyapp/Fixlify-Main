
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { BarChart3, Zap, Bot, Target } from "lucide-react";
import { TimePeriod } from "@/types/dashboard";
import { EnhancedKpiCards } from "@/components/dashboard/EnhancedKpiCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { ModernMetricsGrid } from "@/components/dashboard/ModernMetricsGrid";
import { AiInsightsPanel } from "@/components/dashboard/AiInsightsPanel";
import { ClientValuePanel } from "@/components/dashboard/ClientValuePanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAgentWidget } from "@/components/dashboard/AIAgentWidget";
import { DeclineInsightsWidget } from "@/components/dashboard/DeclineInsightsWidget";
import { DashboardFilterControls } from "@/components/dashboard/DashboardFilterControls";
import { useIsMobile } from "@/hooks/use-mobile";

export type { TimePeriod };

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Component mounted
  }, []);

  const handleFilterChange = (period: TimePeriod, range?: { from: Date | undefined; to: Date | undefined }) => {
    setTimePeriod(period);
    if (range) {
      setDateRange(range);
    }
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <PageLayout>
      <div className="w-full">
        <PageHeader
          title="Dashboard"
          subtitle={isMobile ? "Business overview" : "Get an overview of your business performance and key metrics"}
          icon={BarChart3}
          badges={[
            { text: "Real-time", icon: Zap, variant: "fixlyfy" },
            { text: isMobile ? "AI" : "AI Insights", icon: Bot, variant: "success" },
            { text: isMobile ? "Multi" : "Multi-metric", icon: Target, variant: "info" }
          ]}
        />

        {/* Filter Controls */}
        <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'} mb-6`}>
          <DashboardFilterControls
            currentPeriod={timePeriod}
            dateRange={dateRange}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Key Metrics - Fixed Grid Layout */}
        <div className="w-full mb-6">
          <EnhancedKpiCards 
            timePeriod={timePeriod}
            dateRange={dateRange}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className={`grid grid-cols-1 ${isMobile ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-4 lg:gap-6 mb-6`}>
          {/* Charts and Metrics */}
          <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'} space-y-4 lg:space-y-6`}>
            <DashboardCharts />
            <ModernMetricsGrid />
          </div>

          {/* Widgets and Insights */}
          <div className={`space-y-4 lg:space-y-6 ${isMobile ? 'order-first' : ''}`}>
            <AiInsightsPanel />
            <DeclineInsightsWidget />
            <AIAgentWidget />
            {!isMobile && <ClientValuePanel />}
            <QuickActionsPanel />
          </div>
        </div>

        {/* Secondary Metrics and Tables */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-4 lg:gap-6'} mb-6`}>
          <RecentJobs />
          <UpcomingJobs />
        </div>

        {/* Mobile-only Client Value Panel */}
        {isMobile && (
          <div className="w-full mb-6">
            <ClientValuePanel />
          </div>
        )}

        {/* Full Width Activity Feed */}
        <div className="w-full">
          <ActivityFeed />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
