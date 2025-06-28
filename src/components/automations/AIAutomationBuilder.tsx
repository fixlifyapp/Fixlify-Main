import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AIAutomationBuilderProps {
  onAutomationGenerated: (automation: any) => void;
}

interface GeneratedAutomation {
  name: string;
  description: string;
  trigger: {
    type: string;
    name: string;
    config?: any;
  };
  steps: Array<{
    type: string;
    name: string;
    config: any;
  }>;
}

const AI_EXAMPLES = [
  "Send a thank you message 2 days after job completion",
  "Follow up on unpaid invoices after 5 days",
  "Remind customers about maintenance every 3 months",
  "Request a review 1 week after service completion",
  "Send appointment reminder 24 hours before scheduled time"
];

export const AIAutomationBuilder: React.FC<AIAutomationBuilderProps> = ({ onAutomationGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAutomation, setGeneratedAutomation] = useState<GeneratedAutomation | null>(null);

  const parseUserPrompt = (userPrompt: string): GeneratedAutomation | null => {
    const lowerPrompt = userPrompt.toLowerCase();
    
    // Parse timing information
    const timeMatch = lowerPrompt.match(/(\d+)\s*(day|days|week|weeks|month|months|hour|hours)/);
    const timeValue = timeMatch ? parseInt(timeMatch[1]) : 1;
    const timeUnit = timeMatch ? timeMatch[2].replace(/s$/, '') : 'day';

    // Determine trigger type
    let trigger = { type: 'job_completed', name: 'Job Completed', config: {} };
    let steps: any[] = [];
    let name = '';
    let description = '';

    // Job completion follow-ups
    if (lowerPrompt.includes('completion') || lowerPrompt.includes('completed') || lowerPrompt.includes('done')) {
      trigger = { type: 'job_completed', name: 'Job Completed' };
      name = `${timeValue} ${timeUnit} follow-up after completion`;
      description = `Automatically follow up with customers ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} after job completion`;
      
      // Add delay step
      steps.push({
        type: 'delay',
        name: `Wait ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`,
        config: { delayValue: timeValue, delayUnit: `${timeUnit}s` }
      });
    }
    // Invoice/payment reminders
    else if (lowerPrompt.includes('invoice') || lowerPrompt.includes('payment') || lowerPrompt.includes('unpaid')) {
      trigger = { type: 'invoice_sent', name: 'Invoice Sent' };
      name = `Payment reminder after ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`;
      description = `Send payment reminder ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} after invoice is sent`;
      
      steps.push({
        type: 'delay',
        name: `Wait ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`,
        config: { delayValue: timeValue, delayUnit: `${timeUnit}s` }
      });
    }
    // Appointment reminders
    else if (lowerPrompt.includes('appointment') || lowerPrompt.includes('reminder') || lowerPrompt.includes('before')) {
      trigger = { 
        type: 'job_scheduled', 
        name: 'Job Scheduled',
        config: { timingType: 'before', timeValue, timeUnit: `${timeUnit}s` }
      };
      name = `Appointment reminder ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} before`;
      description = `Send reminder ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} before scheduled appointment`;
    }
    // Review requests
    else if (lowerPrompt.includes('review') || lowerPrompt.includes('feedback') || lowerPrompt.includes('rating')) {
      trigger = { type: 'job_completed', name: 'Job Completed' };
      name = `Review request after ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`;
      description = `Request customer review ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} after job completion`;
      
      steps.push({
        type: 'delay',
        name: `Wait ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`,
        config: { delayValue: timeValue, delayUnit: `${timeUnit}s` }
      });
    }
    // Maintenance reminders
    else if (lowerPrompt.includes('maintenance') || lowerPrompt.includes('service') || lowerPrompt.includes('check-up')) {
      trigger = { 
        type: 'schedule_time', 
        name: 'Scheduled Time',
        config: { scheduleType: 'recurring', frequency: timeUnit === 'month' ? 'monthly' : 'weekly', interval: timeValue }
      };
      name = `Maintenance reminder every ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`;
      description = `Send maintenance reminder every ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`;
    }

    // Determine communication method
    const useSMS = lowerPrompt.includes('sms') || lowerPrompt.includes('text') || lowerPrompt.includes('message');
    const useEmail = lowerPrompt.includes('email') || (!useSMS && !lowerPrompt.includes('sms'));

    // Add communication steps
    if (useEmail) {
      steps.push({
        type: 'send_email',
        name: 'Send Email',
        config: {
          recipient: 'client',
          subject: generateEmailSubject(name),
          message: generateEmailBody(name, trigger.type)
        }
      });
    }

    if (useSMS || lowerPrompt.includes('both')) {
      steps.push({
        type: 'send_sms',
        name: 'Send SMS',
        config: {
          recipient: 'client',
          message: generateSMSMessage(name, trigger.type)
        }
      });
    }

    // If no steps were added, add a default email step
    if (steps.length === 0 || (steps.length === 1 && steps[0].type === 'delay')) {
      steps.push({
        type: 'send_email',
        name: 'Send Email',
        config: {
          recipient: 'client',
          subject: generateEmailSubject(name),
          message: generateEmailBody(name, trigger.type)
        }
      });
    }

    return {
      name,
      description,
      trigger,
      steps
    };
  };

  const generateEmailSubject = (automationName: string): string => {
    if (automationName.includes('payment') || automationName.includes('invoice')) {
      return 'Payment Reminder - Invoice {{invoice_number}}';
    }
    if (automationName.includes('appointment')) {
      return 'Appointment Reminder - {{appointment_date}}';
    }
    if (automationName.includes('review')) {
      return 'How was your experience with {{company_name}}?';
    }
    if (automationName.includes('maintenance')) {
      return 'Time for your scheduled maintenance';
    }
    return 'Update from {{company_name}}';
  };

  const generateEmailBody = (automationName: string, triggerType: string): string => {
    if (automationName.includes('payment') || automationName.includes('invoice')) {
      return `Hi {{client_name}},

This is a friendly reminder that invoice {{invoice_number}} for {{amount}} is now due.

You can pay online at: {{payment_link}}

If you have any questions, please contact us at {{company_phone}}.

Thank you,
{{company_name}}`;
    }
    if (automationName.includes('appointment')) {
      return `Hi {{client_name}},

This is a reminder about your upcoming {{job_type}} appointment:

Date: {{appointment_date}}
Time: {{appointment_time}}
Location: {{client_address}}

If you need to reschedule, please call us at {{company_phone}}.

See you soon!
{{company_name}}`;
    }
    if (automationName.includes('review')) {
      return `Hi {{client_name}},

Thank you for choosing {{company_name}} for your recent {{job_type}} service!

We'd love to hear about your experience. Your feedback helps us improve and helps other customers.

Please take a moment to leave a review: {{review_link}}

Thank you for your time!
{{company_name}}`;
    }
    if (automationName.includes('maintenance')) {
      return `Hi {{client_name}},

It's time for your regular maintenance check!

Regular maintenance helps:
• Prevent costly repairs
• Extend equipment life
• Maintain efficiency

Schedule your appointment: {{booking_link}}
Or call us at: {{company_phone}}

Best regards,
{{company_name}}`;
    }
    return `Hi {{client_name}},

{{message_content}}

Best regards,
{{company_name}}`;
  };

  const generateSMSMessage = (automationName: string, triggerType: string): string => {
    if (automationName.includes('payment') || automationName.includes('invoice')) {
      return 'Hi {{client_first_name}}, invoice {{invoice_number}} ({{amount}}) is due. Pay now: {{payment_link}} - {{company_name}}';
    }
    if (automationName.includes('appointment')) {
      return 'Reminder: {{job_type}} appointment {{appointment_date}} at {{appointment_time}}. Reply C to confirm. - {{company_name}}';
    }
    if (automationName.includes('review')) {
      return 'Hi {{client_first_name}}, thanks for choosing us! Please rate your experience: {{review_link}} - {{company_name}}';
    }
    if (automationName.includes('maintenance')) {
      return 'Hi {{client_first_name}}, time for maintenance! Book now: {{booking_link}} or call {{company_phone}} - {{company_name}}';
    }
    return 'Hi {{client_first_name}}, {{message_content}} - {{company_name}}';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what automation you want to create');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const automation = parseUserPrompt(prompt);
      if (automation) {
        setGeneratedAutomation(automation);
        toast.success('Automation generated successfully!');
      } else {
        toast.error('Could not understand your request. Please try again with more details.');
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleUseAutomation = () => {
    if (generatedAutomation) {
      onAutomationGenerated(generatedAutomation);
      setPrompt('');
      setGeneratedAutomation(null);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Automation Builder</h3>
              <p className="text-sm text-muted-foreground">
                Describe your automation in plain English
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Send a follow-up email 3 days after job completion asking for a review"
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-muted-foreground mr-2">Try:</p>
              {AI_EXAMPLES.map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Automation
              </>
            )}
          </Button>

          <AnimatePresence>
            {generatedAutomation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-background rounded-lg border space-y-3"
              >
                <div>
                  <h4 className="font-semibold">{generatedAutomation.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {generatedAutomation.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Trigger</Badge>
                    <span>{generatedAutomation.trigger.name}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {generatedAutomation.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm ml-4">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                        <span>{step.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setGeneratedAutomation(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUseAutomation}
                    className="flex-1"
                  >
                    Use This Automation
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};