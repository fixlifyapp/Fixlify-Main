import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { roundToCurrency } from "@/lib/utils";

interface UsePaymentFormProps {
  invoice: {
    id: string;
    total: number;
    amount_paid?: number;
    balance?: number;
  };
  jobId: string;
  onPaymentAdded?: () => void;
  onClose: () => void;
}

export interface PaymentFormErrors {
  amount?: string;
}

export const usePaymentForm = ({ invoice, jobId, onPaymentAdded, onClose }: UsePaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addPayment, isProcessing } = usePaymentActions(jobId, () => {
    console.log('Payment action completed, triggering refresh');
    if (onPaymentAdded) {
      onPaymentAdded();
    }
  });

  // Use proper currency rounding for all calculations
  const remainingBalance = roundToCurrency(
    invoice.balance ?? (invoice.total - (invoice.amount_paid ?? 0))
  );
  const maxPayment = Math.max(0, remainingBalance);

  // Inline validation for amount field
  const validateAmount = useCallback((value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return undefined; // Empty is not an error until submit
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }

    if (numValue > remainingBalance + 0.01) { // Small tolerance for floating point
      return `Cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`;
    }

    return undefined;
  }, [remainingBalance]);

  // Wrapped setAmount with inline validation
  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    const error = validateAmount(value);
    setErrors(prev => ({ ...prev, amount: error }));
  }, [validateAmount]);

  // Check if form is valid for submit
  const isFormValid = amount.trim() !== '' && !errors.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting || isProcessing) {
      console.log('Payment submission already in progress, ignoring duplicate click');
      return;
    }
    
    // Validate input
    const trimmedAmount = amount.trim();
    if (!trimmedAmount || trimmedAmount === "" || trimmedAmount === "0") {
      toast.error("Please enter a payment amount");
      return;
    }

    const paymentAmount = parseFloat(trimmedAmount);
    
    // Check if amount is valid number
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount greater than 0");
      return;
    }
    
    // Round the payment amount to avoid floating point issues
    const roundedPaymentAmount = roundToCurrency(paymentAmount);
    
    // More lenient validation for partial payments - allow any positive amount up to remaining balance
    if (roundedPaymentAmount > remainingBalance + 0.01) { // Small tolerance for floating point
      toast.error(`Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`);
      return;
    }

    // Validate invoice ID
    if (!invoice.id) {
      toast.error("Invalid invoice - missing ID");
      return;
    }

    setIsSubmitting(true);
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    try {
      console.log('Submitting payment for invoice:', invoice.id, 'amount:', roundedPaymentAmount, 'job:', jobId);
      
      const success = await addPayment({
        invoiceId: invoice.id,
        amount: roundedPaymentAmount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (success) {
        console.log('Payment recorded successfully, closing dialog and refreshing');
        
        // Reset form first
        setAmount("");
        setMethod("cash");
        setReference("");
        setNotes("");
        
        // Close dialog immediately
        onClose();
        
        // The refresh is already handled by usePaymentActions callback
        // No need for additional refresh calls here
      } else {
        // addPayment already shows error toast
        console.error('Payment recording failed');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    }
  };

  const resetForm = () => {
    setAmount("");
    setMethod("cash");
    setReference("");
    setNotes("");
    setErrors({});
  };

  return {
    amount,
    setAmount: handleAmountChange,
    method,
    setMethod,
    reference,
    setReference,
    notes,
    setNotes,
    isSubmitting,
    isProcessing,
    remainingBalance,
    maxPayment,
    handleSubmit,
    resetForm,
    errors,
    isFormValid
  };
};
