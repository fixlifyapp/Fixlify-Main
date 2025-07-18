
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invoice_id, client_email, client_name, client_phone } = await req.json();
    console.log('Sending invoice:', { invoice_id, client_email });

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, jobs(client_id, clients(name, email, phone))')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      throw new Error('Invoice not found');
    }

    const mailgun_api_key = Deno.env.get('MAILGUN_API_KEY');
    const mailgun_domain = Deno.env.get('MAILGUN_DOMAIN');

    if (!mailgun_api_key || !mailgun_domain) {
      throw new Error('Mailgun configuration missing');
    }

    // Create email content
    const emailSubject = `Invoice ${invoice.invoice_number} from Your Service Company`;
    const emailContent = `
      <h2>Invoice ${invoice.invoice_number}</h2>
      <p>Dear ${client_name || invoice.jobs?.clients?.name || 'Valued Customer'},</p>
      <p>Please find your invoice below:</p>
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
        <h3>Invoice Details</h3>
        <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p><strong>Total Amount:</strong> $${invoice.total}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Due Date:</strong> ${invoice.due_date || 'Upon receipt'}</p>
        ${invoice.description ? `<p><strong>Description:</strong> ${invoice.description}</p>` : ''}
      </div>
      <p>Please remit payment at your earliest convenience.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>Your Service Team</p>
    `;

    // Send email via Mailgun
    const formData = new FormData();
    formData.append('from', `Your Service Company <noreply@${mailgun_domain}>`);
    formData.append('to', client_email || invoice.jobs?.clients?.email || '');
    formData.append('subject', emailSubject);
    formData.append('html', emailContent);

    const response = await fetch(`https://api.mailgun.net/v3/${mailgun_domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgun_api_key}`)}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log('Mailgun response:', result);

    if (!response.ok) {
      throw new Error(`Mailgun error: ${result.message || 'Unknown error'}`);
    }

    // Log the communication
    await supabase.from('invoice_communications').insert({
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      client_name: client_name || invoice.jobs?.clients?.name,
      client_email: client_email || invoice.jobs?.clients?.email,
      client_phone: client_phone || invoice.jobs?.clients?.phone,
      communication_type: 'email',
      recipient: client_email || invoice.jobs?.clients?.email || '',
      subject: emailSubject,
      content: emailContent,
      status: 'sent',
      external_id: result.id,
      provider_message_id: result.id,
      portal_link_included: false,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Invoice sent successfully', mailgun_id: result.id }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error sending invoice:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send invoice' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
