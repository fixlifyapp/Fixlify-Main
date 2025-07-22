
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, Settings, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  is_active: boolean;
  created_at: string;
  last_run_at?: string;
  run_count: number;
}

export const CommunicationAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast.error('Failed to load automations');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => 
        prev.map(automation => 
          automation.id === id 
            ? { ...automation, is_active: isActive }
            : automation
        )
      );

      toast.success(`Automation ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case 'job_created': return 'Job Created';
      case 'job_completed': return 'Job Completed';
      case 'estimate_sent': return 'Estimate Sent';
      case 'invoice_sent': return 'Invoice Sent';
      case 'payment_received': return 'Payment Received';
      case 'scheduled_time': return 'Scheduled Time';
      default: return triggerType;
    }
  };

  const getActionCount = (actions: any[]) => {
    return actions?.length || 0;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading automations...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Communication Automations
            </CardTitle>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Automation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No automations created yet</p>
                <p className="text-sm">Create your first automation to streamline communication</p>
              </div>
            ) : (
              automations.map((automation) => (
                <div
                  key={automation.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{automation.name}</h3>
                        <Badge variant={automation.is_active ? 'default' : 'secondary'}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {getTriggerLabel(automation.trigger_type)}
                        </Badge>
                      </div>
                      
                      {automation.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {automation.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{getActionCount(automation.actions)} actions</span>
                        <span>Run {automation.run_count} times</span>
                        {automation.last_run_at && (
                          <span>
                            Last run: {new Date(automation.last_run_at).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Created: {new Date(automation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                      />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
