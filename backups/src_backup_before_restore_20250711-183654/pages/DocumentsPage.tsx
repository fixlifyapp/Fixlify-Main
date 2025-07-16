
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Shield, Search, Share } from "lucide-react";

const DocumentsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Documents"
        subtitle="Manage contracts, estimates, and other important files"
        icon={FileText}
        badges={[
          { text: "Secure Storage", icon: Shield, variant: "fixlyfy" },
          { text: "Smart Search", icon: Search, variant: "success" },
          { text: "Easy Sharing", icon: Share, variant: "info" }
        ]}
        actionButton={{
          text: "Upload Document",
          icon: Plus,
          onClick: () => {}
        }}
      />
      
      <div className="fixlyfy-card p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Document Management</h2>
        <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
          Store, organize, and share important documents with your team and clients.
        </p>
        <Button variant="outline" className="mb-4">
          <Plus size={18} className="mr-2" /> Upload Your First Document
        </Button>
        <p className="text-sm text-fixlyfy-text-muted">
          This module is coming soon with complete functionality.
        </p>
      </div>
    </PageLayout>
  );
};

export default DocumentsPage;
