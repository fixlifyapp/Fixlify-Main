import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info } from 'lucide-react';

interface AutomationConfig {
  templateId: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: any;
  };
  actions: {
    sms: boolean;
    email: boolean;
    notification: boolean;
  };
  messageTemplates: {
    sms?: string;
    email?: {
      subject: string;
      body: string;
    };
  };
  enabled: boolean;
}

interface QuickSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automationConfig: AutomationConfig | null;
  onConfigChange: (config: AutomationConfig) => void;
  onSave: () => void;
}

export const QuickSetupDialog: React.FC<QuickSetupDialogProps> = ({
  open,
  onOpenChange,
  automationConfig,
  onConfigChange,
  onSave
}) => {
  if (!automationConfig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Configure Automation</DialogTitle>
          <DialogDescription>
            Set up your automation with custom messages and triggers
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Automation Name */}
            <div className="space-y-2">
              <Label htmlFor="automation-name">Automation Name</Label>
              <Input
                id="automation-name"
                value={automationConfig.name}
                onChange={(e) => onConfigChange({
                  ...automationConfig,
                  name: e.target.value
                })}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={automationConfig.description}
                onChange={(e) => onConfigChange({
                  ...automationConfig,
                  description: e.target.value
                })}
                rows={2}
                className="w-full resize-none"
              />
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Label>Actions</Label>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sms"
                    checked={automationConfig.actions.sms}
                    onCheckedChange={(checked) => onConfigChange({
                      ...automationConfig,
                      actions: { ...automationConfig.actions, sms: !!checked }
                    })}
                  />
                  <Label htmlFor="sms" className="cursor-pointer font-normal">
                    Send SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email"
                    checked={automationConfig.actions.email}
                    onCheckedChange={(checked) => onConfigChange({
                      ...automationConfig,
                      actions: { ...automationConfig.actions, email: !!checked }
                    })}
                  />
                  <Label htmlFor="email" className="cursor-pointer font-normal">
                    Send Email
                  </Label>
                </div>
              </div>
            </div>

            {/* SMS Message */}
            {automationConfig.actions.sms && (
              <div className="space-y-2">
                <Label htmlFor="sms-message">SMS Message</Label>
                <Textarea
                  id="sms-message"
                  value={automationConfig.messageTemplates.sms}
                  onChange={(e) => onConfigChange({
                    ...automationConfig,
                    messageTemplates: {
                      ...automationConfig.messageTemplates,
                      sms: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full resize-none"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <p>
                    Available variables: {{client_name}}, {{appointment_time}}, {{service_type}}
                  </p>
                </div>
              </div>
            )}

            {/* Email Configuration */}
            {automationConfig.actions.email && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={automationConfig.messageTemplates.email?.subject}
                    onChange={(e) => onConfigChange({
                      ...automationConfig,
                      messageTemplates: {
                        ...automationConfig.messageTemplates,
                        email: {
                          ...automationConfig.messageTemplates.email!,
                          subject: e.target.value
                        }
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    value={automationConfig.messageTemplates.email?.body}
                    onChange={(e) => onConfigChange({
                      ...automationConfig,
                      messageTemplates: {
                        ...automationConfig.messageTemplates,
                        email: {
                          ...automationConfig.messageTemplates.email!,
                          body: e.target.value
                        }
                      }
                    })}
                    rows={6}
                    className="w-full resize-none"
                  />
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <p>
                      Available variables: {{client_name}}, {{appointment_date}}, {{appointment_time}}, 
                      {{service_type}}, {{company_name}}, {{company_phone}}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Enable Automation */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="enabled" className="text-base cursor-pointer">
                  Enable automation immediately
                </Label>
                <p className="text-sm text-muted-foreground">
                  Start running this automation as soon as it's created
                </p>
              </div>
              <Switch
                id="enabled"
                checked={automationConfig.enabled}
                onCheckedChange={(checked) => onConfigChange({
                  ...automationConfig,
                  enabled: checked
                })}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <GradientButton 
              onClick={onSave}
              className="w-full sm:w-auto"
            >
              Create Automation
            </GradientButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};