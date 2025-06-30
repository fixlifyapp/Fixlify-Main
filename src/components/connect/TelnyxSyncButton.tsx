
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TelnyxSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncTelnyxNumbers = async () => {
    setIsSyncing(true);
    try {
      console.log('Starting Telnyx sync...');
      
      const { data, error } = await supabase.functions.invoke('telnyx-phone-manager', {
        body: { action: 'sync_telnyx_numbers' }
      });

      console.log('Sync response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('404')) {
          toast.error('Telnyx integration not deployed. Please contact support.');
        } else if (error.message?.includes('TELNYX_API_KEY')) {
          toast.error('Telnyx API key not configured. Please check your settings.');
        } else {
          toast.error(`Sync failed: ${error.message}`);
        }
        return;
      }

      if (data?.success) {
        const { synced, total } = data;
        if (synced > 0) {
          toast.success(`Successfully synced ${synced} new numbers from Telnyx!`, {
            description: `Found ${total} total numbers in your Telnyx account`
          });
        } else {
          toast.success(`All ${total} numbers are already synced`, {
            description: 'No new numbers to import'
          });
        }
        
        // Refresh the page to show new numbers
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorMsg = data?.error || 'Unknown error occurred';
        console.error('Sync failed:', errorMsg);
        toast.error(`Sync failed: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Unexpected sync error:', error);
      toast.error(`Unexpected error: ${error.message || 'Please try again'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={syncTelnyxNumbers}
      disabled={isSyncing}
      className="gap-2"
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Sync from Telnyx
        </>
      )}
    </Button>
  );
}
