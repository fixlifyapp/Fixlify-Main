
import React, { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface JobInvoicesProps {
  jobId: string;
  invoices: Invoice[];
  onCreateInvoice: () => void;
}

const JobInvoices: React.FC<JobInvoicesProps> = ({
  jobId,
  invoices,
  onCreateInvoice
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <Button onClick={onCreateInvoice}>
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      
      {invoices.length === 0 ? (
        <p className="text-gray-500">No invoices created yet.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{invoice.invoice_number}</h4>
                  <p className="text-sm text-gray-600">{invoice.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${invoice.total.toFixed(2)}</p>
                  <p className="text-sm capitalize">{invoice.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobInvoices;
