
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EstimatesPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Estimates"
        subtitle="Manage and track all your project estimates"
        icon={Calculator}
        badges={[
          { text: "Quick Generation", icon: Target, variant: "fixlyfy" },
          { text: "Conversion Tracking", icon: TrendingUp, variant: "success" },
          { text: "AI Pricing", icon: CheckCircle, variant: "info" }
        ]}
        actionButton={{
          text: "New Estimate",
          icon: Plus,
          onClick: () => {}
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Estimates Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Estimates functionality coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EstimatesPage;
