
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEstimateActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendEstimate = async (estimateId: string, method: 'email' | 'sms', recipient: string) => {
    setIsLoading(true);
    
    try {
      // Validate input
      if (!estimateId || !method || !recipient) {
        throw new Error('Missing required fields');
      }

      if (method === 'email' && !recipient.includes('@')) {
        throw new Error('Invalid email address');
      }

      if (method === 'sms' && !recipient.match(/^\+?[\d\s\-\(\)]+$/)) {
        throw new Error('Invalid phone number');
      }

      console.log('Sending estimate:', { estimateId, method, recipient });

      const { data, error } = await supabase.functions.invoke('send-estimate', {
        body: { estimateId, method, recipient }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Failed to send estimate');
      }

      if (!data?.success) {
        console.error('Function returned error:', data);
        throw new Error(data?.error || data?.details || 'Failed to send estimate');
      }

      toast.success(`Estimate sent via ${method} successfully!`);
      return { success: true };

    } catch (error) {
      console.error('Error sending estimate:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send estimate';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEstimate,
    isLoading
  };
};
