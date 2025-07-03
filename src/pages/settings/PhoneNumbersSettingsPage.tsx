import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Phone, MessageSquare, DollarSign, Zap } from "lucide-react";
import { PhoneNumberManager } from "@/components/settings/phone-numbers";

const PhoneNumbersSettingsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Purchase and manage phone numbers for SMS communications"
        icon={Phone}
        badges={[
          { text: "SMS Enabled", icon: MessageSquare, variant: "success" },
          { text: "Telnyx Integration", icon: Zap, variant: "fixlyfy" },
          { text: "Pay Per Use", icon: DollarSign, variant: "info" }
        ]}
      />

      <PhoneNumberManager />
    </PageLayout>
  );
};

export default PhoneNumbersSettingsPage;