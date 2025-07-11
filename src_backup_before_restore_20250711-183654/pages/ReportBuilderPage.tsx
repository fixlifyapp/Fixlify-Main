
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { BarChart3, Target, Zap, TrendingUp } from "lucide-react";

const ReportBuilderPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Report Builder"
        subtitle="Create custom reports and analytics dashboards"
        icon={BarChart3}
        badges={[
          { text: "Custom Analytics", icon: Target, variant: "fixlyfy" },
          { text: "Real-time Data", icon: Zap, variant: "success" },
          { text: "Business Intelligence", icon: TrendingUp, variant: "info" }
        ]}
      />
      <ReportBuilder />
    </PageLayout>
  );
};

export default ReportBuilderPage;
