import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { JobProducts } from "@/components/jobs/JobProducts";
import { Package, BarChart3, Target, Zap } from "lucide-react";

const ProductsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        icon={Package}
        badges={[
          { text: "Inventory Tracking", icon: BarChart3, variant: "fixlyfy" },
          { text: "Smart Pricing", icon: Target, variant: "success" },
          { text: "Quick Import", icon: Zap, variant: "info" }
        ]}
      />

      <Card className="border-fixlyfy-border shadow-sm">
        <JobProducts jobId="" />
      </Card>
    </PageLayout>
  );
};

export default ProductsPage;
