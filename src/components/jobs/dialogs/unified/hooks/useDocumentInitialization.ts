
import { useState, useEffect, useCallback } from "react";
import { LineItem } from "../../../builder/types";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";
import { useTaxSettings } from "@/hooks/useTaxSettings";

interface UseDocumentInitializationProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
}

export const useDocumentInitialization = ({
  documentType,
  existingDocument,
  jobId,
  open
}: UseDocumentInitializationProps) => {
  const { taxConfig } = useTaxSettings();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(taxConfig.rate || 13.0);
  const [notes, setNotes] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Update tax rate when user's tax settings change
  useEffect(() => {
    if (taxConfig.rate && !existingDocument) {
      setTaxRate(taxConfig.rate);
    }
  }, [taxConfig.rate, existingDocument]);

  // Initialize document data when dialog opens or existing document changes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      return;
    }

    const initializeDocument = async () => {
      console.log("=== INITIALIZING DOCUMENT ===");
      console.log("Document type:", documentType);
      console.log("Existing document:", existingDocument);
      
      if (existingDocument) {
        // Load existing document data
        setNotes(existingDocument.notes || "");
        
        // Set tax rate from existing document or fallback to user settings
        const existingTaxRate = existingDocument.tax_rate || existingDocument.taxRate;
        if (existingTaxRate) {
          setTaxRate(parseFloat(existingTaxRate.toString()) || taxConfig.rate || 13.0);
        } else {
          setTaxRate(taxConfig.rate || 13.0);
        }
        
        if (documentType === 'estimate') {
          const estimate = existingDocument as Estimate;
          setDocumentNumber(estimate.estimate_number || estimate.number || "");
        } else if (documentType === 'invoice' && 'estimate_number' in existingDocument) {
          // Converting from estimate - generate new invoice number
          const estimate = existingDocument as Estimate;
          const invoiceNumber = `INV-${estimate.estimate_number?.replace('EST-', '') || Date.now()}`;
          setDocumentNumber(invoiceNumber);
        } else {
          const invoice = existingDocument as Invoice;
          setDocumentNumber(invoice.invoice_number || invoice.number || "");
        }

        // Load line items from database
        console.log("Loading line items for existing document:", existingDocument.id);
        try {
          let queryParentType = documentType;
          let queryParentId = existingDocument.id;
          
          // If we're editing an invoice that was converted from an estimate, load invoice line items first
          if (documentType === 'invoice') {
            const invoice = existingDocument as Invoice;
            
            // First try to load invoice line items
            const { data: invoiceItems, error: invoiceError } = await supabase
              .from('line_items')
              .select('*')
              .eq('parent_type', 'invoice')
              .eq('parent_id', invoice.id);

            if (!invoiceError && invoiceItems && invoiceItems.length > 0) {
              console.log(`Loaded ${invoiceItems.length} line items from invoice`);
              const transformedItems: LineItem[] = invoiceItems.map(item => ({
                id: `temp-${Date.now()}-${Math.random()}`,
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: Number(item.unit_price) || 0,
                taxable: item.taxable !== false,
                discount: 0,
                ourPrice: 0,
                name: item.description || '',
                price: Number(item.unit_price) || 0,
                total: (item.quantity || 1) * (Number(item.unit_price) || 0)
              }));
              setLineItems(transformedItems);
              return; // Exit early if we found invoice items
            }
            
            // If no invoice items found and this was converted from estimate, load estimate items
            if (invoice.estimate_id) {
              console.log("Invoice has no line items, loading from original estimate:", invoice.estimate_id);
              queryParentType = 'estimate';
              queryParentId = invoice.estimate_id;
            }
          }
          
          // Load line items for the determined parent
          const { data: items, error } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_type', queryParentType)
            .eq('parent_id', queryParentId);

          if (error) {
            console.error("Error loading line items:", error);
          } else if (items) {
            console.log(`Loaded ${items.length} line items from ${queryParentType}`);
            // Transform database items to LineItem format
            const transformedItems: LineItem[] = items.map(item => ({
              id: `temp-${Date.now()}-${Math.random()}`, // Generate new IDs for invoice items
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: Number(item.unit_price) || 0,
              taxable: item.taxable !== false,
              discount: 0,
              ourPrice: 0,
              name: item.description || '',
              price: Number(item.unit_price) || 0,
              total: (item.quantity || 1) * (Number(item.unit_price) || 0)
            }));
            setLineItems(transformedItems);
          }
        } catch (error) {
          console.error("Error fetching line items:", error);
        }
      } else {
        // Generate new document number only once
        if (!documentNumber) {
          try {
            const { data: newNumber, error } = await supabase.rpc('generate_next_id', {
              p_entity_type: documentType
            });
            
            if (error) throw error;
            
            setDocumentNumber(newNumber);
            console.log(`Generated new ${documentType} number:`, newNumber);
          } catch (error) {
            console.error(`Error generating ${documentType} number:`, error);
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            const fallbackNumber = `${prefix}-${Date.now()}`;
            setDocumentNumber(fallbackNumber);
          }
        }
        setLineItems([]);
        setNotes("");
      }
      
      console.log("Document initialization completed");
      setIsInitialized(true);
    };

    initializeDocument();
  }, [open, existingDocument, documentType]);

  // Function to refetch line items from database (useful when upsells are added)
  const refetchLineItems = useCallback(async (documentId: string, parentType: string = documentType) => {
    if (!documentId) return;

    console.log("Refetching line items for:", parentType, documentId);
    try {
      const { data: items, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_type', parentType)
        .eq('parent_id', documentId);

      if (error) {
        console.error("Error refetching line items:", error);
        return;
      }

      if (items) {
        console.log(`Refetched ${items.length} line items from ${parentType}`);
        const transformedItems: LineItem[] = items.map(item => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: Number(item.unit_price) || 0,
          taxable: item.taxable !== false,
          discount: 0,
          ourPrice: 0,
          name: item.description || '',
          price: Number(item.unit_price) || 0,
          total: (item.quantity || 1) * (Number(item.unit_price) || 0)
        }));
        setLineItems(transformedItems);
      }
    } catch (error) {
      console.error("Error in refetchLineItems:", error);
    }
  }, [documentType, setLineItems]);

  return {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized,
    refetchLineItems
  };
};
