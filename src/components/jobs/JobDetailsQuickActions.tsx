import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { SteppedEstimateBuilder } from './dialogs/SteppedEstimateBuilder';

interface JobDetailsQuickActionsProps {
  jobId: string;
  onInvoiceCreated?: () => void;
  onEstimateCreated?: () => void;
}

export const JobDetailsQuickActions: React.FC<JobDetailsQuickActionsProps> = ({
  jobId,
  onInvoiceCreated,
  onEstimateCreated
}) => {
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open quick actions menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowEstimateBuilder(true)}>
              Create Estimate
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              Create Invoice
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SteppedEstimateBuilder
        isOpen={showEstimateBuilder}
        onOpenChange={setShowEstimateBuilder}
        jobId={jobId}
        onEstimateCreated={onEstimateCreated}
      />
    </Card>
  );
};
