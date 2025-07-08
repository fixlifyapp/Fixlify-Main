
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, MessageSquare, Calendar, Star } from "lucide-react";

interface QuickSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

const QUICK_TEMPLATES = [
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Send automatic reminders before appointments',
    icon: Calendar,
    category: 'Customer Service',
    estimatedTime: '5 minutes',
    popularity: 95,
    steps: [
      {
        type: 'trigger',
        name: 'Appointment Scheduled',
        description: 'When a new appointment is created'
      },
      {
        type: 'delay',
        name: 'Wait 24 hours',
        description: 'Wait until 24 hours before appointment'
      },
      {
        type: 'action',
        name: 'Send SMS Reminder',
        description: 'Send reminder with appointment details',
        template: 'Hi {client_name}, reminder: You have an appointment tomorrow at {appointment_time} for {service_type}. See you then!'
      }
    ]
  },
  {
    id: 'follow-up-sequence',
    name: 'Post-Service Follow-up',
    description: 'Follow up with customers after service completion',
    icon: MessageSquare,
    category: 'Customer Success',
    estimatedTime: '3 minutes',
    popularity: 88,
    steps: [
      {
        type: 'trigger',
        name: 'Job Completed',
        description: 'When a job status changes to completed'
      },
      {
        type: 'delay',
        name: 'Wait 2 hours',
        description: 'Give time for service completion'
      },
      {
        type: 'action',
        name: 'Send Follow-up Email',
        description: 'Send thank you and feedback request',
        template: 'Hi {client_name}, thank you for choosing us! Your service on {appointment_date} at {appointment_time} for {service_type} is complete. We hope you\'re satisfied with our work. - {company_name} {company_phone}'
      }
    ]
  }
];

export const QuickSetupDialog: React.FC<QuickSetupDialogProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (template: any) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Setup - Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {QUICK_TEMPLATES.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary">{template.category}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {template.popularity}% popular
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Workflow Steps:</h4>
                    {template.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="font-medium">{step.name}</span>
                        <span className="text-muted-foreground">- {step.description}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
