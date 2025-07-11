
import { useGlobalRealtime } from "@/contexts/GlobalRealtimeProvider";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export const RealtimeStatus = () => {
  const { isConnected } = useGlobalRealtime();

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );
};
