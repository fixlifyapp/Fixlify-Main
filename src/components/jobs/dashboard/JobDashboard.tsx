import { useState, Suspense, lazy } from "react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useInvoices } from "@/hooks/useInvoices";
import { useEstimates } from "@/hooks/useEstimates";
import { usePayments } from "@/hooks/usePayments";
import { useJobHistory } from "@/hooks/useJobHistory";
import { useJobTasks, useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useJobFinancials } from "@/hooks/useJobFinancials";
import { useMessageContext } from "@/contexts/MessageContext";
import { JobDashboardHeader } from "./JobDashboardHeader";
import {
  ClientInfoSection,
  FinancialSummaryCard,
  ScheduleCard,
  DescriptionSection,
  DocumentsSection,
  PaymentsSection,
  TasksProgressCard,
  ActivityFeed
} from "./sections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Lazy load dialogs for performance
const SteppedEstimateBuilder = lazy(() =>
  import("../dialogs/SteppedEstimateBuilder").then(m => ({ default: m.SteppedEstimateBuilder }))
);
const SteppedInvoiceBuilder = lazy(() =>
  import("../dialogs/SteppedInvoiceBuilder").then(m => ({ default: m.SteppedInvoiceBuilder }))
);
const UnifiedDocumentViewer = lazy(() =>
  import("../dialogs/UnifiedDocumentViewer").then(m => ({ default: m.UnifiedDocumentViewer }))
);
const UnifiedPaymentDialog = lazy(() =>
  import("../dialogs/UnifiedPaymentDialog").then(m => ({ default: m.UnifiedPaymentDialog }))
);

interface JobDashboardProps {
  jobId: string;
}

