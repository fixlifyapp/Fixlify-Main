import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { automationTemplates, createAutomationFromTemplate, initializeDefaultAutomations } from '@/services/automation-templates';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

export const AutomationInitializer: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userAutomations, setUserAutomations] = useState<any[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState(automationTemplates);

  useEffect(() => {
    if (user) {
      loadUserAutomations();
    }
  }, [user]);

  const loadUserAutomations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading user automations:', error);
      return;
    }

    setUserAutomations(data || []);
  };

  const handleInitializeDefaults = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await initializeDefaultAutomations(user.id);
      await loadUserAutomations();
      toast.success('Default automations created successfully!');
    } catch (error) {
      console.error('Error initializing automations:', error);
      toast.error('Failed to initialize automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const automationId = await createAutomationFromTemplate(templateId, undefined, user.id);
      if (automationId) {
        await loadUserAutomations();
        toast.success('Automation created successfully!');
      } else {
        toast.error('Failed to create automation');
      }
    } catch (error) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateStatus = (templateId: string) => {
    const hasAutomation = userAutomations.some(automation => 
      automation.name.toLowerCase().includes(templateId.replace(/-/g, ' ')) ||
      automation.trigger_type === automationTemplates.find(t => t.id === templateId)?.trigger_type
    );
    return hasAutomation;
  };

  const getStatusBadge = (templateId: string) => {
    const hasAutomation = getTemplateStatus(templateId);
    return hasAutomation ? (
      <Badge className="bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline">
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Set Up
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Quick Setup */}
      {userAutomations.length === 0 && (
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get started quickly with essential automations for job status changes.
            </p>
            <Button 
              onClick={handleInitializeDefaults}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Set Up Essential Automations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Templates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose from pre-built automation templates to save time.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  {getStatusBadge(template.id)}
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  
                  {!getTemplateStatus(template.id) && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCreateFromTemplate(template.id)}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Use Template
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Automations Status */}
      {userAutomations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userAutomations.map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{automation.name}</h4>
                    <p className="text-sm text-muted-foreground">{automation.description}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};