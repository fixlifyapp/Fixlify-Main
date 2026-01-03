import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Brain, Sparkles, BarChart3 } from "lucide-react";
import { UpsellAIInsights } from "@/components/settings/configuration/UpsellAIInsights";

const AIInsightsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="AI Insights"
        subtitle="Understand how AI makes decisions and recommendations"
        icon={Brain}
        badges={[
          { text: "Machine Learning", icon: Sparkles, variant: "fixlyfy" },
          { text: "Analytics", icon: BarChart3, variant: "info" }
        ]}
      />

      <UpsellAIInsights />
    </PageLayout>
  );
};

export default AIInsightsPage;
