import { useState, useEffect } from "react";
import { generateNextId } from "@/utils/idGeneration";
import { InvoiceFormData } from "./invoice/types";
import { useInvoiceLineItems } from "./invoice/useInvoiceLineItems";
import { useInvoiceCalculations } from "./invoice/useInvoiceCalculations";
import { useInvoiceInitialization } from "./invoice/useInvoiceInitialization";
import { useInvoicePersistence } from "./invoice/useInvoicePersistence";

export const useInvoiceBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    lineItems,
    setLineItems,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem
  } = useInvoiceLineItems();

  const {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal
  } = useInvoiceCalculations(lineItems);

  const {
    initializeFromEstimate,
    initializeFromInvoice
  } = useInvoiceInitialization(setLineItems, setNotes, setFormData);

  const {
    saveInvoiceChanges: savePersistent
  } = useInvoicePersistence(
    jobId,
    formData,
    lineItems,
    notes,
    taxRate,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    setFormData
  );

  // Generate invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = async () => {
      try {
        const invoiceNumber = await generateNextId('invoice');
        setFormData(prev => ({
          ...prev,
          invoiceNumber
        }));
      } catch (error) {
        console.error('Error generating invoice number:', error);
        const timestamp = Date.now();
        const shortNumber = timestamp.toString().slice(-4);
        setFormData(prev => ({
          ...prev,
          invoiceNumber: `I-${shortNumber}`
        }));
      }
    };

    generateInvoiceNumber();
  }, []);

  const resetForm = async () => {
    try {
      const invoiceNumber = await generateNextId('invoice');
      setFormData({
        invoiceNumber,
        items: [],
        notes: "",
        status: "draft",
        total: 0
      });
      setLineItems([]);
      setNotes("");
    } catch (error) {
      console.error('Error resetting form:', error);
      const timestamp = Date.now();
      const shortNumber = timestamp.toString().slice(-4);
      setFormData({
        invoiceNumber: `I-${shortNumber}`,
        items: [],
        notes: "",
        status: "draft",
        total: 0
      });
      setLineItems([]);
      setNotes("");
    }
  };

  const saveInvoiceChanges = async () => {
    if (isSubmitting) {
      console.log('Already submitting, skipping duplicate call');
      return null;
    }
    
    setIsSubmitting(true);
    try {
      return await savePersistent();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber: formData.invoiceNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  };
};
