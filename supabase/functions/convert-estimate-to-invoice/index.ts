import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConvertRequest {
  estimateId: string;
  adjustments?: {
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
    discount?: number;
    notes?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ConvertRequest = await req.json();
    const { estimateId, adjustments } = requestData;

    console.log('convert-estimate-to-invoice request:', { estimateId });

    if (!estimateId) {
      throw new Error('Estimate ID is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the estimate details
    const { data: estimate, error: estimateError } = await supabase
      .from('job_estimates')
      .select('*, jobs(*, clients(*))')
      .eq('id', estimateId)
      .single();

    if (estimateError) throw estimateError;

    if (!estimate) {
      throw new Error('Estimate not found');
    }

    // Check if estimate is approved
    if (estimate.status !== 'approved' && estimate.status !== 'accepted') {
      throw new Error('Only approved estimates can be converted to invoices');
    }

    // Check if already converted
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('estimate_id', estimateId)
      .single();

    if (existingInvoice) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `This estimate has already been converted to invoice ${existingInvoice.invoice_number}`,
          invoiceId: existingInvoice.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', estimate.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let invoiceNumber = 'INV-0001';
    if (lastInvoice?.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.replace('INV-', '')) || 0;
      invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Prepare invoice items from estimate items
    const items = adjustments?.items || estimate.items || [];
    const subtotal = items.reduce((sum: number, item: { quantity: number; unit_price: number }) =>
      sum + (item.quantity * item.unit_price), 0);
    const discount = adjustments?.discount || estimate.discount || 0;
    const taxRate = estimate.tax_rate || 0;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount;

    // Create due date (30 days from now by default)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: estimate.user_id,
        job_id: estimate.job_id,
        client_id: estimate.client_id,
        estimate_id: estimateId,
        invoice_number: invoiceNumber,
        items: items,
        subtotal: subtotal,
        discount: discount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        status: 'draft',
        due_date: dueDate.toISOString(),
        notes: adjustments?.notes || estimate.notes,
        terms: estimate.terms || 'Net 30'
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Update the estimate status to converted
    await supabase
      .from('job_estimates')
      .update({
        status: 'converted',
        converted_to_invoice_id: invoice.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', estimateId);

    // Log the conversion
    await supabase
      .from('communication_logs')
      .insert({
        user_id: estimate.user_id,
        client_id: estimate.client_id,
        job_id: estimate.job_id,
        type: 'system',
        direction: 'internal',
        status: 'completed',
        content: `Estimate ${estimate.estimate_number} converted to invoice ${invoiceNumber}`,
        metadata: {
          estimateId,
          invoiceId: invoice.id,
          action: 'estimate_to_invoice_conversion'
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully converted estimate to invoice ${invoiceNumber}`,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          total: invoice.total,
          status: invoice.status,
          dueDate: invoice.due_date
        },
        estimate: {
          id: estimate.id,
          estimateNumber: estimate.estimate_number,
          status: 'converted'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in convert-estimate-to-invoice:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