export const JobDashboard = ({ jobId }: JobDashboardProps) => {
  const { job, isLoading: isJobLoading, currentStatus, updateJobStatus, refreshJob } = useJobDetails();
  const { openMessageDialog } = useMessageContext();

  // Financial data
  const {
    invoiceAmount,
    balance,
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading: isFinancialsLoading,
    refreshFinancials
  } = useJobFinancials(jobId);

  // Documents data
  const { invoices, isLoading: isInvoicesLoading, refetch: refetchInvoices } = useInvoices(jobId);
  const { estimates, isLoading: isEstimatesLoading, refetch: refetchEstimates } = useEstimates(jobId);

  // Payments data
  const { payments, isLoading: isPaymentsLoading, refetch: refetchPayments } = usePayments(jobId);

  // Tasks data
  const { data: tasks = [], isLoading: isTasksLoading } = useJobTasks(jobId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // History data
  const { historyItems, isLoading: isHistoryLoading } = useJobHistory(jobId);

  // Messages - would need to fetch separately or use context
  const [messages] = useState<any[]>([]);

  // Dialog states
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(false);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<"estimate" | "invoice">("estimate");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);

  // Computed values
  const totalRefunded = payments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  const netPayments = totalPaid - totalRefunded;

  // Transform documents for DocumentsSection
  const estimateDocs = estimates.map(e => ({
    id: e.id,
    type: "estimate" as const,
    number: e.estimate_number || e.number || "Draft",
    status: e.status || "draft",
    amount: e.total || 0,
    createdAt: e.created_at || new Date().toISOString()
  }));

  const invoiceDocs = invoices.map(i => ({
    id: i.id,
    type: "invoice" as const,
    number: i.invoice_number || i.number || "Draft",
    status: i.status || "draft",
    amount: i.total || 0,
    balance: i.balance_due || i.balance,
    createdAt: i.created_at || new Date().toISOString()
  }));

  // Handlers
  const handleStatusChange = async (newStatus: string) => {
    await updateJobStatus(newStatus);
  };

  const handleCall = () => {
    if (job?.phone) {
      window.location.href = `tel:${job.phone}`;
    }
  };

  const handleMessage = () => {
    if (job?.clientId) {
      openMessageDialog({
        id: job.clientId,
        name: typeof job.client === 'string' ? job.client : job.client?.name || 'Client',
        phone: job.phone || '',
        email: job.email || ''
      });
    }
  };

  const handleEmail = () => {
    if (job?.email) {
      window.location.href = `mailto:${job.email}`;
    }
  };

  const handleDescriptionSave = async (description: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ description })
      .eq('id', jobId);

    if (error) throw error;
    refreshJob();
  };

  const handleViewDocument = (doc: any) => {
    // Find the full document from estimates or invoices
    if (doc.type === "estimate") {
      const fullEstimate = estimates.find(e => e.id === doc.id);
      setSelectedDocument(fullEstimate);
      setSelectedDocumentType("estimate");
    } else {
      const fullInvoice = invoices.find(i => i.id === doc.id);
      setSelectedDocument(fullInvoice);
      setSelectedDocumentType("invoice");
    }
    setShowDocumentViewer(true);
  };

  const handlePayInvoice = (doc: any) => {
    const invoice = invoices.find(i => i.id === doc.id);
    if (invoice) {
      setSelectedInvoiceForPayment(invoice);
      setShowPaymentDialog(true);
    }
  };

  const handleConvertEstimate = async (doc: any) => {
    // Find the estimate and convert to invoice
    const estimate = estimates.find(e => e.id === doc.id);
    if (!estimate) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          client_id: job?.clientId,
          line_items: estimate.line_items,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          total: estimate.total,
          status: 'sent',
          notes: estimate.notes
        });

      if (error) throw error;

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', doc.id);

      toast.success('Estimate converted to invoice');
      refetchInvoices();
      refetchEstimates();
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate');
    }
  };

  const handleRecordPayment = () => {
    // Find the first unpaid invoice
    const unpaidInvoice = invoices.find(i =>
      (i.balance_due || i.balance || i.total) > 0
    );
    if (unpaidInvoice) {
      setSelectedInvoiceForPayment(unpaidInvoice);
    }
    setShowPaymentDialog(true);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await updateTask.mutateAsync({
      id: taskId,
      status: completed ? "completed" : "pending"
    });
  };

  const handleAddTask = async (task: {
    description: string;
    priority: "low" | "medium" | "high";
  }) => {
    await createTask.mutateAsync({
      description: task.description,
      job_id: jobId,
      client_id: job?.clientId,
      priority: task.priority
    });
  };

  // Extract client data
  const clientData = job ? {
    name: typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown',
    phone: job.phone || '',
    email: job.email || '',
    address: job.address || ''
  } : null;

  if (isJobLoading || !job) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-32 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <JobDashboardHeader
        jobId={jobId}
        clientName={clientData?.name || "Client"}
        clientId={job.clientId}
        jobType={job.job_type || job.service || "Service"}
        status={currentStatus}
        onStatusChange={handleStatusChange}
        onCall={job.phone ? handleCall : undefined}
        onMessage={job.clientId ? handleMessage : undefined}
        onEmail={job.email ? handleEmail : undefined}
      />

      {/* Top Row: Client Info, Financials, Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ClientInfoSection
          name={clientData?.name || "Unknown"}
          phone={clientData?.phone}
          email={clientData?.email}
          address={clientData?.address}
          clientId={job.clientId}
        />

        <FinancialSummaryCard
          totalInvoiced={invoiceAmount}
          totalReceived={totalPaid}
          balance={balance}
          overdueAmount={overdueAmount}
          isLoading={isFinancialsLoading}
        />

        <ScheduleCard
          scheduledStart={job.schedule_start || job.scheduled_start}
          scheduledEnd={job.schedule_end || job.scheduled_end}
          technicianName={job.technician_name || (job.profiles as any)?.name}
          onReschedule={() => {
            // Would open reschedule dialog
            toast.info('Reschedule functionality coming soon');
          }}
        />
      </div>

      {/* Description */}
      <DescriptionSection
        description={job.description || ""}
        onSave={handleDescriptionSave}
        editable={true}
      />

      {/* Middle Row: Documents + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DocumentsSection
          estimates={estimateDocs}
          invoices={invoiceDocs}
          isLoading={isEstimatesLoading || isInvoicesLoading}
          onCreateEstimate={() => setShowEstimateBuilder(true)}
          onCreateInvoice={() => setShowInvoiceBuilder(true)}
          onViewDocument={handleViewDocument}
          onPayInvoice={handlePayInvoice}
          onConvertEstimate={handleConvertEstimate}
        />

        <PaymentsSection
          payments={payments.map(p => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            date: p.date,
            created_at: p.created_at
          }))}
          totalPaid={totalPaid}
          totalRefunded={totalRefunded}
          netAmount={netPayments}
          outstandingBalance={balance}
          isLoading={isPaymentsLoading}
          onRecordPayment={handleRecordPayment}
        />
      </div>

      {/* Bottom Row: Tasks + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TasksProgressCard
          tasks={tasks.map(t => ({
            id: t.id,
            description: t.description,
            status: t.status as "pending" | "completed",
            priority: t.priority as "low" | "medium" | "high",
            assigned_to: t.assigned_to,
            due_date: t.due_date
          }))}
          isLoading={isTasksLoading}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
        />

        <ActivityFeed
          historyItems={historyItems}
          messages={messages}
          isLoading={isHistoryLoading}
          onOpenMessages={handleMessage}
        />
      </div>

      {/* Dialogs */}
      <Suspense fallback={null}>
        {showEstimateBuilder && (
          <SteppedEstimateBuilder
            isOpen={showEstimateBuilder}
            onClose={() => setShowEstimateBuilder(false)}
            jobId={jobId}
            clientId={job.clientId}
            onEstimateCreated={() => {
              refetchEstimates();
              setShowEstimateBuilder(false);
            }}
          />
        )}

        {showInvoiceBuilder && (
          <SteppedInvoiceBuilder
            isOpen={showInvoiceBuilder}
            onClose={() => setShowInvoiceBuilder(false)}
            jobId={jobId}
            clientId={job.clientId}
            onInvoiceCreated={() => {
              refetchInvoices();
              setShowInvoiceBuilder(false);
            }}
          />
        )}

        {showDocumentViewer && selectedDocument && (
          <UnifiedDocumentViewer
            document={selectedDocument}
            documentType={selectedDocumentType}
            jobId={jobId}
            isOpen={showDocumentViewer}
            onClose={() => {
              setShowDocumentViewer(false);
              setSelectedDocument(null);
            }}
            onUpdate={() => {
              if (selectedDocumentType === "estimate") {
                refetchEstimates();
              } else {
                refetchInvoices();
              }
            }}
            onConvertToInvoice={selectedDocumentType === "estimate" ? () => {
              refetchInvoices();
              refetchEstimates();
              setShowDocumentViewer(false);
              setSelectedDocument(null);
            } : undefined}
          />
        )}

        {showPaymentDialog && selectedInvoiceForPayment && (
          <UnifiedPaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => {
              setShowPaymentDialog(false);
              setSelectedInvoiceForPayment(null);
            }}
            invoice={{
              id: selectedInvoiceForPayment.id,
              invoice_number: selectedInvoiceForPayment.invoice_number || "INV",
              total: selectedInvoiceForPayment.total || 0,
              amount_paid: selectedInvoiceForPayment.amount_paid || 0,
              balance: selectedInvoiceForPayment.balance_due || selectedInvoiceForPayment.balance || selectedInvoiceForPayment.total || 0
            }}
            jobId={jobId}
            onPaymentAdded={() => {
              refetchPayments();
              refetchInvoices();
              refreshFinancials();
              setShowPaymentDialog(false);
              setSelectedInvoiceForPayment(null);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};
