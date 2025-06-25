import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Workflow, 
  Plus, 
  Trash2, 
  Settings,
  Clock,
  Sparkles,
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Calendar,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";

interface AutomationBuilderProps {
  initialData?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const triggerTypes = [
  { value: 'job_created', label: 'Job Created', icon: FileText },
  { value: 'job_scheduled', label: 'Job Scheduled', icon: Calendar },
  { value: 'job_completed', label: 'Job Completed', icon: CheckCircle },
  { value: 'job_cancelled', label: 'Job Cancelled', icon: X },
  { value: 'job_status_changed', label: 'Job Status Changed', icon: AlertCircle },
  { value: 'estimate_created', label: 'Estimate Created', icon: FileText },
  { value: 'estimate_sent', label: 'Estimate Sent', icon: Mail },
  { value: 'estimate_approved', label: 'Estimate Approved', icon: CheckCircle },
  { value: 'invoice_created', label: 'Invoice Created', icon: DollarSign },
  { value: 'invoice_sent', label: 'Invoice Sent', icon: Mail },
  { value: 'invoice_paid', label: 'Invoice Paid', icon: DollarSign },
  { value: 'invoice_overdue', label: 'Invoice Overdue', icon: AlertCircle },
  { value: 'client_created', label: 'Client Created', icon: Users },
  { value: 'appointment_reminder', label: 'Appointment Reminder', icon: Bell },
  { value: 'payment_received', label: 'Payment Received', icon: DollarSign },
  { value: 'time_based', label: 'Time Based', icon: Clock }
];

const actionTypes = [
  { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_notification', label: 'Send Notification', icon: Bell },
  { value: 'create_task', label: 'Create Task', icon: FileText },
  { value: 'update_job_status', label: 'Update Job Status', icon: AlertCircle },
  { value: 'assign_team_member', label: 'Assign Team Member', icon: Users },
  { value: 'webhook', label: 'Call Webhook', icon: Workflow }
];

const categories = [
  { value: 'appointments', label: 'Appointments' },
  { value: 'invoicing_payments', label: 'Invoicing & Payments' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'team_management', label: 'Team Management' },
  { value: 'marketing_growth', label: 'Marketing & Growth' },
  { value: 'emergency_urgent', label: 'Emergency & Urgent' }
];

export const FixlifyAutomationBuilder = ({ initialData, onClose, onSuccess }: AutomationBuilderProps) => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  
  const [automation, setAutomation] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'customer_service',
    trigger_type: initialData?.trigger_type || 'job_created',
    trigger_config: initialData?.trigger_config || {},
    actions: initialData?.actions || [{
      type: 'send_sms',
      config: {
        message_template: '',
        recipient: 'client'
      },
      delay_minutes: 0
    }],
    conditions: initialData?.conditions || []
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!organization?.id) throw new Error('No organization');

      // Create automation
      const { data: newAutomation, error: automationError } = await supabase
        .from('automations')
        .insert({
          organization_id: organization.id,
          name: data.name,
          description: data.description,
          category: data.category,
          is_active: true
        })
        .select()
        .single();

      if (automationError) throw automationError;

      // Create trigger
      const { error: triggerError } = await supabase
        .from('automation_triggers')
        .insert({
          automation_id: newAutomation.id,
          trigger_type: data.trigger_type,
          trigger_config: data.trigger_config,
          conditions: data.conditions
        });

      if (triggerError) throw triggerError;

      // Create actions
      for (let i = 0; i < data.actions.length; i++) {
        const action = data.actions[i];
        const { error: actionError } = await supabase
          .from('automation_actions')
          .insert({
            automation_id: newAutomation.id,
            action_type: action.type,
            action_config: action.config,
            delay_minutes: action.delay_minutes || 0,
            order_index: i
          });

        if (actionError) throw actionError;
      }

      // Create conditions
      for (const condition of data.conditions) {
        const { error: conditionError } = await supabase
          .from('automation_conditions')
          .insert({
            automation_id: newAutomation.id,
            field_name: condition.field,
            operator: condition.operator,
            value: condition.value
          });

        if (conditionError) throw conditionError;
      }

