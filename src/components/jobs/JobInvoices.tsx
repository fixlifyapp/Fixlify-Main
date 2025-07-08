import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Invoice } from '@/types';
import { format } from 'date-fns';
import { UnifiedDocumentViewer } from '@/components/jobs/UnifiedDocumentViewer';
import { SteppedInvoiceBuilder } from './dialogs/SteppedInvoiceBuilder';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JobInvoicesProps {
  jobId: string;
  onInvoiceCreated?: () => void;
  onDocumentUpdated?: () => void;
}

export const JobInvoices: React.FC<JobInvoicesProps> = ({ jobId, onInvoiceCreated, onDocumentUpdated }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [jobId]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('job_id', jobId);

      if (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch invoices. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error('Unexpected error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching invoices.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoice_number',
      header: 'Invoice Number',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.original.due_date ? new Date(row.original.due_date) : null;
        return date ? format(date, 'MMM dd, yyyy') : 'N/A';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setSelectedInvoice(row.original);
          setShowInvoiceViewer(true);
        }}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      ),
    },
  ];

  const onInvoiceCreatedHandler = () => {
    fetchInvoices();
    onInvoiceCreated?.();
  };

  const onDocumentUpdatedHandler = () => {
    fetchInvoices();
    onDocumentUpdated?.();
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <Button onClick={() => setShowInvoiceBuilder(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={invoices} />
      </CardContent>

      <SteppedInvoiceBuilder
        isOpen={showInvoiceBuilder}
        onOpenChange={setShowInvoiceBuilder}
        jobId={jobId}
        onInvoiceCreated={onInvoiceCreatedHandler}
      />

      <UnifiedDocumentViewer
        isOpen={showInvoiceViewer}
        onOpenChange={setShowInvoiceViewer}
        document={selectedInvoice}
        documentType="invoice"
        jobId={jobId}
        onDocumentUpdated={onDocumentUpdatedHandler}
      />
    </Card>
  );
};
