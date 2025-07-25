
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConnectionStatus {
  telnyx: boolean;
  database: boolean;
  phoneNumbers: number;
  lastChecked: Date;
}

export const ConnectTestStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    telnyx: false,
    database: false,
    phoneNumbers: 0,
    lastChecked: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const checkConnections = async () => {
    setIsTesting(true);
    try {
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1);

      const databaseStatus = !dbError;

      // Test phone numbers from the existing phone_numbers table
      const { data: phoneNumbers, error: phoneError } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'purchased');

      const telnyxStatus = !phoneError && (phoneNumbers?.length || 0) > 0;
      const phoneCount = phoneNumbers?.length || 0;

      setStatus({
        telnyx: telnyxStatus,
        database: databaseStatus,
        phoneNumbers: phoneCount,
        lastChecked: new Date()
      });

      if (databaseStatus && telnyxStatus) {
        toast.success("All connections are working properly!");
      } else {
        toast.warning("Some connections need attention");
      }
    } catch (error) {
      console.error("Error checking connections:", error);
      toast.error("Failed to check connection status");
    } finally {
      setIsTesting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (isConnected: boolean, label: string) => {
    return (
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={isConnected ? "bg-green-100 text-green-800 border-green-200" : ""}
      >
        {isConnected ? `${label} Connected` : `${label} Disconnected`}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Checking connections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Connection Status
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkConnections}
            disabled={isTesting}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
            Test
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Database Connection */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.database)}
              <div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-500">Supabase connection</p>
              </div>
            </div>
            {getStatusBadge(status.database, "Database")}
          </div>

          {/* Telnyx Connection */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.telnyx)}
              <div>
                <p className="font-medium">Telnyx Service</p>
                <p className="text-sm text-gray-500">
                  {status.phoneNumbers} phone number{status.phoneNumbers !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>
            {getStatusBadge(status.telnyx, "Telnyx")}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Test Call
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Test SMS
              </Button>
            </div>
          </div>

          {/* Last Checked */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
