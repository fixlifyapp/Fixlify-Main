
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInvoiceActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendInvoice = async (invoiceId: string, method: 'email' | 'sms', recipient: string) => {
    setIsLoading(true);
    
    try {
      // Validate input
      if (!invoiceId || !method || !recipient) {
        throw new Error('Missing required fields');
      }

      if (method === 'email' && !recipient.includes('@')) {
        throw new Error('Invalid email address');
      }

      if (method === 'sms' && !recipient.match(/^\+?[\d\s\-\(\)]+$/)) {
        throw new Error('Invalid phone number');
      }

      console.log('Sending invoice:', { invoiceId, method, recipient });

      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { invoiceId, method, recipient }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(error.message || 'Failed to send invoice');
      }

      if (!data?.success) {
        console.error('Function returned error:', data);
        throw new Error(data?.error || data?.details || 'Failed to send invoice');
      }

      toast.success(`Invoice sent via ${method} successfully!`);
      return { success: true };

    } catch (error) {
      console.error('Error sending invoice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invoice';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendInvoice,
    isLoading
  };
};
