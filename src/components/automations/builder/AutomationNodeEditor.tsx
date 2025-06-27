import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface AutomationNodeEditorProps {
  node: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const AutomationNodeEditor = ({ 
  node, 
  onUpdate, 
  onDelete, 
  onClose 
}: AutomationNodeEditorProps) => {
  const nodeType = node.type;
  const nodeData = node.data;

  const handleLabelChange = (label: string) => {
    onUpdate({ label });
  };

  const handleConfigChange = (key: string, value: any) => {
    onUpdate({
      config: {
        ...nodeData.config,
        [key]: value
      }
    });
  };

  const renderTriggerConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Trigger Type</Label>
        <Select
          value={nodeData.config?.trigger_type || 'event'}
          onValueChange={(value) => handleConfigChange('trigger_type', value)}
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

      {nodeData.config?.trigger_type === 'event' && (
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={nodeData.config?.event_type || 'job_created'}
            onValueChange={(value) => handleConfigChange('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job_created">Job Created</SelectItem>
              <SelectItem value="job_updated">Job Updated</SelectItem>
              <SelectItem value="job_completed">Job Completed</SelectItem>
              <SelectItem value="client_created">Client Created</SelectItem>
              <SelectItem value="invoice_sent">Invoice Sent</SelectItem>
              <SelectItem value="payment_received">Payment Received</SelectItem>
              <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
              <SelectItem value="missed_call">Missed Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {nodeData.config?.trigger_type === 'schedule' && (
        <div className="space-y-2">
          <Label>Schedule</Label>
          <Input
            value={nodeData.config?.schedule || ''}
            onChange={(e) => handleConfigChange('schedule', e.target.value)}
            placeholder="0 9 * * * (Every day at 9 AM)"
          />
        </div>
      )}
    </>
  );

  const renderActionConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select
          value={nodeData.config?.action_type || 'send_sms'}
          onValueChange={(value) => handleConfigChange('action_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_sms">Send SMS</SelectItem>
            <SelectItem value="send_email">Send Email</SelectItem>
            <SelectItem value="create_task">Create Task</SelectItem>
            <SelectItem value="update_job">Update Job</SelectItem>
            <SelectItem value="notify_team">Notify Team</SelectItem>
            <SelectItem value="webhook">Call Webhook</SelectItem>
            <SelectItem value="wait">Wait/Delay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(nodeData.config?.action_type === 'send_sms' || nodeData.config?.action_type === 'send_email') && (
        <>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select
              value={nodeData.config?.recipient || 'client'}
              onValueChange={(value) => handleConfigChange('recipient', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={nodeData.config?.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="Hi {{client_name}}, your appointment is scheduled for {{appointment_date}}..."
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Available variables: {`{{client_name}}, {{job_title}}, {{appointment_date}}, {{total_amount}}`}
            </p>
          </div>
        </>
      )}

      {nodeData.config?.action_type === 'wait' && (
        <div className="space-y-2">
          <Label>Delay (minutes)</Label>
          <Input
            type="number"
            value={nodeData.config?.delay || 0}
            onChange={(e) => handleConfigChange('delay', parseInt(e.target.value))}
            min="0"
          />
        </div>
      )}
    </>
  );

  const renderConditionConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Field</Label>
        <Input
          value={nodeData.config?.field || ''}
          onChange={(e) => handleConfigChange('field', e.target.value)}
          placeholder="job_status"
        />
      </div>

      <div className="space-y-2">
        <Label>Operator</Label>
        <Select
          value={nodeData.config?.operator || 'equals'}
          onValueChange={(value) => handleConfigChange('operator', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="is_empty">Is Empty</SelectItem>
            <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          value={nodeData.config?.value || ''}
          onChange={(e) => handleConfigChange('value', e.target.value)}
          placeholder="completed"
        />
      </div>
    </>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">{nodeType} Node</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={nodeData.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter node label..."
          />
        </div>
      </div>

      {/* Configuration */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {nodeType === 'trigger' && renderTriggerConfig()}
        {nodeType === 'action' && renderActionConfig()}
        {nodeType === 'condition' && renderConditionConfig()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="destructive"
          onClick={onDelete}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}; 