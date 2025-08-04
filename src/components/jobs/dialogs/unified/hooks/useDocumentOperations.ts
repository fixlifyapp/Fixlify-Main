import { useCallback, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate, Invoice, LineItem } from "@/types/documents";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentFormData {
  documentId?: string;
  documentNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

interface UseDocumentOperationsProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  formData: DocumentFormData;
  lineItems: LineItem[];
  notes: string;
  calculateGrandTotal: () => number;
  onSyncToInvoice?: () => void;
}

export const useDocumentOperations = ({
  documentType,
  existingDocument,
  jobId,
  formData,
  lineItems,
  notes,
  calculateGrandTotal,
  onSyncToInvoice
}: UseDocumentOperationsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDocumentChanges = useCallback(async (): Promise<Estimate | Invoice | null> => {
    if (isSubmitting) {
      console.log("❌ Already submitting, skipping");
      return null;
    }
    
    setIsSubmitting(true);
    console.log('=== SAVE DOCUMENT CHANGES START ===');
    console.log('Document type:', documentType);
    console.log('Line items:', lineItems);
    console.log('Line items count:', lineItems.length);
    console.log('Form data:', formData);
    console.log('Job ID:', jobId);
    console.log('Job ID type:', typeof jobId);
    console.log('Total:', calculateGrandTotal());
    console.log('Notes:', notes);
    
    try {
      // Check if user is authenticated
      console.log('🔐 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('Authentication result:', { user: !!user, error: authError });
      
      if (authError || !user) {
        console.error('❌ Authentication error:', authError);
        throw new Error('Authentication required. Please log in to save documents.');
      }

      console.log('✅ User authenticated:', user.id);

      const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
      console.log('📋 Using table:', tableName);
      
      // Generate document number if not exists or if it's a new document
      let documentNumber = formData.documentNumber;
      
      if (!formData.documentId && !documentNumber) {
        // For new documents, always generate a proper ID using the ID generation system
        console.log('🔢 Generating new document number...');
        const { generateNextId } = await import('@/utils/idGeneration');
        documentNumber = await generateNextId(documentType);
        console.log('📄 Generated document number:', documentNumber);
      } else if (!documentNumber) {
        // Fallback for existing documents without a number
        documentNumber = `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`;
        console.log('📄 Using fallback document number:', documentNumber);
      }
      
      console.log('📄 Final document number:', documentNumber);
      
      // Validate job ID is string and not empty
      if (!jobId || typeof jobId !== 'string') {
        console.error('❌ Invalid job ID:', { jobId, type: typeof jobId });
        throw new Error('Invalid job ID provided');
      }
      
      // Validate job exists
      console.log('🔍 Validating job exists...');
      const { data: jobExists, error: jobError } = await supabase
        .from('jobs')
        .select('id')
        .eq('id', jobId)
        .single();
      
      if (jobError || !jobExists) {
        console.error('❌ Job validation failed:', jobError);
        throw new Error('Job not found. Please ensure the job exists.');
      }
      
      console.log('✅ Job validated:', jobExists.id);
      
      // Create document data - ensure job_id is always a string
      const baseDocumentData: any = {
        job_id: String(jobId), // Explicitly convert to string
        total: calculateGrandTotal(),
        status: formData.status || (documentType === 'estimate' ? 'draft' : 'unpaid'),
        notes: notes || '',
        user_id: user.id // Use the already authenticated user from line 64
        // Removed 'date' field as it doesn't exist in estimates table
      };

      const documentData = documentType === 'estimate' 
        ? {
            ...baseDocumentData,
            estimate_number: documentNumber,
            subtotal: calculateGrandTotal(), // Add required subtotal
            items: JSON.stringify(lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              taxable: item.taxable
            }))) // Store items as JSON string
          }
        : {
            ...baseDocumentData,
            invoice_number: documentNumber,
            amount_paid: 0,
            issue_date: new Date().toISOString().split('T')[0], // Add required issue_date
            payment_status: 'unpaid', // Add required payment_status
            subtotal: calculateGrandTotal(), // Add required subtotal
            items: JSON.stringify(lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              taxable: item.taxable
            }))) // Store items as JSON string
            // Removed 'balance' field as it's a generated column
          };

      console.log('📦 Document data to save:', documentData);

      let document;
      if (formData.documentId) {
        // Update existing document
        console.log('📝 Updating existing document:', formData.documentId);
        const { data, error } = await supabase
          .from(tableName)
          .update(documentData)
          .eq('id', formData.documentId)
          .select()
          .single();
          
        if (error) {
          console.error('❌ Error updating document:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Failed to update ${documentType}: ${error.message}`);
        }
        document = data;
        console.log('✅ Document updated:', document);
      } else {
        // Create new document
        console.log('➕ Creating new document for job_id:', String(jobId));
        const { data, error } = await supabase
          .from(tableName)
          .insert(documentData)
          .select()
          .single();
          
        if (error) {
          console.error('❌ Error creating document:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Provide more specific error messages
          if (error.code === '23503') {
            throw new Error(`Job ID ${jobId} not found. Please ensure the job exists.`);
          } else if (error.message.includes('row-level security')) {
            throw new Error('Access denied. Please ensure you have permission to create estimates.');
          } else {
            throw new Error(`Failed to create ${documentType}: ${error.message}`);
          }
        }
        document = data;
        console.log('✅ Document created:', document);
      }
      
      // Handle line items
      if (document && lineItems.length > 0) {
        console.log('📋 Saving line items for document:', document.id);
        console.log('Line items to save:', lineItems);
        
        // Delete existing line items first
        console.log('🗑️ Deleting existing line items...');
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', document.id)
          .eq('parent_type', documentType);
          
        if (deleteError) {
          console.error('⚠️ Error deleting existing line items:', deleteError);
          // Don't throw here, just log as it might not exist
        } else {
          console.log('✅ Existing line items deleted');
        }
        
        // Create new line items
        const lineItemsData = lineItems.map((item, index) => {
          const lineItemData = {
            parent_id: document.id,
            parent_type: documentType,
            description: item.description || `Item ${index + 1}`,
            quantity: item.quantity || 1,
            unit_price: item.unitPrice || 0,
            taxable: item.taxable !== undefined ? item.taxable : true
          };
          console.log(`Line item ${index}:`, lineItemData);
          return lineItemData;
        });
        
        console.log('💾 Inserting line items:', lineItemsData);
        
        const { data: insertedLineItems, error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItemsData)
          .select();
          
        if (lineItemsError) {
          console.error('❌ Error creating line items:', lineItemsError);
          console.error('Line items error details:', {
            code: lineItemsError.code,
            message: lineItemsError.message,
            details: lineItemsError.details,
            hint: lineItemsError.hint
          });
          throw new Error(`Failed to save line items: ${lineItemsError.message}`);
        }
        
        console.log('✅ Line items saved successfully:', insertedLineItems);
      } else {
        console.log('ℹ️ No line items to save');
      }

      // Try to log to job history (don't fail if this doesn't work)
      try {
        console.log('📝 Attempting to log job history...');
        const { error: historyError } = await supabase
          .from('job_history')
          .insert({
            job_id: String(jobId),
            entity_id: document.id,
            entity_type: documentType,
            type: `${documentType}-created`,
            title: `${documentType === 'estimate' ? 'Estimate' : 'Invoice'} Created`,
            description: `New ${documentType} ${documentNumber} created with total $${calculateGrandTotal()}`,
            user_id: user.id,
            user_name: user.email,
            new_value: document
          });

        if (historyError) {
          console.warn('⚠️ Failed to log job history (non-critical):', historyError);
        } else {
          console.log('✅ Job history logged successfully');
        }
      } catch (historyErr) {
        console.warn('⚠️ Job history logging failed (non-critical):', historyErr);
      }
      
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${formData.documentId ? 'updated' : 'created'} successfully`);
      
      // Return standardized format with all required properties
      if (documentType === 'estimate') {
        const result = {
          id: document.id,
          job_id: document.job_id,
          estimate_number: document.estimate_number,
          number: document.estimate_number,
          date: document.created_at, // Use created_at instead of date
          total: document.total,
          amount: document.total,
          status: document.status as Estimate['status'],
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at,
          items: [],
          subtotal: document.subtotal || 0,
          tax_rate: document.tax_rate,
          tax_amount: document.tax_amount,
          discount_amount: document.discount_amount,
          terms: document.terms,
          valid_until: document.valid_until,
          sent_at: document.sent_at,
          approved_at: document.approved_at,
          client_signature: document.client_signature,
          signature_timestamp: document.signature_timestamp,
          signature_ip: document.signature_ip,
          portal_access_token: document.portal_access_token,
          client_id: document.client_id,
          created_by: document.created_by,
          ...(document.title && { title: document.title }),
          description: document.description,
          techniciansNote: document.techniciansNote
        } as Estimate;
        console.log('📋 Returning estimate result:', result);
        return result;
      } else {
        const result = {
          id: document.id,
          job_id: document.job_id,
          invoice_number: document.invoice_number,
          number: document.invoice_number,
          date: document.created_at, // Use created_at instead of date
          total: document.total,
          amount_paid: document.amount_paid || 0,
          balance_due: (document.total || 0) - (document.amount_paid || 0),
          status: document.status as Invoice['status'],
          payment_status: document.payment_status as Invoice['payment_status'],
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at,
          items: [],
          subtotal: document.subtotal || 0,
          tax_rate: document.tax_rate,
          tax_amount: document.tax_amount,
          discount_amount: document.discount_amount,
          terms: document.terms,
          issue_date: document.issue_date,
          due_date: document.due_date,
          paid_at: document.paid_at,
          sent_at: document.sent_at,
          payment_link: document.payment_link,
          portal_access_token: document.portal_access_token,
          estimate_id: document.estimate_id,
          client_id: document.client_id,
          created_by: document.created_by,
          ...(document.title && { title: document.title }),
          description: document.description
        } as Invoice;
        console.log('📋 Returning invoice result:', result);
        return result;
      }
    } catch (error: any) {
      console.error(`❌ Error saving ${documentType}:`, error);
      console.error('Error stack:', error.stack);
      
      // Show more specific error messages
      if (error.message.includes('row-level security')) {
        toast.error(`Access denied. Please ensure you're logged in and have permission to ${formData.documentId ? 'update' : 'create'} ${documentType}s.`);
      } else if (error.message.includes('Authentication required')) {
        toast.error(error.message);
      } else if (error.message.includes('invalid input syntax for type uuid')) {
        toast.error(`Invalid job ID format. Please refresh the page and try again.`);
      } else if (error.message.includes('Job ID') && error.message.includes('not found')) {
        toast.error(error.message);
      } else if (error.message.includes('duplicate key value') || error.code === '23505') {
        // Handle duplicate estimate/invoice number error
        toast.error(`This ${documentType} number already exists. Please try again, a new number will be generated.`);
        // Clear the document number to force regeneration on next attempt
        if (formData.documentNumber) {
          formData.documentNumber = '';
        }
      } else {
        toast.error(`Failed to save ${documentType}: ${error.message}`);
      }
      
      return null;
    } finally {
      setIsSubmitting(false);
      console.log('=== SAVE DOCUMENT CHANGES END ===');
    }
  }, [documentType, jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  // Enhanced conversion from estimate to invoice with better error handling
  const convertToInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (documentType !== 'estimate' || !existingDocument) return null;

    try {
      setIsSubmitting(true);
      console.log('🔄 Converting estimate to invoice:', existingDocument.id);
      
      // Check authentication first
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        throw new Error('Authentication required to convert estimate to invoice.');
      }
      
      // Generate smart invoice number
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Create invoice with enhanced data
      const invoiceData = {
        job_id: String(jobId), // Ensure this is passed as text
        estimate_id: existingDocument.id,
        invoice_number: invoiceNumber,
        total: calculateGrandTotal(),
        amount_paid: 0,
        status: 'unpaid' as const,
        payment_status: 'unpaid' as const,
        notes: notes || existingDocument.notes,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        issue_date: new Date().toISOString().split('T')[0],
        subtotal: calculateGrandTotal(),
        items: []
      };

      console.log('📦 Creating invoice:', invoiceData);

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating invoice:', error);
        throw new Error(`Failed to create invoice: ${error.message}`);
      }

      console.log('✅ Created invoice:', invoice);

      // Copy line items to invoice
      if (lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));

        console.log('📋 Copying line items to invoice:', invoiceLineItems);

        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(invoiceLineItems);
          
        if (lineItemsError) {
          console.error('❌ Error copying line items:', lineItemsError);
          throw new Error(`Failed to copy line items: ${lineItemsError.message}`);
        }
        
        console.log('✅ Line items copied to invoice successfully');
      } else {
        console.log('⚠️ No line items to copy to invoice');
      }

      // Update estimate status to converted with improved error handling
      console.log('🔄 Updating estimate status to converted...');
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' as const })
        .eq('id', existingDocument.id);
        
      if (updateError) {
        console.error('⚠️ Error updating estimate status:', updateError);
        // Log the error but don't fail the conversion since invoice was created successfully
        toast.error('Invoice created successfully, but estimate status update failed. This does not affect the functionality.');
      } else {
        console.log('✅ Estimate status updated to converted');
      }

      // Log successful conversion to job history
      try {
        await supabase
          .from('job_history')
          .insert({
            job_id: String(jobId),
            entity_id: invoice.id,
            entity_type: 'invoice',
            type: 'estimate-converted',
            title: 'Estimate Converted to Invoice',
            description: `Estimate ${estimateNumber} converted to Invoice ${invoiceNumber}`,
            user_id: user.id,
            user_name: user.email,
            old_value: { estimate_id: existingDocument.id, estimate_status: 'approved' },
            new_value: { invoice_id: invoice.id, invoice_status: 'unpaid' }
          });
      } catch (historyError) {
        console.warn('⚠️ Failed to log conversion history (non-critical):', historyError);
      }

      console.log('✅ Estimate converted successfully');
      // Removed duplicate success toast - the notification is handled in useEstimates.ts
      
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }

      // Return properly typed invoice
      const result = {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        number: invoice.invoice_number,
        date: invoice.created_at,
        total: invoice.total,
        amount_paid: invoice.amount_paid || 0,
        balance_due: (invoice.total || 0) - (invoice.amount_paid || 0),
        status: invoice.status as Invoice['status'],
        payment_status: invoice.payment_status as Invoice['payment_status'],
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
        items: [],
        subtotal: invoice.subtotal || 0,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        terms: invoice.terms,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        paid_at: invoice.paid_at,
        sent_at: invoice.sent_at,
        payment_link: invoice.payment_link,
        portal_access_token: invoice.portal_access_token,
        estimate_id: invoice.estimate_id,
        client_id: invoice.client_id,
        created_by: invoice.created_by,
        ...(invoice.title && { title: invoice.title }),
        description: invoice.description
      } as Invoice;

      return result;

    } catch (error: any) {
      console.error('❌ Error converting to invoice:', error);
      
      if (error.message.includes('row-level security')) {
        toast.error('Access denied. Please ensure you have permission to create invoices.');
      } else {
        toast.error(`Failed to convert estimate to invoice: ${error.message}`);
      }
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [existingDocument, documentType, jobId, lineItems, notes, calculateGrandTotal, onSyncToInvoice]);

  return {
    isSubmitting,
    saveDocumentChanges,
    convertToInvoice
  };
};
