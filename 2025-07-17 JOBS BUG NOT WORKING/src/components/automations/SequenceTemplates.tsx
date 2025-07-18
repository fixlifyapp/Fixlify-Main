
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Calendar, Clock } from "lucide-react";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  description: string;
  config: any;
  icon: string;
}

interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  estimatedTime: string;
  popularity: number;
}

interface SequenceTemplatesProps {
  onSelectTemplate: (template: SequenceTemplate) => void;
}

const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder Sequence',
    description: 'Automated reminders before scheduled appointments',
    category: 'Customer Service',
    estimatedTime: '5 minutes',
    popularity: 95,
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'Appointment Scheduled',
        description: 'When a new appointment is created',
        config: { triggerType: 'appointment_created' },
        icon: 'calendar'
      },
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Wait 24 hours',
        description: 'Wait until 24 hours before appointment',
        config: { delayAmount: 24, delayUnit: 'hours' },
        icon: 'clock'
      },
      {
        id: 'action-1',
        type: 'action',
        name: 'Send SMS Reminder',
        description: 'Send reminder with appointment details',
        config: { 
          actionType: 'send_sms',
          message: 'Hi {client_name}, reminder: You have an appointment tomorrow at {appointment_time}.'
        },
        icon: 'message-square'
      }
    ]
  },
  {
    id: 'follow-up-sequence',
    name: 'Post-Service Follow-up',
    description: 'Follow up with customers after service completion',
    category: 'Customer Success',
    estimatedTime: '3 minutes',
    popularity: 88,
    steps: [
      {
        id: 'trigger-2',
        type: 'trigger',
        name: 'Job Completed',
        description: 'When a job status changes to completed',
        config: { triggerType: 'job_completed' },
        icon: 'check'
      },
      {
        id: 'delay-2',
        type: 'delay',
        name: 'Wait 2 hours',
        description: 'Give time for service completion',
        config: { delayAmount: 2, delayUnit: 'hours' },
        icon: 'clock'
      },
      {
        id: 'action-2',
        type: 'action',
        name: 'Send Follow-up Email',
        description: 'Send thank you and feedback request',
        config: { 
          actionType: 'send_email',
          subject: 'Thank you for choosing us!',
          message: 'Hi {client_name}, thank you for your business!'
        },
        icon: 'mail'
      }
    ]
  }
];

export const SequenceTemplates: React.FC<SequenceTemplatesProps> = ({ onSelectTemplate }) => {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'mail': return Mail;
      case 'message-square': return MessageSquare;
      case 'calendar': return Calendar;
      case 'clock': return Clock;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sequence Templates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SEQUENCE_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary">{template.category}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.estimatedTime}
                </Badge>
                <Badge variant="outline">
                  {template.popularity}% popular
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">Steps ({template.steps.length}):</h4>
                {template.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="font-medium">{step.name}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full"
                onClick={() => onSelectTemplate(template)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
