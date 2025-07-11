import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Phone, Settings, BarChart3, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';

interface PhoneNumber {
  id: string;
  phone_number: string;
  ai_dispatcher_enabled?: boolean;
  ai_dispatcher_config?: any;
  last_call_routed_to?: string;
  call_routing_stats?: any;
}

interface PhoneConfigDialogProps {
  phoneNumber: PhoneNumber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

interface RoutingStats {
  total_calls: number;
  ai_calls: number;
  basic_calls: number;
  recent_logs: any[];
}

export const PhoneConfigDialog = ({ phoneNumber, open, onOpenChange, onSave }: PhoneConfigDialogProps) => {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<RoutingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      setAiEnabled(phoneNumber.ai_dispatcher_enabled || false);
      if (open) {
        loadStats();
      }
    }
  }, [phoneNumber, open]);

  const loadStats = async () => {
    if (!phoneNumber) return;
    
    setLoadingStats(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-ai-dispatcher', {
        body: {
          action: 'get_stats',
          phoneNumberId: phoneNumber.phone_number
        }
      });

      if (error) throw error;
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleToggleAI = async (enabled: boolean) => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-ai-dispatcher', {
        body: {
          action: 'toggle',
          phoneNumberId: phoneNumber.id,
          enabled
        }
      });

      if (error) throw error;

      setAiEnabled(enabled);
      toast.success(`AI Assistant ${enabled ? 'enabled' : 'disabled'} for ${formatPhoneForDisplay(phoneNumber.phone_number)}`);
      
      if (onSave) onSave();
    } catch (error: any) {
      console.error('Error toggling AI:', error);
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} AI Assistant: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRoutingDecision = (decision: string) => {
    return decision === 'ai_dispatcher' ? 'AI Assistant' : 'Basic Telephony';
  };

  const getRoutingBadgeColor = (decision: string) => {
    return decision === 'ai_dispatcher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (!phoneNumber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {formatPhoneForDisplay(phoneNumber.phone_number)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Dispatcher Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable AI Assistant</h4>
                  <p className="text-sm text-muted-foreground">
                    When enabled, calls will be handled by your AI Assistant with dynamic prompts and business data integration.
                  </p>
                </div>
                <Switch
                  checked={aiEnabled}
                  onCheckedChange={handleToggleAI}
                  disabled={isLoading}
                />
              </div>

              <div className="text-sm">
                <Badge variant="outline" className={aiEnabled ? 'text-green-600' : 'text-gray-600'}>
                  {aiEnabled ? (
                    <>
                      <Bot className="h-3 w-3 mr-1" />
                      AI Assistant Active
                    </>
                  ) : (
                    <>
                      <Phone className="h-3 w-3 mr-1" />
                      Basic Telephony Active
                    </>
                  )}
                </Badge>
              </div>

              {phoneNumber.last_call_routed_to && (
                <div className="text-sm text-muted-foreground">
                  Last call routed to: <span className="font-medium">{formatRoutingDecision(phoneNumber.last_call_routed_to)}</span>
                </div>
              )}

              {aiEnabled && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-1">✨ AI Assistant Features</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Dynamic prompts with business data</li>
                    <li>• Appointment scheduling capabilities</li>
                    <li>• Service pricing information</li>
                    <li>• Emergency detection and routing</li>
                    <li>• Professional voice synthesis</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Routing Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Call Routing Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading statistics...
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.total_calls}</div>
                      <div className="text-sm text-muted-foreground">Total Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.ai_calls}</div>
                      <div className="text-sm text-muted-foreground">AI Assistant</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.basic_calls}</div>
                      <div className="text-sm text-muted-foreground">Basic Telephony</div>
                    </div>
                  </div>

                  {stats.recent_logs && stats.recent_logs.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Call Routing
                      </h5>
                      <div className="space-y-2">
                        {stats.recent_logs.slice(0, 5).map((log: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{log.caller_phone}</span>
                              <span className="text-muted-foreground ml-2">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <Badge className={getRoutingBadgeColor(log.routing_decision)}>
                              {formatRoutingDecision(log.routing_decision)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No call statistics available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Info */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Router Webhook:</span> 
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  /functions/v1/telnyx-webhook-router
                </span>
              </div>
              <div>
                <span className="font-medium">Current Mode:</span> 
                <span className="ml-2">
                  {aiEnabled ? 'AI Assistant (Telnyx AI)' : 'Basic Telephony'}
                </span>
              </div>
              <div className="text-muted-foreground">
                The router automatically directs calls to the appropriate handler. AI Assistant mode uses Telnyx AI with dynamic business data integration.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={loadStats} variant="outline" disabled={loadingStats}>
            Refresh Stats
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
