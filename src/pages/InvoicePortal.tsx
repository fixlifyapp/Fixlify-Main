import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CreditCard, CheckCircle, Clock, Receipt, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function InvoicePortal() {
  const { invoiceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Load invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        throw new Error("Invoice not found");
      }

      setInvoice(invoiceData);

      // Load job if exists
      if (invoiceData.job_id) {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", invoiceData.job_id)
          .maybeSingle();
        
        if (jobData) {
          setJob(jobData);
        }
      }

      // Load client if exists
      if (invoiceData.client_id) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("id", invoiceData.client_id)
          .maybeSingle();
        
        if (clientData) {
          setClient(clientData);
        }
      }

      // Load payments for this invoice
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false });
      
      if (paymentsData) {
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Coming Soon",
      description: "PDF download feature will be available soon. You can print this page using your browser's print function.",
    });
    window.print();
  };

  const handlePayNow = () => {
    toast({
      title: "Coming Soon",
      description: "Online payment will be available soon. Please contact us for payment options.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600">The invoice you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lineItems = invoice.items || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    const amount = parseFloat(item.total || item.amount || '0');
    return sum + amount;
  }, 0);
  const taxAmount = parseFloat(invoice.tax_amount) || 0;
  const total = parseFloat(invoice.total) || subtotal + taxAmount;
  const totalPaid = payments.reduce((sum: number, payment: any) => 
    sum + (parseFloat(payment.amount) || 0), 0
  );
  const balance = total - totalPaid;
  const isPaid = invoice.payment_status === 'paid' || balance <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
              <p className="text-gray-600">Created on {format(new Date(invoice.created_at), "MMMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={isPaid ? 'default' : invoice.payment_status === 'pending' ? 'secondary' : 'outline'}
              className="text-sm"
            >
              {isPaid && <CheckCircle className="h-4 w-4 mr-1" />}
              {invoice.payment_status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
              {invoice.payment_status || 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">Invoice</CardTitle>
                {job && <p className="text-green-100">Job: {job.title}</p>}
              </div>
              <div className="text-right">
                <Sparkles className="h-8 w-8 text-green-300 ml-auto mb-2" />
                <p className="text-3xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Client Info */}
            {client && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  {client.email && <p>{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                  {client.address && (
                    <p>
                      {client.address}
                      {client.city && `, ${client.city}`}
                      {client.state && `, ${client.state}`}
                      {client.zip && ` ${client.zip}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Due Date */}
            {invoice.due_date && (
              <div className="mb-8">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Due Date:</span>{" "}
                  {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                </p>
              </div>
            )}

            {/* Description */}
            {invoice.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{invoice.description}</p>
              </div>
            )}

            {/* Line Items */}
            {lineItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700 font-medium">Description</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Quantity</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Rate</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item: any, index: number) => {
                        const quantity = parseFloat(item.quantity || '1');
                        const rate = parseFloat(item.rate || item.price || item.amount || '0');
                        const itemTotal = parseFloat(item.total || item.amount || (quantity * rate) || '0');
                        
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-gray-600">
                              {item.description || item.name || 'Item ' + (index + 1)}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-right">{quantity}</td>
                            <td className="py-3 px-4 text-gray-600 text-right">
                              {formatCurrency(rate)}
                            </td>
                            <td className="py-3 px-4 text-gray-900 font-medium text-right">
                              {formatCurrency(itemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {totalPaid > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600 pt-2">
                      <span>Total Paid</span>
                      <span className="text-green-600">-{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                      <span>Balance Due</span>
                      <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Status */}
            {isPaid && invoice.payment_date && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Paid on {format(new Date(invoice.payment_date), "MMMM d, yyyy")}
                </p>
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment History</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.method && `${payment.method} • `}
                          {format(new Date(payment.payment_date || payment.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status || 'Completed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600 text-sm">{invoice.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              {!isPaid && (
                <Button 
                  onClick={handlePayNow}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
