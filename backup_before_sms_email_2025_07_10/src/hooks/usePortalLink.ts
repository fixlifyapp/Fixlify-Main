
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePortalLink = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePortalLink = async (
    clientId: string,
    permissions = {
      view_estimates: true,
      view_invoices: true,
      make_payments: false
    },
    hoursValid = 72
  ): Promise<string | null> => {
    try {
      setIsGenerating(true);
      console.log('🔄 Generating portal access token for client:', clientId);
      
      const { data: portalToken, error: portalError } = await supabase
        .rpc('generate_portal_access', {
          p_client_id: clientId,
          p_permissions: permissions,
          p_hours_valid: hoursValid,
          p_domain_restriction: window.location.hostname
        });

      if (portalError || !portalToken) {
        console.error('❌ Failed to generate portal token:', portalError);
        throw new Error('Failed to generate portal access token');
      }

      console.log('✅ Portal access token generated:', portalToken);

      const portalLink = `${window.location.origin}/portal/${portalToken}`;
      console.log('🔗 Portal link:', portalLink);

      return portalLink;
    } catch (error: any) {
      console.error('Error generating portal link:', error);
      toast.error('Failed to generate portal link');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPortalLink = async (clientId: string) => {
    const link = await generatePortalLink(clientId);
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        toast.success("Portal link copied to clipboard!");
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        toast.error("Failed to copy link to clipboard");
      }
    }
  };

  return {
    generatePortalLink,
    copyPortalLink,
    isGenerating
  };
};
