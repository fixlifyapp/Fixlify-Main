
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle, BarChart3, Zap } from "lucide-react";

const InventoryPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Inventory"
        subtitle="Manage your parts, equipment, and stock levels"
        icon={Package}
        badges={[
          { text: "Stock Tracking", icon: BarChart3, variant: "fixlyfy" },
          { text: "Low Stock Alerts", icon: AlertTriangle, variant: "warning" },
          { text: "Auto Ordering", icon: Zap, variant: "info" }
        ]}
        actionButton={{
          text: "Add Item",
          icon: Plus,
          onClick: () => {}
        }}
      />
      
      <div className="fixlyfy-card p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Inventory Management</h2>
        <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
          Track parts, manage stock levels, and receive AI alerts when inventory is low.
        </p>
        <Button variant="outline" className="mb-4">
          <Plus size={18} className="mr-2" /> Add Your First Item
        </Button>
        <p className="text-sm text-fixlyfy-text-muted">
          This module is coming soon with complete functionality.
        </p>
      </div>
    </PageLayout>
  );
};

export default InventoryPage;
