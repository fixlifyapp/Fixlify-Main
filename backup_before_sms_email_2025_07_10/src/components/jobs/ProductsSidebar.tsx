
import { Card } from "@/components/ui/card";
import { JobProducts } from "@/components/jobs/JobProducts";
import { useParams } from "react-router-dom";

export function ProductsSidebar() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <Card className="border-fixlyfy-border shadow-sm p-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Products</h3>
        </div>
        <JobProducts jobId={id || ""} />
      </Card>
    </div>
  );
}