      return newAutomation;
    },
    onSuccess: () => {
      toast.success('Automation created successfully!');
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    }
  });

  const addAction = () => {
    setAutomation({
      ...automation,
      actions: [...automation.actions, {
        type: 'send_sms',
        config: { message_template: '', recipient: 'client' },
        delay_minutes: 0
      }]
    });
  };

  const removeAction = (index: number) => {
    const newActions = [...automation.actions];
    newActions.splice(index, 1);
    setAutomation({ ...automation, actions: newActions });
  };

  const addCondition = () => {
    setAutomation({
      ...automation,
      conditions: [...automation.conditions, {
        field: 'status',
        operator: 'equals',
        value: ''
      }]
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = [...automation.conditions];
    newConditions.splice(index, 1);
    setAutomation({ ...automation, conditions: newConditions });
  };

  const handleSave = () => {
    if (!automation.name) {
      toast.error('Please enter an automation name');
      return;
    }

    createAutomationMutation.mutate(automation);
  };

  const TriggerIcon = triggerTypes.find(t => t.value === automation.trigger_type)?.icon || Workflow;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <Label>Automation Name</Label>
          <Input
            value={automation.name}
            onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
            placeholder="Enter automation name..."
            className="text-lg font-semibold"
          />
        </div>
        
        <div>
          <Label>Description</Label>
          <Textarea
            value={automation.description}
            onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
            placeholder="Describe what this automation does..."
            className="resize-none"
          />
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={automation.category}
            onValueChange={(value) => setAutomation({ ...automation, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trigger Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9333EA] to-[#C026D3] flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold">When this happens...</h3>
          </div>

          <div className="space-y-4">
            <Select
              value={automation.trigger_type}
              onValueChange={(value) => setAutomation({ ...automation, trigger_type: value })}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <TriggerIcon className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map(trigger => {
                  const Icon = trigger.icon;
                  return (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {trigger.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Conditions */}
            {automation.conditions.length > 0 && (
              <div className="space-y-2">
                <Label>Conditions</Label>
                {automation.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={condition.field}
                      onChange={(e) => {
                        const newConditions = [...automation.conditions];
                        newConditions[index].field = e.target.value;
                        setAutomation({ ...automation, conditions: newConditions });
                      }}
                      placeholder="Field name..."
                      className="flex-1"
                    />
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => {
                        const newConditions = [...automation.conditions];
                        newConditions[index].operator = value;
                        setAutomation({ ...automation, conditions: newConditions });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={condition.value}
                      onChange={(e) => {
                        const newConditions = [...automation.conditions];
                        newConditions[index].value = e.target.value;
                        setAutomation({ ...automation, conditions: newConditions });
                      }}
                      placeholder="Value..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={addCondition}
              className="text-[#9333EA]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9333EA] to-[#C026D3] flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold">Do this...</h3>
          </div>

          <div className="space-y-4">
            {automation.actions.map((action, index) => {
              const ActionIcon = actionTypes.find(a => a.value === action.type)?.icon || Workflow;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Select
                      value={action.type}
                      onValueChange={(value) => {
                        const newActions = [...automation.actions];
                        newActions[index].type = value;
                        setAutomation({ ...automation, actions: newActions });
                      }}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map(actionType => {
                          const Icon = actionType.icon;
                          return (
                            <SelectItem key={actionType.value} value={actionType.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {actionType.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Action-specific configuration */}
                  {(action.type === 'send_sms' || action.type === 'send_email') && (
                    <div className="space-y-2">
                      <Label>Message Template</Label>
                      <Textarea
                        value={action.config.message_template || ''}
                        onChange={(e) => {
                          const newActions = [...automation.actions];
                          newActions[index].config.message_template = e.target.value;
                          setAutomation({ ...automation, actions: newActions });
                        }}
                        placeholder="Enter your message template..."
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-gray-500">
                        Available variables: {'{client_name}'}, {'{job_id}'}, {'{amount}'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Label>Delay</Label>
                    <Input
                      type="number"
                      value={action.delay_minutes}
                      onChange={(e) => {
                        const newActions = [...automation.actions];
                        newActions[index].delay_minutes = parseInt(e.target.value) || 0;
                        setAutomation({ ...automation, actions: newActions });
                      }}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">minutes</span>
                  </div>
                </motion.div>
              );
            })}

            <Button
              variant="outline"
              onClick={addAction}
              className="w-full text-[#9333EA]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={createAutomationMutation.isPending}
          className="bg-gradient-to-r from-[#9333EA] to-[#C026D3] hover:from-[#7C3AED] hover:to-[#A855F7] text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {createAutomationMutation.isPending ? 'Creating...' : 'Create Automation'}
        </Button>
      </div>
    </div>
  );
}; 