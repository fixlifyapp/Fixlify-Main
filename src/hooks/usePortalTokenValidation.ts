import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortalTokenData {
  isValid: boolean;
  documentType: 'estimate' | 'invoice' | null;
  documentId: string | null;
  clientInfo?: any;
  companyInfo?: any;
  documentData?: any;
  error?: string;
}

export const usePortalTokenValidation = (token: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<PortalTokenData>({
    isValid: false,
    documentType: null,
    documentId: null
  });

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
      setTokenData({
        isValid: false,
        documentType: null,
        documentId: null,
        error: 'No token provided'
      });
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      
      // First, try to find estimate with this token
      // Note: estimates → jobs → clients (no direct FK to clients)
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select(`
          *,
          jobs(*, clients(*))
        `)
        .eq('portal_access_token', token)
        .maybeSingle();

      if (estimateData && !estimateError) {
        // Load company settings for estimate
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', estimateData.user_id)
          .maybeSingle();

        setTokenData({
          isValid: true,
          documentType: 'estimate',
          documentId: estimateData.id,
          clientInfo: estimateData.jobs?.clients,
          companyInfo: companyData,
          documentData: estimateData
        });
        setLoading(false);
        return;
      }

      // If not found in estimates, try invoices
      // Note: invoices → jobs → clients (no direct FK to clients)
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          jobs(*, clients(*)),
          payments(*)
        `)
        .eq('portal_access_token', token)
        .maybeSingle();

      if (invoiceData && !invoiceError) {
        // Load company settings for invoice
        const { data: companyData } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', invoiceData.user_id)
          .maybeSingle();

        setTokenData({
          isValid: true,
          documentType: 'invoice',
          documentId: invoiceData.id,
          clientInfo: invoiceData.jobs?.clients,
          companyInfo: companyData,
          documentData: invoiceData
        });
        setLoading(false);
        return;
      }

      // Token not found in either table
      setTokenData({
        isValid: false,
        documentType: null,
        documentId: null,
        error: 'Invalid or expired token'
      });

    } catch (error: any) {
      console.error('Error validating portal token:', error);
      setTokenData({
        isValid: false,
        documentType: null,
        documentId: null,
        error: error.message || 'Failed to validate token'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    ...tokenData,
    refetch: validateToken
  };
};