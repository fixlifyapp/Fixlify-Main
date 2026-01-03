import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

export async function generatePortalLink(
  supabaseAdmin: ReturnType<typeof createClient>,
  clientEmail: string,
  invoiceId: string
): Promise<string> {
  try {
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
      p_email: clientEmail
    });

    if (!tokenError && tokenData) {
      // Use fixlify.app as default (hub.fixlify.app was not properly configured)
      const portalLink = `https://fixlify.app/portal/login?token=${tokenData}&redirect=/portal/invoices?id=${invoiceId}`;
      console.log('Portal link generated for client portal');
      return portalLink;
    }
    
    throw new Error(tokenError?.message || 'Failed to generate portal token');
  } catch (error) {
    console.warn('Failed to generate portal login token:', error);
    return '';
  }
} 