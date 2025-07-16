import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  
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
    }
  });

  // Get active tab from URL params, default to "dashboard"
  const activeTab = searchParams.get("tab") || "dashboard";

  // Mock data - in a real app, this would come from your data hooks
  const mockInvoices = useMemo(() => [
    {
      id: "inv1",
      invoice_number: "INV-001",
      number: "INV-001",
      client_name: "John Smith",
      client_email: "john.smith@example.com",
      client_phone: "(555) 123-4567",
      clientName: "John Smith",
      amount: 1250,
      total: 1250,
      status: "paid" as const,
      dueDate: "2024-01-15",
      createdDate: "2024-01-01",
      paidAmount: 1250
    },
    {
      id: "inv2",
      invoice_number: "INV-002",
      number: "INV-002",
      client_name: "Sarah Johnson",
      client_email: "sarah.johnson@example.com", 
      client_phone: "(555) 234-5678",
      clientName: "Sarah Johnson",
      amount: 850,
      total: 850,
      status: "sent" as const,
      dueDate: "2024-01-20",
      createdDate: "2024-01-05"
    },
    {
      id: "inv3",
      invoice_number: "INV-003",
      number: "INV-003",
      client_name: "Mike Wilson",
      client_email: "mike.wilson@example.com",
      client_phone: "(555) 345-6789",
      clientName: "Mike Wilson",
      amount: 2100,
      total: 2100,
      status: "overdue" as const,
      dueDate: "2024-01-10",
      createdDate: "2023-12-20"
    },
    {
      id: "inv4",
      invoice_number: "INV-004",
      number: "INV-004",
      client_name: "Lisa Brown",
      client_email: "lisa.brown@example.com",
      client_phone: "(555) 456-7890",
      clientName: "Lisa Brown",
      amount: 675,
      total: 675,
      status: "partial" as const,
      dueDate: "2024-01-25",
      createdDate: "2024-01-08",
      paidAmount: 400
    }
  ], []);

  const mockPayments = useMemo(() => [
    {
      id: "pay1",
      invoiceNumber: "INV-001",
      clientName: "John Smith",
      amount: 1250,
      method: "credit-card" as const,
      status: "completed" as const,
      date: "2024-01-15",
      reference: "ch_1234567890",
      processingFee: 37.50
    },
    {
      id: "pay2",
      invoiceNumber: "INV-004",
      clientName: "Lisa Brown",
      amount: 400,
      method: "cash" as const,
      status: "completed" as const,
      date: "2024-01-12",
      reference: "CASH-001"
    },
    {
      id: "pay3",
      invoiceNumber: "INV-005",
      clientName: "Test Client",
      amount: 200,
      method: "credit-card" as const,
      status: "failed" as const,
      date: "2024-01-10",
      reference: "ch_failed_123"
    }
  ], []);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = mockInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const pendingPayments = mockInvoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = mockInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const monthlyGoal = 15000;
    const averageJobValue = totalRevenue / mockInvoices.length;
    const thisMonth = totalPaid;
    const lastMonth = 3200;
    const growth = ((thisMonth - lastMonth) / lastMonth) * 100;

    return {
      totalRevenue,
      totalPaid,
      pendingPayments,
      overdueAmount,
      monthlyGoal,
      averageJobValue,
      paymentTrends: {
        thisMonth,
        lastMonth,
        growth: Math.round(growth)
      }
    };
  }, [mockInvoices]);

  const paymentMetrics = useMemo(() => {
    const totalPayments = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const processingFees = mockPayments.reduce((sum, payment) => sum + (payment.processingFee || 0), 0);
    const failedPayments = mockPayments.filter(p => p.status === 'failed').length;

    return {
      totalPayments,
      processingFees,
      failedPayments
    };
  }, [mockPayments]);

  // Event handlers
  function handleCreateInvoice() {
    toast.info("Invoice creation feature coming soon!");
  }

  function handleEditInvoice(id: string) {
    toast.info(`Edit invoice ${id} - Feature coming soon!`);
  }

  function handleSendInvoice(invoice: any) {
    // Find the full invoice object from mockInvoices
    const fullInvoice = mockInvoices.find(inv => inv.id === invoice.id) || invoice;
    
    openSendDialog(fullInvoice, 'invoice', {
      name: fullInvoice.client_name || fullInvoice.clientName,
      email: fullInvoice.client_email || '',
      phone: fullInvoice.client_phone || ''
    });
  }

  function handleViewInvoice(id: string) {
    toast.info(`View invoice ${id} - Feature coming soon!`);
  }

  function handleAddPayment() {
    toast.info("Payment recording feature coming soon!");
  }

  function handleRefundPayment(id: string) {
    toast.info(`Refund payment ${id} - Feature coming soon!`);
  }

  function handleExportPayments() {
    toast.success("Payment export started!");
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
        <Tabs value={activeTab} className="space-y-6">
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
              invoices={mockInvoices}
              onCreateInvoice={handleCreateInvoice}
              onEditInvoice={handleEditInvoice}
              onSendInvoice={handleSendInvoice}
              onViewInvoice={handleViewInvoice}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentTracker
              payments={mockPayments}
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
