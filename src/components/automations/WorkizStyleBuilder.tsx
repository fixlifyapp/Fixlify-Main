import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowSegment {
  id: string;
  type: 'text' | 'dropdown';
  value: string;
  options?: Array<{ value: string; label: string; children?: Array<{ value: string; label: string }> }>;
  selectedChild?: string;
}

interface WorkflowRule {
  id: string;
  name: string;
  segments: WorkflowSegment[];
}

interface WorkizStyleBuilderProps {
  onSave: (rules: WorkflowRule[]) => void;
}

const TRIGGER_OPTIONS = [
  {
    value: 'job',
    label: 'a job',
    children: [
      { value: 'is_created', label: 'is created' },
      { value: 'has_a_status', label: 'has a status' },
    ]
  },
  {
    value: 'lead',
    label: 'a lead',
    children: [
      { value: 'is_created', label: 'is created' },
      { value: 'has_a_status', label: 'has a status' },
    ]
  },
  {
    value: 'estimate',
    label: 'an estimate',
    children: [
      { value: 'is_created', label: 'is created' },
      { value: 'is_sent', label: 'is sent' },
      { value: 'is_approved', label: 'is approved' },
      { value: 'is_declined', label: 'is declined' },
      { value: 'is_won', label: 'is won' },
    ]
  },
  {
    value: 'invoice',
    label: 'an invoice',
    children: [
      { value: 'is_created', label: 'is created' },
      { value: 'is_sent', label: 'is sent' },
      { value: 'is_due', label: 'is due' },
      { value: 'is_past_due', label: 'is past due' },
      { value: 'is_paid_in_full', label: 'is paid in full' },
    ]
  },
  {
    value: 'task',
    label: 'a task',
    children: [
      { value: 'is_created', label: 'is created' },
      { value: 'is_marked_as_done', label: 'is marked as done' },
    ]
  },
];

const ACTION_OPTIONS = [
  {
    value: 'send',
    label: 'send',
    children: [
      { value: 'email', label: 'an email' },
      { value: 'sms', label: 'a text message' },
      { value: 'notification', label: 'a notification' },
    ]
  },
  {
    value: 'create',
    label: 'create',
    children: [
      { value: 'task', label: 'a task' },
      { value: 'reminder', label: 'a reminder' },
      { value: 'follow_up', label: 'a follow-up' },
    ]
  },
  {
    value: 'update',
    label: 'update',
    children: [
      { value: 'job_status', label: 'job status' },
      { value: 'client_info', label: 'client information' },
      { value: 'schedule', label: 'schedule' },
    ]
  },
];

const RECIPIENT_OPTIONS = [
  { value: 'client', label: 'client' },
  { value: 'team_member', label: 'team member' },
  { value: 'technician', label: 'technician' },
  { value: 'manager', label: 'manager' },
];

const TIMING_OPTIONS = [
  { value: 'immediately', label: 'immediately' },
  { value: '15_minutes_before', label: '15 minutes before' },
  { value: '1_hour_before', label: '1 hour before' },
  { value: '1_day_before', label: '1 day before' },
  { value: '1_day_ahead_of', label: '1 day ahead of' },
  { value: '2_days_before', label: '2 days before' },
  { value: '1_week_before', label: '1 week before' },
];

const REFERENCE_OPTIONS = [
  { value: 'job_schedule_date', label: 'the job schedule date' },
  { value: 'estimate_date', label: 'the estimate date' },
  { value: 'invoice_due_date', label: 'the invoice due date' },
  { value: 'task_due_date', label: 'the task due date' },
];

export const WorkizStyleBuilder: React.FC<WorkizStyleBuilderProps> = ({ onSave }) => {
  const [rules, setRules] = useState<WorkflowRule[]>([]);

  const createNewRule = () => {
    const newRule: WorkflowRule = {
      id: `rule-${Date.now()}`,
      name: 'New Workflow',
      segments: [
        { id: 'when', type: 'text', value: 'When' },
        { 
          id: 'trigger', 
          type: 'dropdown', 
          value: 'a job', 
          options: TRIGGER_OPTIONS,
          selectedChild: 'is_created'
        },
      ]
    };
    setRules([...rules, newRule]);
  };

  const updateSegment = (ruleId: string, segmentId: string, updates: Partial<WorkflowSegment>) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? {
        ...rule,
        segments: rule.segments.map(segment =>
          segment.id === segmentId ? { ...segment, ...updates } : segment
        )
      } : rule
    ));
  };

  const addActionToRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? {
        ...rule,
        segments: [
          ...rule.segments,
          { id: `action-${Date.now()}`, type: 'dropdown', value: 'send', options: ACTION_OPTIONS, selectedChild: 'email' },
          { id: `recipient-${Date.now()}`, type: 'dropdown', value: 'client', options: RECIPIENT_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })) },
          { id: `timing-${Date.now()}`, type: 'dropdown', value: '1_day_ahead_of', options: TIMING_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })) },
          { id: `reference-${Date.now()}`, type: 'dropdown', value: 'job_schedule_date', options: REFERENCE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })) },
        ]
      } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const renderDropdown = (rule: WorkflowRule, segment: WorkflowSegment) => {
    const selectedOption = segment.options?.find(opt => opt.value === segment.value);
    const selectedChild = selectedOption?.children?.find(child => child.value === segment.selectedChild);
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-1 font-normal text-base hover:bg-primary/10 border-b-2 border-transparent hover:border-primary transition-colors"
          >
            <span className="underline decoration-dotted underline-offset-2">
              {selectedChild ? selectedChild.label : selectedOption?.label || segment.value}
            </span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm">
          {segment.options?.map((option) => (
            <div key={option.value}>
              <DropdownMenuItem
                className="font-medium"
                onClick={() => {
                  updateSegment(rule.id, segment.id, { 
                    value: option.value,
                    selectedChild: option.children?.[0]?.value 
                  });
                }}
              >
                {option.label}
              </DropdownMenuItem>
              {option.children && segment.value === option.value && (
                <>
                  <DropdownMenuSeparator />
                  {option.children.map((child) => (
                    <DropdownMenuItem
                      key={child.value}
                      className="pl-6 text-sm"
                      onClick={() => {
                        updateSegment(rule.id, segment.id, { selectedChild: child.value });
                      }}
                    >
                      <div className={cn(
                        "flex items-center w-full",
                        segment.selectedChild === child.value && "bg-primary/10 text-primary"
                      )}>
                        {child.label}
                        {segment.selectedChild === child.value && (
                          <span className="ml-auto text-primary">✓</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">Create smart automations with simple point-and-click</p>
        </div>
        <Button onClick={createNewRule} className="gap-2">
          Create New Workflow
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  {rule.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(rule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Trigger Section */}
              <div className="flex flex-wrap items-center gap-2 text-lg leading-relaxed mb-4 p-4 bg-muted/20 rounded-lg">
                {rule.segments.map((segment) => (
                  <span key={segment.id} className="flex items-center">
                    {segment.type === 'text' ? (
                      <span className="text-muted-foreground">{segment.value}</span>
                    ) : (
                      renderDropdown(rule, segment)
                    )}
                  </span>
                ))}
              </div>

              {/* Add Action Button */}
              {rule.segments.length <= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addActionToRule(rule.id)}
                  className="mt-2"
                >
                  + Add Action
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No workflows created yet</p>
              <Button onClick={createNewRule}>Create Your First Workflow</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {rules.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline">Preview</Button>
          <Button onClick={() => onSave(rules)}>Save All Workflows</Button>
        </div>
      )}
    </div>
  );
};