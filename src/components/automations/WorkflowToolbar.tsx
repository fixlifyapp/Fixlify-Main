import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  Mail, 
  MessageSquare, 
  Bell,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface WorkflowToolbarProps {
  selectedNodeType: string | null;
  onNodeTypeSelect: (type: string) => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  selectedNodeType,
  onNodeTypeSelect
}) => {
  const nodeCategories = [
    {
      title: 'Triggers',
      description: 'Start your workflow',
      items: [
        {
          type: 'trigger',
          label: 'Job Created',
          icon: FileText,
          description: 'When a new job is created'
        },
        {
          type: 'trigger',
          label: 'Job Completed',
          icon: FileText,
          description: 'When a job is marked complete'
        },
        {
          type: 'trigger',
          label: 'Invoice Sent',
          icon: DollarSign,
          description: 'When an invoice is sent'
        },
        {
          type: 'trigger',
          label: 'Appointment Scheduled',
          icon: Calendar,
          description: 'When an appointment is booked'
        }
      ]
    },
    {
      title: 'Actions',
      description: 'What should happen',
      items: [
        {
          type: 'action',
          label: 'Send Email',
          icon: Mail,
          description: 'Send an email to the client'
        },
        {
          type: 'action',
          label: 'Send SMS',
          icon: MessageSquare,
          description: 'Send a text message'
        },
        {
          type: 'action',
          label: 'Create Task',
          icon: FileText,
          description: 'Create a follow-up task'
        },
        {
          type: 'action',
          label: 'Send Notification',
          icon: Bell,
          description: 'Send a push notification'
        }
      ]
    },
    {
      title: 'Logic',
      description: 'Add conditions and delays',
      items: [
        {
          type: 'condition',
          label: 'If/Then',
          icon: GitBranch,
          description: 'Check conditions and branch'
        },
        {
          type: 'delay',
          label: 'Wait',
          icon: Clock,
          description: 'Wait for a specific time'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Workflow Components</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a component and click on the canvas to add it
        </p>
      </div>

      {nodeCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
            <p className="text-xs text-gray-600">{category.description}</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {category.items.map((item) => {
              const IconComponent = item.icon;
              const isSelected = selectedNodeType === item.type;
              
              return (
                <Button
                  key={`${item.type}-${item.label}`}
                  variant={isSelected ? "default" : "ghost"}
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => onNodeTypeSelect(item.type)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {selectedNodeType && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700">Selected</Badge>
            </div>
            <p className="text-sm text-blue-700">
              Click anywhere on the canvas to add a{' '}
              <span className="font-medium">{selectedNodeType}</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => onNodeTypeSelect('')}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};