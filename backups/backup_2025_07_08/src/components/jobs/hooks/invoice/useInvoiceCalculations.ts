
import { useCallback } from "react";
import { LineItem } from "@/components/jobs/builder/types";
import { useTaxSettings } from "@/hooks/useTaxSettings";

export const useInvoiceCalculations = (lineItems: LineItem[]) => {
  const { taxConfig } = useTaxSettings();

  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const taxableTotal = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return taxableTotal * (taxConfig.rate / 100);
  }, [lineItems, taxConfig.rate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  return {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    taxRate: taxConfig.rate,
    taxLabel: taxConfig.label
  };
};
