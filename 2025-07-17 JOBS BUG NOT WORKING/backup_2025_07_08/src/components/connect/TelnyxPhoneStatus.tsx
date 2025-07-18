import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { PhoneNumberPurchase } from "./PhoneNumberPurchase";

export function TelnyxPhoneStatus() {
  const { user } = useAuth();
  const [showPurchase, setShowPurchase] = useState(false);

  // Get user's phone numbers
  const { data: userNumbers = [], isLoading } = useQuery({
    queryKey: ['user-telnyx-numbers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Check Telnyx configuration
  const hasApiKey = !!import.meta.env.VITE_TELNYX_API_KEY;
  const hasConnectionId = !!import.meta.env.VITE_TELNYX_CONNECTION_ID;
  const isConfigured = hasApiKey && hasConnectionId;

  if (showPurchase) {
    return <PhoneNumberPurchase />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Telnyx Phone Status
          </div>
          {!isLoading && userNumbers.length === 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowPurchase(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Get Phone Number
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Configuration</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {hasApiKey ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">API Key</span>
            </div>
            <div className="flex items-center gap-2">
              {hasConnectionId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Connection ID</span>
            </div>
          </div>
        </div>

        {/* User's Phone Numbers */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Phone Numbers</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : userNumbers.length > 0 ? (
            <div className="space-y-2">
              {userNumbers.map((number) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {formatPhoneForDisplay(number.phone_number)}
                    </span>
                    {number.ai_dispatcher_enabled && (
                      <Badge variant="secondary" className="text-xs">AI Enabled</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {number.area_code}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              No phone numbers assigned
            </div>
          )}
        </div>

        {/* Features Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Features</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {userNumbers.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">SMS (Two-way)</span>
            </div>
            <div className="flex items-center gap-2">
              {userNumbers.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Voice Calls</span>
            </div>
            <div className="flex items-center gap-2">
              {userNumbers.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">AI Dispatcher</span>
            </div>
            <div className="flex items-center gap-2">
              {userNumbers.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">Call Recording</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          {isConfigured && userNumbers.length > 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Telnyx is fully configured and ready!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Setup incomplete</span>
              </div>
              {!isConfigured && (
                <p className="text-sm text-muted-foreground">
                  Please check your environment configuration.
                </p>
              )}
              {userNumbers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Get a phone number to enable SMS and voice features.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}