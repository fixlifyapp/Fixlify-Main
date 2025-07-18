
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsIntegrations } from "@/components/settings/SettingsIntegrations";
import { Zap, Cloud, Plug } from "lucide-react";

const IntegrationsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Integrations"
        subtitle="Connect your favorite tools and services"
        icon={Plug}
        badges={[
          { text: "Third Party", icon: Cloud, variant: "fixlyfy" },
          { text: "Automation", icon: Zap, variant: "success" }
        ]}
      />
      
      <SettingsIntegrations />
    </PageLayout>
  );
};

export default IntegrationsPage;
