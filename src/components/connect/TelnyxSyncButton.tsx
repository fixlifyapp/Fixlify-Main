import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TelnyxSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncTelnyxNumbers = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-manager', {
        body: { action: 'sync_telnyx_numbers' }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Synced ${data.synced} new numbers from Telnyx`);
        // Refresh the page or update the numbers list
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to sync numbers');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync numbers from Telnyx');
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
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      Sync from Telnyx
    </Button>
  );
}