
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Trash2, Save, MessageSquare, Mail, Phone, Zap, Clock } from 'lucide-react';
import { Node } from '@xyflow/react';

interface AutomationNodeEditorProps {
  node: Node;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const AutomationNodeEditor = ({ node, onUpdate, onDelete, onClose }: AutomationNodeEditorProps) => {
  const [config, setConfig] = useState(node.data.config || {});
  const [label, setLabel] = useState(node.data.label || '');

  const handleSave = () => {
    onUpdate({
      label,
      config
    });
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="trigger_type">Trigger Type</Label>
        <Select 
          value={config.trigger_type || 'event'} 
          onValueChange={(value) => updateConfig('trigger_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.trigger_type === 'event' && (
        <div>
          <Label htmlFor="event_type">Event Type</Label>
          <Select 
            value={config.event_type || 'job_created'} 
            onValueChange={(value) => updateConfig('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job_created">Job Created</SelectItem>
              <SelectItem value="job_completed">Job Completed</SelectItem>
              <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
              <SelectItem value="payment_received">Payment Received</SelectItem>
              <SelectItem value="missed_call">Missed Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {config.trigger_type === 'schedule' && (
        <div>
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            value={config.schedule || ''}
            onChange={(e) => updateConfig('schedule', e.target.value)}
            placeholder="0 9 * * 1-5 (Every weekday at 9 AM)"
          />
        </div>
      )}
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="action_type">Action Type</Label>
        <Select 
          value={config.action_type || 'send_sms'} 
          onValueChange={(value) => updateConfig('action_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_sms">Send SMS</SelectItem>
            <SelectItem value="send_email">Send Email</SelectItem>
            <SelectItem value="make_call">Make Call</SelectItem>
            <SelectItem value="wait">Wait/Delay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(config.action_type === 'send_sms' || config.action_type === 'send_email') && (
        <>
          {config.action_type === 'send_email' && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
                placeholder="Email subject"
              />
            </div>
          )}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={config.message || ''}
              onChange={(e) => updateConfig('message', e.target.value)}
              placeholder="Your message here... Use {{client_name}} for variables"
              rows={4}
            />
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Available variables:</p>
              <div className="flex flex-wrap gap-1">
                {['client_name', 'job_title', 'scheduled_date', 'total_amount'].map(variable => (
                  <Badge 
                    key={variable} 
                    variant="secondary" 
                    className="text-xs cursor-pointer"
                    onClick={() => updateConfig('message', (config.message || '') + `{{${variable}}}`)}
                  >
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {config.action_type === 'wait' && (
        <div>
          <Label htmlFor="delay">Delay (minutes)</Label>
          <Input
            id="delay"
            type="number"
            value={config.delay || 0}
            onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 0)}
            placeholder="Delay in minutes"
          />
        </div>
      )}

      <div>
        <Label htmlFor="delay">Execution Delay (minutes)</Label>
        <Input
          id="delay"
          type="number"
          value={config.delay || 0}
          onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="field">Field</Label>
        <Select 
          value={config.field || 'job_status'} 
          onValueChange={(value) => updateConfig('field', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="job_status">Job Status</SelectItem>
            <SelectItem value="payment_status">Payment Status</SelectItem>
            <SelectItem value="client_type">Client Type</SelectItem>
            <SelectItem value="total_amount">Total Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="operator">Operator</Label>
        <Select 
          value={config.operator || 'equals'} 
          onValueChange={(value) => updateConfig('operator', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Value</Label>
        <Input
          id="value"
          value={config.value || ''}
          onChange={(e) => updateConfig('value', e.target.value)}
          placeholder="Comparison value"
        />
      </div>
    </div>
  );

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger':
        return Zap;
      case 'action':
        return config.action_type === 'send_email' ? Mail : 
               config.action_type === 'make_call' ? Phone : MessageSquare;
      case 'condition':
        return Clock;
      default:
        return Zap;
    }
  };

  const Icon = getNodeIcon();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Edit {node.type}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <Label htmlFor="label">Node Label</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Node label"
          />
        </div>

        <Separator />

        {node.type === 'trigger' && renderTriggerConfig()}
        {node.type === 'action' && renderActionConfig()}
        {node.type === 'condition' && renderConditionConfig()}
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="destructive" onClick={onDelete} className="w-full">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};
