
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function FinanceHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Manage payments, invoices, and estimates
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>
    </div>
  );
}
