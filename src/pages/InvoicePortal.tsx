import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Download, CreditCard, Printer, Clock, CheckCircle, DollarSign, Eye, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import {
  DocumentHeader,
  DocumentItemsTable,
  DocumentTotals,
  DocumentNotes
} from "@/components/documents/DocumentComponents";
import { PortalThemeProvider, usePortalTheme } from "@/components/portal/PortalThemeProvider";
import { ThemeToggle } from "@/components/portal/ThemeToggle";
import { AccessibilityControls } from "@/components/portal/AccessibilityControls";

function InvoicePortalContent() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const { toast } = useToast();
  const { isDark } = usePortalTheme();

  useEffect(() => {
    if (token) {
      loadInvoiceData();
    }
  }, [token]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Load invoice by portal access token
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("portal_access_token", token)
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        throw new Error("Invoice not found or invalid access token");
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
        .eq("invoice_id", invoiceData.id)
        .order("payment_date", { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData);
      }

      // Load line items for this invoice
      const { data: lineItemsData } = await supabase
        .from("line_items")
        .select("*")
        .eq("parent_type", "invoice")
        .eq("parent_id", invoiceData.id)
        .order("created_at", { ascending: true });

      if (lineItemsData) {
        setLineItems(lineItemsData);
      }

      // Load company settings
      const { data: companyData } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (companyData) {
        setCompany({
          name: companyData.company_name,
          email: companyData.company_email,
          phone: companyData.company_phone,
          website: companyData.company_website,
          address: companyData.company_address,
          city: companyData.company_city,
          state: companyData.company_state,
          zip: companyData.company_zip,
          logo: companyData.company_logo_url
        });
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Failed to load invoice. Please check your link and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info("PDF download feature will be available soon. You can print this page using your browser's print function.");
    window.print();
  };

  const handlePayNow = () => {
    toast.info("Online payment will be available soon. Please contact us for payment options.");
  };

  const handleShare = async () => {
    const shareData = {
      title: `Invoice #${invoice?.invoice_number}`,
      text: `View invoice from ${company?.name || 'our company'}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 max-w-md">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">The invoice you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out tax items from line items
  const productItems = lineItems.filter((item: any) => 
    !item.name?.toLowerCase().includes('tax') && 
    !item.description?.toLowerCase().includes('tax')
  );
  const subtotal = productItems.reduce((sum: number, item: any) => {
    const amount = parseFloat(item.total || item.amount || '0');
    return sum + amount;
  }, 0);
  const taxRate = parseFloat(invoice.tax_rate) || 0;
  const taxAmount = parseFloat(invoice.tax_amount) || (subtotal * taxRate / 100);
  const discountAmount = parseFloat(invoice.discount_amount) || 0;
  const total = parseFloat(invoice.total) || subtotal + taxAmount - discountAmount;
  const totalPaid = payments.reduce((sum: number, payment: any) => 
    sum + (parseFloat(payment.amount) || 0), 0
  );
  const balance = total - totalPaid;
  const isPaid = invoice.payment_status === 'paid' || balance <= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Invoice #{invoice.invoice_number}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!isPaid && balance > 0 && (
                <Button
                  onClick={handlePayNow}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <CreditCard className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Pay Now</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                title="Download PDF"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <ThemeToggle />
              <AccessibilityControls />
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Header with Company and Client Info */}
          <DocumentHeader
            type="invoice"
            documentNumber={invoice.invoice_number}
            date={invoice.created_at}
            dueDate={invoice.due_date}
            status={invoice.payment_status}
            company={company}
            client={client}
          />

          {/* Job Information */}
          {job && (
            <div className="px-8 py-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Job Reference</h3>
                  <p className="mt-1 text-lg text-gray-900">{job.title}</p>
                </div>
                {invoice.invoice_date && (
                  <div className="text-right">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Invoice Date</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {format(new Date(invoice.invoice_date), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {invoice.description && (
            <div className="px-8 py-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.description}</p>
            </div>
          )}

          {/* Line Items */}
          {productItems.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Items</h3>
              <DocumentItemsTable items={productItems} />
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment History</h3>
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(parseFloat(payment.amount))}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPaymentMethod(payment.method)} • {format(new Date(payment.payment_date || payment.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {payment.status || 'Completed'}
                      </Badge>
                    </div>
                    {payment.reference && (
                      <p className="text-sm text-gray-500 mt-2">Ref: {payment.reference}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Totals and Notes */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notes */}
              <div>
                {invoice.notes && (
                  <DocumentNotes
                    title="Notes"
                    content={invoice.notes}
                    type="info"
                  />
                )}
                {invoice.terms && (
                  <DocumentNotes
                    title="Terms & Conditions"
                    content={invoice.terms}
                    type="warning"
                  />
                )}
              </div>

              {/* Totals */}
              <div>
                <DocumentTotals
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  taxRate={taxRate}
                  discountAmount={discountAmount}
                  total={total}
                  paidAmount={totalPaid}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 text-white text-center">
            <p className="text-sm">
              {isPaid
                ? "Thank you for your payment. We appreciate your business!"
                : "Thank you for your business. Please remit payment at your earliest convenience."
              }
            </p>
            {company?.email && (
              <p className="text-sm mt-2 opacity-90">
                Questions? Contact us at {company.email}
              </p>
            )}
          </div>
        </div>

        {/* QR Code Section - for easy mobile access */}
        <div className="mt-6 flex justify-center print:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Scan to view on mobile</p>
            <div className="bg-white p-2 inline-block rounded-lg">
              <QRCode
                value={window.location.href}
                size={120}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with theme provider
export default function InvoicePortal() {
  return (
    <PortalThemeProvider>
      <InvoicePortalContent />
    </PortalThemeProvider>
  );
}
