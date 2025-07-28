import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Bot, Sparkles, Lightbulb, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { useIntelligentAI } from '@/hooks/useIntelligentAI';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIAutomationAssistantProps {
  onWorkflowGenerated: (workflow: any) => void;
  onTemplateSelected: (template: any) => void;
  businessType?: string;
  existingData?: {
    jobs: number;
    clients: number;
    revenue: number;
  };
}

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  workflow?: any;
  templates?: any[];
}

export const AIAutomationAssistant: React.FC<AIAutomationAssistantProps> = ({
  onWorkflowGenerated,
  onTemplateSelected,
  businessType = 'General Service',
  existingData = { jobs: 0, clients: 0, revenue: 0 }
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: `Hi! I'm your AI Automation Assistant. I can help you create smart workflows to automate your ${businessType} business. What would you like to automate today?`,
      timestamp: new Date(),
      suggestions: [
        "Send follow-up emails after job completion",
        "Remind clients about overdue invoices",
        "Create tasks when new jobs are scheduled",
        "Send appointment confirmations automatically"
      ]
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { getAIRecommendation, isLoading } = useIntelligentAI();

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isGenerating) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    try {
      // Call AI to generate automation
      const response = await getAIRecommendation({
        prompt: messageText,
        context: {
          businessType,
          existingData,
          currentTask: 'automation_creation',
          intent: 'workflow_generation'
        }
      });

      if (response) {
        // Parse AI response and extract workflow/templates
        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: response.response,
          timestamp: new Date(),
          suggestions: response.suggestions
        };

        // Try to extract workflow from response
        const workflow = parseWorkflowFromResponse(response.response);
        if (workflow) {
          aiMessage.workflow = workflow;
        }

        // Generate template suggestions
        const templates = generateTemplateSuggestions(messageText, businessType);
        if (templates.length > 0) {
          aiMessage.templates = templates;
        }

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to predefined responses
      const fallbackResponse = generateFallbackResponse(messageText, businessType);
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseWorkflowFromResponse = (response: string): any => {
    // Simple workflow parsing - in production, this would be more sophisticated
    const workflow = {
      name: extractWorkflowName(response),
      trigger: extractTrigger(response),
      steps: extractSteps(response)
    };

    return workflow.steps.length > 0 ? workflow : null;
  };

  const extractWorkflowName = (text: string): string => {
    const patterns = [
      /create.*(?:workflow|automation).*"([^"]+)"/i,
      /(?:workflow|automation).*called "([^"]+)"/i,
      /"([^"]+)".*(?:workflow|automation)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    return "AI Generated Workflow";
  };

  const extractTrigger = (text: string): any => {
    if (text.includes('job completed') || text.includes('job finished')) {
      return { type: 'job_completed', config: {} };
    }
    if (text.includes('invoice') && (text.includes('overdue') || text.includes('unpaid'))) {
      return { type: 'invoice_overdue', config: { days: 7 } };
    }
    if (text.includes('new job') || text.includes('job created')) {
      return { type: 'job_created', config: {} };
    }
    if (text.includes('appointment') || text.includes('scheduled')) {
      return { type: 'job_scheduled', config: { hoursAhead: 24 } };
    }

    return { type: 'job_created', config: {} };
  };

  const extractSteps = (text: string): any[] => {
    const steps = [];
    
    if (text.includes('send email') || text.includes('email')) {
      steps.push({
        id: `step-${Date.now()}-1`,
        type: 'action',
        name: 'Send Email',
        config: {
          actionType: 'email',
          subject: generateEmailSubject(text),
          message: generateEmailMessage(text)
        }
      });
    }

    if (text.includes('send sms') || text.includes('text message')) {
      steps.push({
        id: `step-${Date.now()}-2`,
        type: 'action',
        name: 'Send SMS',
        config: {
          actionType: 'sms',
          message: generateSMSMessage(text)
        }
      });
    }

    if (text.includes('create task') || text.includes('task')) {
      steps.push({
        id: `step-${Date.now()}-3`,
        type: 'action',
        name: 'Create Task',
        config: {
          actionType: 'task',
          title: 'Follow up with client',
          description: 'Generated by AI automation'
        }
      });
    }

    return steps;
  };

  const generateEmailSubject = (text: string): string => {
    if (text.includes('follow up')) return 'Thank you for choosing {{company.name}}!';
    if (text.includes('overdue')) return 'Payment Reminder - Invoice #{{invoice.number}}';
    if (text.includes('appointment')) return 'Appointment Confirmation - {{job.scheduledDate}}';
    return 'Update from {{company.name}}';
  };

  const generateEmailMessage = (text: string): string => {
    if (text.includes('follow up')) {
      return `Hi {{client.firstName}},\n\nThank you for choosing {{company.name}} for your recent {{job.type}} service. We hope you're satisfied with our work!\n\nIf you have any questions or need additional services, please don't hesitate to reach out.\n\nBest regards,\n{{company.name}} Team`;
    }
    if (text.includes('overdue')) {
      return `Hi $\{client.firstName},\n\nThis is a friendly reminder that invoice #$\{invoice.number} for $$\{invoice.total} is now overdue.\n\nPlease submit payment at your earliest convenience.\n\nThank you,\n$\{company.name}`;
    }
    return `Hi {{client.firstName}},\n\nThis is an automated message from {{company.name}}.\n\nBest regards,\nYour {{company.name}} Team`;
  };

  const generateSMSMessage = (text: string): string => {
    if (text.includes('appointment')) {
      return 'Hi {{client.firstName}}! Your {{job.type}} appointment is confirmed for {{job.scheduledDate}} at {{job.scheduledTime}}. - {{company.name}}';
    }
    if (text.includes('overdue')) {
      return 'Hi {{client.firstName}}, invoice #{{invoice.number}} (${{invoice.total}}) is overdue. Please submit payment. - {{company.name}}';
    }
    return 'Hi {{client.firstName}}, update from {{company.name}}: {{message}}';
  };

  const generateTemplateSuggestions = (query: string, businessType: string): any[] => {
    const templates = [
      {
        id: 'follow-up-email',
        name: 'Post-Service Follow-up',
        description: 'Send thank you email after job completion',
        trigger: 'Job Completed',
        actions: ['Send Email', 'Request Review'],
        category: 'Customer Service'
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        description: 'Remind clients about overdue invoices',
        trigger: 'Invoice Overdue',
        actions: ['Send Email', 'Send SMS'],
        category: 'Finance'
      },
      {
        id: 'appointment-confirmation',
        name: 'Appointment Confirmation',
        description: 'Confirm appointments 24 hours ahead',
        trigger: 'Job Scheduled',
        actions: ['Send SMS', 'Send Email'],
        category: 'Scheduling'
      }
    ];

    return templates.filter(template => 
      query.toLowerCase().includes(template.name.toLowerCase().split(' ')[0]) ||
      template.description.toLowerCase().includes(query.toLowerCase().split(' ')[0])
    );
  };

  const generateFallbackResponse = (query: string, businessType: string): AIMessage => {
    return {
      id: `ai-fallback-${Date.now()}`,
      type: 'ai',
      content: `I understand you want to automate something related to "${query}". Here are some popular automation ideas for ${businessType} businesses:`,
      timestamp: new Date(),
      suggestions: [
        "Send follow-up emails after completing jobs",
        "Automatically remind clients about overdue payments",
        "Create tasks when new jobs are scheduled",
        "Send appointment confirmations via SMS"
      ],
      templates: generateTemplateSuggestions(query, businessType)
    };
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Automation Assistant
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* AI Suggestions */}
                    {message.type === 'ai' && message.suggestions && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Quick suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generated Workflow */}
                    {message.workflow && (
                      <div className="mt-3 p-2 bg-background/50 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Generated Workflow</span>
                          <Button
                            size="sm"
                            onClick={() => onWorkflowGenerated(message.workflow)}
                            className="h-6 text-xs"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Use This
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{message.workflow.name}</p>
                      </div>
                    )}

                    {/* Template Suggestions */}
                    {message.templates && message.templates.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">Related templates:</p>
                        {message.templates.map((template) => (
                          <div
                            key={template.id}
                            className="p-2 bg-background/50 rounded border cursor-pointer hover:bg-background/70"
                            onClick={() => onTemplateSelected(template)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      AI is generating your automation...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe what you want to automate... (e.g., 'Send follow-up emails after completing jobs')"
              className="flex-1 min-h-[40px] max-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isGenerating}
              className="self-end"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleSendMessage("Send follow-up emails after completing jobs")}
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Follow-up Emails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleSendMessage("Remind clients about overdue payments")}
            >
              <Zap className="w-3 h-3 mr-1" />
              Payment Reminders
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleSendMessage("Send appointment confirmations")}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Appointment Confirmations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};