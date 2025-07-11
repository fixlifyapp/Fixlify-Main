import { useState, useEffect } from "react";
import { Invoice, Estimate, LineItem } from "@/types/documents";
import { useJobData } from "./useJobData";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { supabase } from "@/integrations/supabase/client";

interface UseUnifiedDocumentViewerProps {
  document: Invoice | Estimate;
  documentType: "invoice" | "estimate";
  jobId: string;
  onConvertToInvoice?: (estimate: Estimate) => void;
  onDocumentUpdated?: () => void;
}

// Lock tax rate to 13%
const LOCKED_TAX_RATE = 13;

export const useUnifiedDocumentViewer = ({
  document,
  documentType,
  jobId,
  onConvertToInvoice,
  onDocumentUpdated
}: UseUnifiedDocumentViewerProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { clientInfo, jobAddress } = useJobData(jobId);
  const { taxConfig } = useTaxSettings();

  // Get tax rate from document or fallback to user settings
  const taxRate = document.tax_rate || taxConfig.rate;

  // Fetch line items from database
  useEffect(() => {
    const fetchLineItems = async () => {
      if (!document?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching line items for document:', document.id, 'type:', documentType);
        
        const { data: items, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', documentType)
          .eq('parent_id', document.id);

        if (error) {
          console.error('Error fetching line items:', error);
        } else {
          console.log('Fetched line items:', items);
          // Transform database items to the expected format
          const transformedItems: LineItem[] = items?.map(item => ({
            id: item.id,
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: Number(item.unit_price) || 0,
            taxable: item.taxable !== false,
            total: (item.quantity || 1) * (Number(item.unit_price) || 0),
            discount: item.discount || 0
          })) || [];
          
          setLineItems(transformedItems);
        }
      } catch (error) {
        console.error('Error in fetchLineItems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLineItems();
  }, [document?.id, documentType]);

  // Fallback to document.items if no line items found in database
  useEffect(() => {
    if (!loading && lineItems.length === 0 && document.items) {
      console.log('Using fallback items from document:', document.items);
      const fallbackItems = Array.isArray(document.items) ? document.items : [];
      setLineItems(fallbackItems.map(item => ({
        id: item.id || `fallback-${Math.random()}`,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        taxable: item.taxable !== false,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        discount: item.discount || 0
      })));
    }
  }, [loading, lineItems.length, document.items]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const taxableTotal = lineItems.reduce((total, item) => {
      if (item.taxable) {
        return total + (item.quantity * item.unitPrice);
      }
      return total;
    }, 0);
    console.log('useUnifiedDocumentViewer - Using tax rate:', taxRate);
    return (taxableTotal * taxRate) / 100;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const getClientInfo = () => {
    if (clientInfo) {
      return {
        name: clientInfo.name || '',
        email: clientInfo.email || '',
        phone: clientInfo.phone || ''
      };
    }
    return { name: '', email: '', phone: '' };
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const documentNumber = documentType === "invoice" 
    ? (document as Invoice).invoice_number 
    : (document as Estimate).estimate_number;

  return {
    showSendDialog,
    setShowSendDialog,
    showEditDialog,
    setShowEditDialog,
    clientInfo,
    jobAddress,
    loading,
    lineItems,
    taxRate,
    documentNumber,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    getClientInfo,
    handleEdit,
    handleSend,
    handleSendSuccess,
    handleEditSuccess
  };
};
