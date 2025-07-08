import React, { useState } from 'react';
import { Estimate } from '@/types/estimate';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon, CopyIcon, MailIcon, EditIcon, ArrowRightIcon } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

interface EstimatesListProps {
  estimates: Estimate[];
  onConvertToInvoice: (estimateId: string) => void;
  onEstimateUpdated: () => void;
}

export function EstimatesList({ estimates, onConvertToInvoice, onEstimateUpdated }: EstimatesListProps) {
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>A list of your estimates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {estimates.map((estimate) => (
            <TableRow key={estimate.id}>
              <TableCell>{estimate.estimate_number}</TableCell>
              <TableCell>{estimate.client?.name}</TableCell>
              <TableCell>{new Date(estimate.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline">{estimate.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(estimate.total || 0)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      CopyToClipboard(estimate.estimate_number || '', {
                        onCopy: () => toast.success('Copied to clipboard'),
                      })
                    }}>
                      <CopyIcon className="mr-2 h-4 w-4" /> Copy Estimate #
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedEstimate(estimate);
                      setShowSendDialog(true);
                    }}>
                      <MailIcon className="mr-2 h-4 w-4" /> Send
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEstimateUpdated()}>
                      <EditIcon className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onConvertToInvoice(estimate.id)}>
                      Convert to Invoice <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={() => setShowSendDialog(false)}
        documentType="estimate"
        documentId={selectedEstimate?.id || ''}
        documentNumber={selectedEstimate?.estimate_number || ''}
        total={selectedEstimate?.total || 0}
        contactInfo={{
          name: selectedEstimate?.client?.name || '',
          email: selectedEstimate?.client?.email || '',
          phone: selectedEstimate?.client?.phone || ''
        }}
      />
    </div>
  );
}
