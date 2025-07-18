
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface CommunicationAutomation {
  id: string;
  name: string;
  trigger_type: 'estimate_created' | 'invoice_created' | 'job_completed' | 'custom';
  template_id: string;
  is_active: boolean;
  delay_minutes: number;
  trigger_conditions: any;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: any;
  category: string;
  content_template: string;
  is_active: boolean;
  organization_id: string;
  preview_data: any;
  created_at: string;
  updated_at: string;
}

export const CommunicationAutomations = () => {
  const [automations, setAutomations] = useState<CommunicationAutomation[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [automationsResult, templatesResult] = await Promise.all([
        supabase.from('communication_automations').select('*').order('created_at', { ascending: false }),
        supabase.from('communication_templates').select('*').order('name')
      ]);

      if (automationsResult.error) throw automationsResult.error;
      if (templatesResult.error) throw templatesResult.error;

      // Transform automations data to match interface
      const transformedAutomations = (automationsResult.data || []).map(automation => ({
        ...automation,
        trigger_type: automation.trigger_type as 'estimate_created' | 'invoice_created' | 'job_completed' | 'custom'
      }));

      // Transform templates data to match interface
      const transformedTemplates = (templatesResult.data || []).map(template => ({
        ...template,
        category: template.type || 'general',
        content_template: template.content,
        is_active: true,
        variables: Array.isArray(template.variables) ? template.variables : []
      }));

      setAutomations(transformedAutomations);
      setTemplates(transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load communication automations');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('communication_automations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setAutomations(prev => 
        prev.map(automation => 
          automation.id === id ? { ...automation, is_active: isActive } : automation
        )
      );

      toast.success(`Automation ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'estimate_created':
        return 'Estimate Created';
      case 'invoice_created':
        return 'Invoice Created';
      case 'job_completed':
        return 'Job Completed';
      default:
        return 'Custom';
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'estimate_created':
        return 'bg-blue-500';
      case 'invoice_created':
        return 'bg-green-500';
      case 'job_completed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading communication automations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Automations</h2>
          <p className="text-muted-foreground">
            Automatically send messages based on business events
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </div>

      <div className="grid gap-4">
        {automations.map((automation) => {
          const template = templates.find(t => t.id === automation.template_id);
          
          return (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTriggerColor(automation.trigger_type)}>
                        {getTriggerLabel(automation.trigger_type)}
                      </Badge>
                      {automation.delay_minutes > 0 && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {automation.delay_minutes}m delay
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={automation.is_active}
                    onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template && (
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Template: <strong>{template.name}</strong>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(automation.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {automations.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No automations configured</h3>
              <p className="text-muted-foreground mb-4">
                Set up automated messages to engage with your clients
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Automation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunicationAutomations;
