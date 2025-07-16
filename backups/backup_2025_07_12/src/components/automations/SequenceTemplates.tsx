import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Users, DollarSign, Calendar, Star, 
  TrendingUp, CheckCircle, Clock, MessageSquare, Mail
} from 'lucide-react';
import { WorkflowStep } from './WorkflowBuilder';

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  expectedResults: string[];
  steps: WorkflowStep[];
  triggers: any[];
}

interface SequenceTemplatesProps {
  onSelectTemplate: (template: SequenceTemplate) => void;
}

export const SequenceTemplates: React.FC<SequenceTemplatesProps> = ({ onSelectTemplate }) => {
  const templates: SequenceTemplate[] = [
    {
      id: 'estimate_follow_up',
      name: 'Estimate Follow-Up Sequence',
      description: 'Automated follow-up sequence for sent estimates',
      category: 'sales',
      icon: FileText,
      expectedResults: ['45% higher close rate', '7 days faster decision'],
      triggers: [{
        type: 'entity_created',
        config: { entity_type: 'estimate' }
      }],
      steps: [
        {
          id: 'step-1',
          type: 'action',
          name: 'Send Estimate',
          config: {
            actionType: 'email',
            subject: 'Your {{service_type}} Estimate is Ready',
            message: 'Hi {{client_name}},\n\nYour estimate for {{service_type}} is attached. The total is ${{amount}}.\n\nPlease review and let us know if you have any questions.',
            sendTime: 'immediately'
          }
        },
        {
          id: 'step-2',
          type: 'delay',
          name: 'Wait 1 Day',
          config: { delayType: 'days', delayValue: 1 }
        },
        {
          id: 'step-3',
          type: 'branch',
          name: 'Check if Estimate Viewed',
          config: {},
          branches: [
            {
              id: 'branch-1',
              name: 'If Viewed',
              condition: {
                operator: 'AND',
                conditions: [
                  { field: 'estimate_viewed', operator: 'equals', value: 'true' }
                ]
              },
              steps: [
                {
                  id: 'step-3a',
                  type: 'action',
                  name: 'Send "Any Questions?" SMS',
                  config: {
                    actionType: 'sms',
                    message: 'Hi {{client_name}}, I saw you viewed the estimate. Any questions I can answer? - {{technician_name}}'
                  }
                }
              ]
            },
            {
              id: 'branch-2',
              name: 'Else (Not Viewed)',
              condition: { operator: 'AND', conditions: [] },
              steps: [
                {
                  id: 'step-3b',
                  type: 'action',
                  name: 'Send "Did You Receive?" Email',
                  config: {
                    actionType: 'email',
                    subject: 'Did you receive our estimate?',
                    message: 'Hi {{client_name}},\n\nJust checking to make sure you received the estimate we sent yesterday. Let me know if you need me to resend it.'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'step-4',
          type: 'delay',
          name: 'Wait 2 More Days',
          config: { delayType: 'days', delayValue: 2 }
        },
        {
          id: 'step-5',
          type: 'action',
          name: 'Send "Questions?" Follow-up',
          config: {
            actionType: 'email',
            subject: 'Any questions about your {{service_type}} estimate?',
            message: 'Hi {{client_name}},\n\nI wanted to follow up on the estimate we sent. Do you have any questions about the scope of work or pricing?\n\nWe\'re here to help!'
          }
        },
        {
          id: 'step-6',
          type: 'delay',
          name: 'Wait 4 Days',
          config: { delayType: 'days', delayValue: 4 }
        },
        {
          id: 'step-7',
          type: 'action',
          name: 'Send Limited Time Discount',
          config: {
            actionType: 'email',
            subject: 'Save 10% - Limited Time Offer',
            message: 'Hi {{client_name}},\n\nWe\'d love to earn your business! If you approve your estimate by {{date_plus_3_days}}, we\'ll apply a 10% discount.\n\nReady to move forward?'
          }
        },
        {
          id: 'step-8',
          type: 'delay',
          name: 'Wait 1 Week',
          config: { delayType: 'days', delayValue: 7 }
        },
        {
          id: 'step-9',
          type: 'action',
          name: 'Final Follow-up',
          config: {
            actionType: 'email',
            subject: 'Last chance - Your estimate is expiring',
            message: 'Hi {{client_name}},\n\nYour estimate will expire in 7 days. After that, we\'ll need to requote based on current pricing.\n\nIs there anything holding you back that we can address?'
          }
        }
      ]
    },
    {
      id: 'new_client_onboarding',
      name: 'New Client Onboarding',
      description: 'Welcome sequence for new customers',
      category: 'customer_success',
      icon: Users,
      expectedResults: ['90% satisfaction', '3x referral rate'],
      triggers: [{
        type: 'first_job_completed',
        config: {}
      }],
      steps: [
        {
          id: 'step-1',
          type: 'action',
          name: 'Send Welcome Email',
          config: {
            actionType: 'email',
            subject: 'Welcome to {{company_name}}!',
            message: 'Hi {{client_name}},\n\nThank you for choosing us! We\'re excited to have you as a customer.\n\nHere\'s what you can expect from us:\n- 24/7 emergency service\n- Satisfaction guarantee\n- Transparent pricing\n\nSave this number for emergencies: {{emergency_phone}}'
          }
        },
        {
          id: 'step-2',
          type: 'delay',
          name: 'Wait 2 Days',
          config: { delayType: 'days', delayValue: 2 }
        },
        {
          id: 'step-3',
          type: 'action',
          name: 'Service Guide',
          config: {
            actionType: 'email',
            subject: 'Your Complete Service Guide',
            message: 'Hi {{client_name}},\n\nWe\'ve put together a guide to help you get the most from our services.\n\nInside you\'ll find:\n- Maintenance tips\n- When to call us\n- Money-saving advice\n\n[View Guide]'
          }
        },
        {
          id: 'step-4',
          type: 'delay',
          name: 'Wait 1 Week',
          config: { delayType: 'days', delayValue: 7 }
        },
        {
          id: 'step-5',
          type: 'action',
          name: 'Check-in Call Task',
          config: {
            actionType: 'task',
            taskType: 'call',
            assignTo: 'account_manager',
            description: 'New client check-in call - {{client_name}}'
          }
        },
        {
          id: 'step-6',
          type: 'delay',
          name: 'Wait 30 Days',
          config: { delayType: 'days', delayValue: 30 }
        },
        {
          id: 'step-7',
          type: 'branch',
          name: 'Check Satisfaction',
          config: {},
          branches: [
            {
              id: 'branch-1',
              name: 'If Satisfied (4+ stars)',
              condition: {
                operator: 'AND',
                conditions: [
                  { field: 'last_rating', operator: 'greater_than', value: '3' }
                ]
              },
              steps: [
                {
                  id: 'step-7a',
                  type: 'action',
                  name: 'Request Referral',
                  config: {
                    actionType: 'email',
                    subject: 'Know someone who needs our services?',
                    message: 'Hi {{client_name}},\n\nWe\'re glad you\'re happy with our service!\n\nIf you know anyone who could use our help, we\'d be grateful for the referral. As a thank you, you\'ll both receive 10% off your next service.'
                  }
                }
              ]
            },
            {
              id: 'branch-2',
              name: 'Else (Not Satisfied)',
              condition: { operator: 'AND', conditions: [] },
              steps: [
                {
                  id: 'step-7b',
                  type: 'action',
                  name: 'Alert Manager',
                  config: {
                    actionType: 'notification',
                    message: 'New client {{client_name}} may need attention - low satisfaction'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'maintenance_reminder',
      name: 'Seasonal Maintenance Campaign',
      description: 'Remind customers about seasonal maintenance',
      category: 'retention',
      icon: Calendar,
      expectedResults: ['35% booking rate', '$125 avg ticket'],
      triggers: [{
        type: 'days_since_service',
        config: { days: 180, serviceTypes: 'maintenance' }
      }],
      steps: [
        {
          id: 'step-1',
          type: 'action',
          name: 'Initial Reminder',
          config: {
            actionType: 'email',
            subject: 'Time for your seasonal maintenance',
            message: 'Hi {{client_name}},\n\nIt\'s been 6 months since your last maintenance service. Regular maintenance helps prevent costly repairs.\n\nSchedule your appointment today and save 15%!'
          }
        },
        {
          id: 'step-2',
          type: 'delay',
          name: 'Wait 3 Days',
          config: { delayType: 'days', delayValue: 3 }
        },
        {
          id: 'step-3',
          type: 'action',
          name: 'SMS Reminder',
          config: {
            actionType: 'sms',
            message: 'Hi {{client_name}}, don\'t forget about your maintenance! Book now and save 15%: {{booking_link}}'
          }
        },
        {
          id: 'step-4',
          type: 'delay',
          name: 'Wait 1 Week',
          config: { delayType: 'days', delayValue: 7 }
        },
        {
          id: 'step-5',
          type: 'action',
          name: 'Last Chance',
          config: {
            actionType: 'email',
            subject: 'Last chance for 15% off maintenance',
            message: 'Hi {{client_name}},\n\nOur 15% maintenance special ends this week. Don\'t wait for a breakdown - preventive maintenance saves money!\n\nBook now before it\'s too late.'
          }
        }
      ]
    },
    {
      id: 'invoice_collection',
      name: 'Smart Invoice Collection',
      description: 'Graduated reminders for overdue invoices',
      category: 'financial',
      icon: DollarSign,
      expectedResults: ['95% collection rate', '14 days faster payment'],
      triggers: [{
        type: 'date_based',
        config: { trigger_field: 'due_date', days_overdue: 1 }
      }],
      steps: [
        {
          id: 'step-1',
          type: 'action',
          name: 'Friendly Reminder',
          config: {
            actionType: 'email',
            subject: 'Invoice #{{invoice_number}} - Payment Reminder',
            message: 'Hi {{client_name}},\n\nJust a friendly reminder that invoice #{{invoice_number}} for ${{amount}} was due yesterday.\n\nPay online: {{payment_link}}\n\nThanks!'
          }
        },
        {
          id: 'step-2',
          type: 'delay',
          name: 'Wait 3 Days',
          config: { delayType: 'days', delayValue: 3 }
        },
        {
          id: 'step-3',
          type: 'branch',
          name: 'Check Payment Status',
          config: {},
          branches: [
            {
              id: 'branch-1',
              name: 'If Paid',
              condition: {
                operator: 'AND',
                conditions: [
                  { field: 'invoice_status', operator: 'equals', value: 'paid' }
                ]
              },
              steps: [
                {
                  id: 'step-3a',
                  type: 'action',
                  name: 'Send Thank You',
                  config: {
                    actionType: 'email',
                    subject: 'Thank you for your payment!',
                    message: 'Hi {{client_name}},\n\nWe received your payment of ${{amount}}. Thank you!\n\nWe appreciate your business.'
                  }
                }
              ]
            },
            {
              id: 'branch-2',
              name: 'Else (Not Paid)',
              condition: { operator: 'AND', conditions: [] },
              steps: [
                {
                  id: 'step-3b',
                  type: 'action',
                  name: 'Second Reminder',
                  config: {
                    actionType: 'email',
                    subject: 'Invoice #{{invoice_number}} - Now Overdue',
                    message: 'Hi {{client_name}},\n\nInvoice #{{invoice_number}} is now 4 days overdue.\n\nAmount due: ${{amount}}\n\nPlease pay at your earliest convenience to avoid any service interruptions.'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'step-4',
          type: 'delay',
          name: 'Wait 1 Week',
          config: { delayType: 'days', delayValue: 7 }
        },
        {
          id: 'step-5',
          type: 'action',
          name: 'Final Notice',
          config: {
            actionType: 'email',
            subject: 'Final Notice - Invoice #{{invoice_number}}',
            message: 'Hi {{client_name}},\n\nThis is a final notice regarding invoice #{{invoice_number}} for ${{amount}}, now 11 days overdue.\n\nPlease contact us immediately if you\'re having trouble with payment. We\'re here to help work out a solution.'
          }
        },
        {
          id: 'step-6',
          type: 'action',
          name: 'Alert Management',
          config: {
            actionType: 'notification',
            message: 'Invoice #{{invoice_number}} for {{client_name}} is severely overdue (${{amount}})'
          }
        }
      ]
    }
  ];

  const categoryIcons = {
    sales: TrendingUp,
    customer_success: Star,
    retention: Users,
    financial: DollarSign
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, SequenceTemplate[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
        const CategoryIcon = categoryIcons[category] || FileText;
        
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold capitalize">
                {category.replace('_', ' ')} Sequences
              </h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {categoryTemplates.map((template) => {
                const Icon = template.icon;
                
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Expected Results */}
                        <div className="flex flex-wrap gap-2">
                          {template.expectedResults.map((result, index) => (
                            <Badge key={index} variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {result}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Sequence Preview */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sequence Preview:</p>
                          <div className="space-y-1">
                            {template.steps.slice(0, 3).map((step, index) => (
                              <div key={step.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">{index + 1}.</span>
                                {step.type === 'action' && (
                                  <>
                                    {step.config.actionType === 'email' && <Mail className="w-3 h-3" />}
                                    {step.config.actionType === 'sms' && <MessageSquare className="w-3 h-3" />}
                                  </>
                                )}
                                {step.type === 'delay' && <Clock className="w-3 h-3" />}
                                <span>{step.name}</span>
                              </div>
                            ))}
                            {template.steps.length > 3 && (
                              <p className="text-sm text-muted-foreground pl-6">
                                +{template.steps.length - 3} more steps...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => onSelectTemplate(template)}
                        >
                          Use This Sequence
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SequenceTemplates;