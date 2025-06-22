import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

export async function fetchInvoiceData(
  supabaseAdmin: ReturnType<typeof createClient>,
  invoiceId: string
) {
  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .select(`
      *,
      jobs!inner(
        *,
        clients(*)
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    console.error('Invoice lookup error:', invoiceError);
    throw new Error('Invoice not found');
  }

  return invoice;
}

export async function fetchCompanySettings(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: companySettings, error: settingsError } = await supabaseAdmin
    .from('company_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (settingsError) {
    console.error('send-invoice - Error fetching company settings:', settingsError);
  }

  return companySettings;
}

export async function logEmailCommunication(
  supabaseAdmin: ReturnType<typeof createClient>,
  data: {
    invoice_id: string;
    communication_type: string;
    recipient: string;
    subject: string;
    content: string;
    status: string;
    invoice_number: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    portal_link_included: boolean;
    provider_message_id: string;
  }
) {
  try {
    await supabaseAdmin
      .from('invoice_communications')
      .insert(data);
  } catch (logError) {
    console.warn('Failed to log communication:', logError);
  }
} 