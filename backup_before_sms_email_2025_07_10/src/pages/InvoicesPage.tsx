
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, DollarSign, Target, TrendingUp } from "lucide-react";

const InvoicesPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Invoices"
        subtitle="Manage your invoices and payment tracking"
        icon={Receipt}
        badges={[
          { text: "Payment Tracking", icon: DollarSign, variant: "fixlyfy" },
          { text: "Auto Reminders", icon: Target, variant: "success" },
          { text: "Cash Flow", icon: TrendingUp, variant: "info" }
        ]}
        actionButton={{
          text: "Create Invoice",
          icon: Plus,
          onClick: () => {}
        }}
      />
      
      <div className="fixlyfy-card p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Invoice Management</h2>
        <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
          Track payments, generate invoices, and manage your financial records.
        </p>
        <Button variant="outline" className="mb-4">
          <Plus size={18} className="mr-2" /> Create Your First Invoice
        </Button>
        <p className="text-sm text-fixlyfy-text-muted">
          This module is coming soon with complete functionality.
        </p>
      </div>
    </PageLayout>
  );
};

export default InvoicesPage;
