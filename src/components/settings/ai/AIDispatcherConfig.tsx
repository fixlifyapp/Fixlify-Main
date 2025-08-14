import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Info, Briefcase, Clock, Phone, MessageSquare, Headphones } from 'lucide-react';
import { AITestDialog } from './AITestDialog';

interface AIDispatcherConfigProps {
  config: any;
  onChange: (config: any) => void;
  phoneNumber: string;
}

export const AIDispatcherConfig = ({ config, onChange, phoneNumber }: AIDispatcherConfigProps) => {
  const [showTestDialog, setShowTestDialog] = useState(false);
  
  const updateConfig = (field: string, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Dispatcher Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-base font-semibold">AI Dispatcher</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI to handle calls and messages automatically
              </p>
            </div>
            <Switch
              checked={config.ai_dispatcher_enabled || false}
              onCheckedChange={(checked) => updateConfig('ai_dispatcher_enabled', checked)}
            />
          </div>

          {config.ai_dispatcher_enabled && (
            <>
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  AI Dispatcher will answer calls, transcribe conversations, and can transfer calls to team members.
                </AlertDescription>
              </Alert>
              
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(true)}
                className="w-full mt-4"
              >
                <Headphones className="h-4 w-4 mr-2" />
                Test AI Assistant (1 min call)
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {config.ai_dispatcher_enabled && (
        <>
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={config.business_name || ''}
                  onChange={(e) => updateConfig('business_name', e.target.value)}
                  placeholder="e.g., Fixlify Repair Shop"
                />
              </div>

              <div>
                <Label>Agent Name</Label>
                <Input
                  value={config.agent_name || ''}
                  onChange={(e) => updateConfig('agent_name', e.target.value)}
                  placeholder="e.g., Sarah (AI Assistant name)"
                />
              </div>

              <div>
                <Label>Business Phone</Label>
                <Input
                  value={phoneNumber}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hours of Operation</Label>
                <Input
                  value={config.hours_of_operation || ''}
                  onChange={(e) => updateConfig('hours_of_operation', e.target.value)}
                  placeholder="e.g., Monday-Friday 9am-6pm, Saturday 10am-4pm"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>After Hours Mode</Label>
                <Switch
                  checked={config.after_hours_enabled || false}
                  onCheckedChange={(checked) => updateConfig('after_hours_enabled', checked)}
                />
              </div>

              {config.after_hours_enabled && (
                <div>
                  <Label>After Hours Message</Label>
                  <Textarea
                    value={config.after_hours_message || ''}
                    onChange={(e) => updateConfig('after_hours_message', e.target.value)}
                    placeholder="We're currently closed. Please leave a message or call back during business hours."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.services_offered || ''}
                onChange={(e) => updateConfig('services_offered', e.target.value)}
                placeholder="Phone repair, Computer repair, Tablet repair, Screen replacement, Battery replacement"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate services with commas
              </p>
            </CardContent>
          </Card>

          {/* Greeting Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Greeting Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Initial Greeting</Label>
                <Textarea
                  value={config.greeting_message || ''}
                  onChange={(e) => updateConfig('greeting_message', e.target.value)}
                  placeholder="Thank you for calling [Business Name]. I'm [Agent Name], how can I help you today?"
                  rows={2}
                />
              </div>

              <div>
                <Label>Voicemail Detection Message</Label>
                <Textarea
                  value={config.voicemail_message || ''}
                  onChange={(e) => updateConfig('voicemail_message', e.target.value)}
                  placeholder="Please leave a message after the tone and we'll get back to you as soon as possible."
                  rows={2}
                />
              </div>

              <div>
                <Label>Call Transfer Message</Label>
                <Textarea
                  value={config.call_transfer_message || ''}
                  onChange={(e) => updateConfig('call_transfer_message', e.target.value)}
                  placeholder="Let me transfer you to a team member who can better assist you. Please hold."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Appointment Booking</Label>
                  <p className="text-xs text-muted-foreground">Allow AI to schedule appointments</p>
                </div>
                <Switch
                  checked={config.enable_appointment_booking || false}
                  onCheckedChange={(checked) => updateConfig('enable_appointment_booking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Status Check</Label>
                  <p className="text-xs text-muted-foreground">Allow checking repair status</p>
                </div>
                <Switch
                  checked={config.enable_status_check || false}
                  onCheckedChange={(checked) => updateConfig('enable_status_check', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Quote Estimates</Label>
                  <p className="text-xs text-muted-foreground">Provide repair cost estimates</p>
                </div>
                <Switch
                  checked={config.enable_quotes || false}
                  onCheckedChange={(checked) => updateConfig('enable_quotes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Call Transfer</Label>
                  <p className="text-xs text-muted-foreground">Transfer to human agents when needed</p>
                </div>
                <Switch
                  checked={config.enable_call_transfer || false}
                  onCheckedChange={(checked) => updateConfig('enable_call_transfer', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Call Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Record Calls</Label>
                  <p className="text-xs text-muted-foreground">Record for quality and training</p>
                </div>
                <Switch
                  checked={config.record_calls || false}
                  onCheckedChange={(checked) => updateConfig('record_calls', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Transcribe Calls</Label>
                  <p className="text-xs text-muted-foreground">Generate text transcripts</p>
                </div>
                <Switch
                  checked={config.transcribe_calls || false}
                  onCheckedChange={(checked) => updateConfig('transcribe_calls', checked)}
                />
              </div>

              <div>
                <Label>Max Call Duration (seconds)</Label>
                <Input
                  type="number"
                  value={config.max_call_duration || 3600}
                  onChange={(e) => updateConfig('max_call_duration', parseInt(e.target.value))}
                  placeholder="3600"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      <AITestDialog 
        open={showTestDialog}
        onClose={() => setShowTestDialog(false)}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};
