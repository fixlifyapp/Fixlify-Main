import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";

export default function TelnyxDebugPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [telnyxData, setTelnyxData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const checkTelnyxAccount = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke('check-telnyx-account');
      
      if (error) throw error;
      
      if (data.error) {
        setError(data.error);
      } else {
        setTelnyxData(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check Telnyx account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Phone System Debug"
        subtitle="Check phone numbers in your account"
        icon={Phone}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Telnyx Account Status</span>
              <Button
                onClick={checkTelnyxAccount}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Check Account
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-50 text-red-900 rounded-lg">
                {error}
              </div>
            )}

            {telnyxData && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Numbers</p>
                    <p className="text-2xl font-bold">{telnyxData.summary?.total || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{telnyxData.summary?.active || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">With SMS</p>
                    <p className="text-2xl font-bold">{telnyxData.summary?.with_messaging || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">With Voice</p>
                    <p className="text-2xl font-bold">{telnyxData.summary?.with_voice || 0}</p>
                  </div>
                </div>

                {/* Connection Info */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Connection ID</h3>
                  <code className="text-xs bg-secondary p-2 rounded">
                    {telnyxData.connection_id || 'Not set'}
                  </code>
                </div>

                {/* Phone Numbers */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Phone Numbers in Telnyx Account</h3>
                  <div className="space-y-2">
                    {telnyxData.numbers?.map((number: any) => (
                      <div key={number.phone_number} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{formatPhoneForDisplay(number.phone_number)}</span>
                            <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                              {number.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {number.messaging_enabled ? (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                SMS
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                <XCircle className="h-3 w-3 mr-1" />
                                SMS
                              </Badge>
                            )}
                            {number.voice_enabled ? (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Voice
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                <XCircle className="h-3 w-3 mr-1" />
                                Voice
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Created: {new Date(number.created_at).toLocaleDateString()}
                          {number.connection_id && (
                            <span className="ml-3">Connection: {number.connection_id}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messaging Profiles */}
                {telnyxData.messaging_profiles?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Messaging Profiles</h3>
                    <div className="space-y-2">
                      {telnyxData.messaging_profiles.map((profile: any) => (
                        <div key={profile.id} className="p-3 border rounded-lg">
                          <p className="font-medium">{profile.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {profile.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!telnyxData && !error && !isLoading && (
              <p className="text-center text-muted-foreground py-8">
                Click "Check Account" to see your Telnyx phone numbers
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}