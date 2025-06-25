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

  // Get active tab from URL params, default to "dashboard"
  const activeTab = searchParams.get("tab") || "dashboard";

  // Mock data - in a real app, this would come from your data hooks
  const mockInvoices = useMemo(() => [
    {
      id: "inv1",
      number: "INV-001",
      clientName: "John Smith",
      amount: 1250,
      status: "paid" as const,
      dueDate: "2024-01-15",
      createdDate: "2024-01-01",
      paidAmount: 1250
    },
    {
      id: "inv2",
      number: "INV-002",
      clientName: "Sarah Johnson",
      amount: 850,
      status: "sent" as const,
      dueDate: "2024-01-20",
      createdDate: "2024-01-05"
    },
    {
      id: "inv3",
      number: "INV-003",
      clientName: "Mike Wilson",
      amount: 2100,
      status: "overdue" as const,
      dueDate: "2024-01-10",
      createdDate: "2023-12-20"
    },
    {
      id: "inv4",
      number: "INV-004",
      clientName: "Lisa Brown",
      amount: 675,
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

  function handleSendInvoice(id: string) {
    toast.success(`Invoice ${id} sent successfully!`);
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
    </PageLayout>
  );
}
