import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CreditCard, FileText } from "lucide-react";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Job {
  id: string;
  title: string;
  client_id: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  due_date: string;
  created_at: string;
  items: any[];
  job_id: string;
  amount_paid: number;
  balance_due: number;
}

interface InvoiceWithRelations extends Invoice {
  job?: Job;
  client?: Client;
}

export default function InvoicePortal() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      // First, fetch the invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .maybeSingle();

      if (invoiceError) {
        console.error("Error loading invoice:", invoiceError);
        throw invoiceError;
      }

      if (!invoiceData) {
        throw new Error("Invoice not found");
      }

      // Then fetch the job if we have a job_id
      let jobData = null;
      let clientData = null;

      if (invoiceData.job_id) {
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", invoiceData.job_id)
          .maybeSingle();

        if (!jobError && job) {
          jobData = job;

          // Fetch the client if we have a client_id
          if (job.client_id) {
            const { data: client, error: clientError } = await supabase
              .from("clients")
              .select("*")
              .eq("id", job.client_id)
              .maybeSingle();

            if (!clientError && client) {
              clientData = client;
            }
          }
        }
      }

      // Combine the data
      const combinedData: InvoiceWithRelations = {
        ...invoiceData,
        job: jobData,
        client: clientData
      };
      
      setInvoice(combinedData);
    } catch (err: any) {
      console.error("Error loading invoice:", err);
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = () => {
    // TODO: Implement payment processing
    alert("Payment processing coming soon!");
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert("PDF download coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              {error || "Invoice not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = invoice.client;
  const balanceDue = invoice.balance_due || invoice.total || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
          <p className="text-gray-600">Review and pay your invoice</p>
        </div>

        {/* Invoice Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  Invoice #{invoice.invoice_number}
                </CardTitle>
                <p className="mt-2 opacity-90">
                  {client?.name || "Customer"}
                </p>
              </div>
              <Badge 
                className={
                  invoice.status === "paid" 
                    ? "bg-green-100 text-green-800" 
                    : invoice.status === "overdue"
                    ? "bg-red-100 text-red-800"
                    : invoice.status === "partially_paid"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {invoice.status?.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Client Details */}
            {client && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="font-medium">{client.name}</p>
                {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
              </div>
            )}

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-medium">
                  {format(new Date(invoice.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium">
                  {invoice.due_date 
                    ? format(new Date(invoice.due_date), "MMM dd, yyyy")
                    : "Upon Receipt"
                  }
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.description || item.name}</p>
                        {item.quantity && (
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.price}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${(item.total || item.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-3 font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right">
                      ${(invoice.total || 0).toFixed(2)}
                    </td>
                  </tr>
                  {invoice.amount_paid > 0 && (
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-medium text-green-600">
                        Amount Paid
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        -${invoice.amount_paid.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t bg-gray-100">
                    <td className="px-4 py-3 font-semibold text-lg">
                      Balance Due
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-lg">
                      ${balanceDue.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {invoice.status !== "paid" && balanceDue > 0 && (
                <Button 
                  onClick={handlePayInvoice}
                  className="flex-1"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay Invoice
                </Button>
              )}
              <Button 
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className={invoice.status === "paid" ? "flex-1" : ""}
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            </div>

            {invoice.status === "paid" && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800 font-medium">
                  ✓ This invoice has been paid in full
                </p>
              </div>
            )}

            {invoice.status === "overdue" && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg text-center">
                <p className="text-red-800 font-medium">
                  ⚠️ This invoice is overdue. Please pay as soon as possible.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Powered by Fixlify • Business Automation Platform</p>
        </div>
      </div>
    </div>
  );
}