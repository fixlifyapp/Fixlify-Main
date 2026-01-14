import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { InvoiceManager } from "@/components/finance/InvoiceManager";
import { PaymentTracker } from "@/components/finance/PaymentTracker";
import { AdvancedReportsPanel } from "@/components/reports/AdvancedReportsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { UniversalSendDialog } from "@/components/jobs/dialogs/shared/UniversalSendDialog";
import { useUniversalDocumentSend } from "@/hooks/useUniversalDocumentSend";
import { useInvoices } from "@/hooks/useInvoices";
import { useAllPayments } from "@/hooks/useAllPayments";
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Target,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Real data hooks
  const { invoices: rawInvoices, isLoading: invoicesLoading, refreshInvoices } = useInvoices();
  const { payments: rawPayments, isLoading: paymentsLoading, totalPayments, totalRefunds, failedPayments, refreshPayments } = useAllPayments();

  // Universal document send hook
  const {
    sendState,
    openSendDialog,
    closeSendDialog,
    handleSendSuccess,
    isOpen: isSendDialogOpen
  } = useUniversalDocumentSend({
    onSuccess: () => {
      toast.success("Invoice sent successfully!");
      refreshInvoices();
    }
  });

  // Get active tab from URL params, default to "dashboard"
  const activeTab = searchParams.get("tab") || "dashboard";

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Transform invoices to match InvoiceManager interface
  const transformedInvoices = useMemo(() => {
    return rawInvoices.map(inv => {
      // Determine status based on payment and due date
      let status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' = 'draft';
      const balance = (inv.total || 0) - (inv.amount_paid || 0);
      const dueDate = inv.due_date ? new Date(inv.due_date) : null;
      const isOverdue = dueDate && dueDate < new Date();

      if (inv.status === 'paid' || balance <= 0) {
        status = 'paid';
      } else if (inv.amount_paid && inv.amount_paid > 0) {
        status = isOverdue ? 'overdue' : 'partial';
      } else if (inv.status === 'sent' || inv.status === 'unpaid') {
        status = isOverdue ? 'overdue' : 'sent';
      } else {
        status = 'draft';
      }

      // Format dates properly - use created_at + 30 days if no due_date
      const createdAt = inv.created_at ? new Date(inv.created_at) : new Date();
      const defaultDueDate = new Date(createdAt);
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);

      const dueDateValue = inv.due_date ? new Date(inv.due_date) : defaultDueDate;
      const formattedDueDate = !isNaN(dueDateValue.getTime())
        ? dueDateValue.toISOString().split('T')[0]
        : defaultDueDate.toISOString().split('T')[0];

      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        number: inv.invoice_number || '',
        client_name: inv.client_name || 'Unknown Client',
        client_email: inv.client_email || '',
        client_phone: inv.client_phone || '',
        clientName: inv.client_name || 'Unknown Client',
        amount: inv.total || 0,
        total: inv.total || 0,
        status,
        dueDate: formattedDueDate,
        createdDate: inv.created_at || new Date().toISOString(),
        paidAmount: inv.amount_paid || 0
      };
    });
  }, [rawInvoices]);

  // Transform payments to match PaymentTracker interface
  const transformedPayments = useMemo(() => {
    return rawPayments.map(pay => ({
      id: pay.id,
      invoiceNumber: pay.invoice_number || pay.payment_number || 'N/A',
      clientName: pay.client_name || 'Unknown',
      amount: Math.abs(pay.amount),
      method: (pay.method as 'credit-card' | 'cash' | 'check' | 'bank-transfer' | 'e-transfer') || 'cash',
      status: pay.amount < 0 ? 'refunded' as const : (pay.status === 'completed' ? 'completed' as const : 'pending' as const),
      date: pay.date || pay.created_at,
      reference: pay.reference || pay.payment_number
    }));
  }, [rawPayments]);

  // Calculate financial metrics from real data
  const metrics = useMemo(() => {
    const totalRevenue = transformedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = transformedInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const pendingPayments = transformedInvoices
      .filter(inv => inv.status === 'sent' || inv.status === 'partial')
      .reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);
    const overdueAmount = transformedInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);

    const monthlyGoal = 15000; // TODO: Make configurable in settings
    const averageJobValue = transformedInvoices.length > 0 ? totalRevenue / transformedInvoices.length : 0;

    // Calculate this month vs last month payments
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthPayments = rawPayments
      .filter(p => p.amount > 0 && new Date(p.created_at) >= thisMonthStart)
      .reduce((sum, p) => sum + p.amount, 0);

    const lastMonthPayments = rawPayments
      .filter(p => {
        const payDate = new Date(p.created_at);
        return p.amount > 0 && payDate >= lastMonthStart && payDate <= lastMonthEnd;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const growth = lastMonthPayments > 0
      ? ((thisMonthPayments - lastMonthPayments) / lastMonthPayments) * 100
      : 0;

    return {
      totalRevenue,
      totalPaid,
      pendingPayments,
      overdueAmount,
      monthlyGoal,
      averageJobValue,
      paymentTrends: {
        thisMonth: thisMonthPayments,
        lastMonth: lastMonthPayments,
        growth: Math.round(growth)
      }
    };
  }, [transformedInvoices, rawPayments]);

  // Calculate payment metrics
  const paymentMetrics = useMemo(() => {
    const processingFees = 0; // We don't track processing fees currently

    return {
      totalPayments,
      processingFees,
      failedPayments
    };
  }, [totalPayments, failedPayments]);

  // Event handlers
  function handleCreateInvoice() {
    toast.info("Use the Jobs page to create invoices for specific jobs.");
  }

  function handleEditInvoice(id: string) {
    // Find the invoice and navigate to its job
    const invoice = rawInvoices.find(inv => inv.id === id);
    if (invoice?.job_id) {
      navigate(`/jobs/${invoice.job_id}?tab=invoices`);
    } else {
      toast.info("Invoice details page coming soon!");
    }
  }

  function handleSendInvoice(invoice: any) {
    // Find the full invoice object from real data
    const fullInvoice = transformedInvoices.find(inv => inv.id === invoice.id) || invoice;

    openSendDialog(fullInvoice, 'invoice', {
      name: fullInvoice.client_name || fullInvoice.clientName,
      email: fullInvoice.client_email || '',
      phone: fullInvoice.client_phone || ''
    });
  }

  function handleViewInvoice(id: string) {
    // Find the invoice and navigate to its job
    const invoice = rawInvoices.find(inv => inv.id === id);
    if (invoice?.job_id) {
      navigate(`/jobs/${invoice.job_id}?tab=invoices`);
    } else {
      toast.info("Invoice details page coming soon!");
    }
  }

  function handleAddPayment() {
    toast.info("Use the Jobs page to record payments for specific invoices.");
  }

  function handleRefundPayment(id: string) {
    toast.info("Use the Jobs page to refund payments.");
  }

  function handleExportPayments() {
    toast.success("Payment export feature coming soon!");
  }

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Financial Management"
          subtitle="Comprehensive financial tracking, invoicing, and payment management"
          icon={DollarSign}
          badges={[
            { text: "Revenue Tracking", icon: TrendingUp, variant: "success" },
            { text: "Smart Invoicing", icon: FileText, variant: "fixlyfy" },
            { text: "Payment Analytics", icon: BarChart3, variant: "info" }
          ]}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FinancialDashboard
              totalRevenue={metrics.totalRevenue}
              totalPaid={metrics.totalPaid}
              pendingPayments={metrics.pendingPayments}
              overdueAmount={metrics.overdueAmount}
              monthlyGoal={metrics.monthlyGoal}
              averageJobValue={metrics.averageJobValue}
              paymentTrends={metrics.paymentTrends}
            />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoiceManager
              invoices={transformedInvoices}
              onCreateInvoice={handleCreateInvoice}
              onEditInvoice={handleEditInvoice}
              onSendInvoice={handleSendInvoice}
              onViewInvoice={handleViewInvoice}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentTracker
              payments={transformedPayments}
              totalPayments={paymentMetrics.totalPayments}
              processingFees={paymentMetrics.processingFees}
              failedPayments={paymentMetrics.failedPayments}
              onAddPayment={handleAddPayment}
              onRefundPayment={handleRefundPayment}
              onExportPayments={handleExportPayments}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AdvancedReportsPanel />
          </TabsContent>
        </Tabs>
      </AnimatedContainer>
      
      {/* Universal Send Dialog */}
      {isSendDialogOpen && sendState && (
        <UniversalSendDialog
          isOpen={isSendDialogOpen}
          onClose={closeSendDialog}
          documentType={sendState.documentType}
          documentId={sendState.documentId}
          documentNumber={sendState.documentNumber}
          total={sendState.total}
          contactInfo={sendState.contactInfo}
          onSuccess={handleSendSuccess}
        />
      )}
    </PageLayout>
  );
}
