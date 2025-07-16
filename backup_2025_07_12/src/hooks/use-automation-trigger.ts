import { useCallback } from 'react';
import { toast } from 'sonner';
import automationTrigger from '@/services/automation-trigger';

export function useAutomationTrigger() {
  const triggerJobCreated = useCallback(async (jobData: any) => {
    try {
      await automationTrigger.triggerJobCreated(jobData);
    } catch (error) {
      console.error('Failed to trigger job created automation:', error);
    }
  }, []);

  const triggerJobStatusChanged = useCallback(async (jobId: string, oldStatus: string, newStatus: string, jobData?: any) => {
    try {
      await automationTrigger.triggerJobStatusChanged(jobId, oldStatus, newStatus, jobData);
      
      // Special handling for completed status
      if (newStatus === 'completed' && jobData) {
        await automationTrigger.triggerJobCompleted(jobData);
      }
    } catch (error) {
      console.error('Failed to trigger job status changed automation:', error);
    }
  }, []);

  const triggerJobScheduled = useCallback(async (jobData: any) => {
    try {
      await automationTrigger.triggerJobScheduled(jobData);
    } catch (error) {
      console.error('Failed to trigger job scheduled automation:', error);
    }
  }, []);

  const triggerEstimateSent = useCallback(async (estimateData: any) => {
    try {
      await automationTrigger.triggerEstimateSent(estimateData);
    } catch (error) {
      console.error('Failed to trigger estimate sent automation:', error);
    }
  }, []);

  const triggerEstimateApproved = useCallback(async (estimateData: any) => {
    try {
      await automationTrigger.triggerEstimateApproved(estimateData);
    } catch (error) {
      console.error('Failed to trigger estimate approved automation:', error);
    }
  }, []);

  const triggerInvoiceCreated = useCallback(async (invoiceData: any) => {
    try {
      await automationTrigger.triggerInvoiceCreated(invoiceData);
    } catch (error) {
      console.error('Failed to trigger invoice created automation:', error);
    }
  }, []);

  const triggerPaymentReceived = useCallback(async (paymentData: any) => {
    try {
      await automationTrigger.triggerPaymentReceived(paymentData);
    } catch (error) {
      console.error('Failed to trigger payment received automation:', error);
    }
  }, []);

  const triggerMissedCall = useCallback(async (callData: any) => {
    try {
      await automationTrigger.triggerMissedCall(callData);
    } catch (error) {
      console.error('Failed to trigger missed call automation:', error);
    }
  }, []);

  const triggerCustomerInquiry = useCallback(async (inquiryData: any) => {
    try {
      await automationTrigger.triggerCustomerInquiry(inquiryData);
    } catch (error) {
      console.error('Failed to trigger customer inquiry automation:', error);
    }
  }, []);

  return {
    triggerJobCreated,
    triggerJobStatusChanged,
    triggerJobScheduled,
    triggerEstimateSent,
    triggerEstimateApproved,
    triggerInvoiceCreated,
    triggerPaymentReceived,
    triggerMissedCall,
    triggerCustomerInquiry,
  };
}
