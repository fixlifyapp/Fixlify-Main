import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, AlertTriangle, Activity, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskAutomationShowcaseProps {
  onCreateAutomation: (templateId: string) => void;
}

export const TaskAutomationShowcase: React.FC<TaskAutomationShowcaseProps> = ({ onCreateAutomation }) => {
  const taskAutomations = [
    {
      id: 'task_created',
      icon: CheckSquare,
      title: 'New Task Assignment',
      description: 'Automatically notify team members when tasks are assigned',
      benefits: [
        'Instant SMS & email notifications',
        'Include task details and priority',
        'Link to job information'
      ],
      triggerType: 'task_created',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'task_completed',
      icon: Activity,
      title: 'Task Completion Alert',
      description: 'Notify managers when high-priority tasks are completed',
      benefits: [
        'Real-time completion tracking',
        'Automatic job status updates',
        'Performance monitoring'
      ],
      triggerType: 'task_completed',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'task_overdue',
      icon: AlertTriangle,
      title: 'Overdue Task Alert',
      description: 'Alert teams about overdue tasks to prevent delays',
      benefits: [
        'Proactive overdue notifications',
        'Escalation to management',
        'Automatic task tracking'
      ],
      triggerType: 'task_overdue',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'task_status_changed',
      icon: Clock,
      title: 'Task Progress Updates',
      description: 'Keep everyone informed about task status changes',
      benefits: [
        'Real-time status notifications',
        'Client progress updates',
        'Blocked task alerts'
      ],
      triggerType: 'task_status_changed',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Task Automation Templates</h2>
        <p className="text-muted-foreground">
          Streamline your task management with intelligent automations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {taskAutomations.map((automation) => {
          const Icon = automation.icon;
          
          return (
            <Card key={automation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center",
                      automation.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{automation.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {automation.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    Team
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Benefits:</p>
                    <ul className="space-y-1">
                      {automation.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => onCreateAutomation(automation.triggerType)}
                  >
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          How Task Automations Work
        </h3>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <div className="space-y-2">
            <div className="font-medium">1. Task Events</div>
            <p className="text-sm text-muted-foreground">
              Automations trigger on task creation, completion, status changes, or overdue alerts
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">2. Smart Routing</div>
            <p className="text-sm text-muted-foreground">
              Notifications are sent to the right people at the right time via SMS or email
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-medium">3. Automatic Updates</div>
            <p className="text-sm text-muted-foreground">
              Keep everyone informed without manual follow-ups or status meetings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
