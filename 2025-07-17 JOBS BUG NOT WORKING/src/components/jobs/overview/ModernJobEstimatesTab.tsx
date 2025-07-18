import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useJob } from '@/hooks/useJob';
import { formatCurrency } from '@/lib/currency';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useEstimates } from '@/hooks/useEstimates';
import { useEffect, useState } from 'react';
import { Estimate } from '@/types';
import { MoreVertical, Pencil, Send, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteEstimate } from '@/actions/estimate';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UniversalSendDialog } from '@/components/jobs/dialogs/shared/UniversalSendDialog';

interface ModernJobEstimatesTabProps {
  jobId: string;
}

export function ModernJobEstimatesTab({ jobId }: ModernJobEstimatesTabProps) {
  const { jobData } = useJob(jobId);
  const { estimates, refreshEstimates } = useEstimates(jobId);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshEstimates();
  }, [jobId, refreshEstimates]);

  const handleDeleteEstimate = async (estimateId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this estimate?");
    if (!confirmDelete) return;

    try {
      await deleteEstimate(estimateId);
      toast.success("Estimate deleted successfully!");
      refreshEstimates();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete estimate");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>
            Manage estimates for this job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates?.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>{estimate.estimate_number}</TableCell>
                  <TableCell>{new Date(estimate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(estimate.total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{estimate.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(ROUTES.ESTIMATE_DETAILS(estimate.id))}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedEstimate(estimate);
                          setShowSendDialog(true);
                        }}>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteEstimate(estimate.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {estimates?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No estimates found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UniversalSendDialog
        open={showSendDialog}
        onOpenChange={() => setShowSendDialog(false)}
        documentType="estimate"
        documentId={selectedEstimate?.id}
        documentNumber={selectedEstimate?.estimate_number}
        total={selectedEstimate?.total}
        contactInfo={{
          name: jobData?.client?.name || '',
          email: jobData?.client?.email || '',
          phone: jobData?.client?.phone || ''
        }}
        onSuccess={() => {
          setShowSendDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
