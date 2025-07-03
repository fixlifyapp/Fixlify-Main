import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, ArrowRight, Loader2, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  "Send appointment reminder 24 hours before",
  "Alert team when high-value job is scheduled",
  "Send estimate follow-up after 3 days",
  "Notify customer when technician is on the way"
];

export const AIAutomationBuilder: React.FC<AIAutomationBuilderProps> = ({ onAutomationGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAutomation, setGeneratedAutomation] = useState<GeneratedAutomation | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  // Rotate through examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % AI_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      trigger = { type: 'job_completed', name: 'Job Completed', config: {} };
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
      trigger = { type: 'invoice_sent', name: 'Invoice Sent', config: {} };
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
      trigger = { type: 'job_completed', name: 'Job Completed', config: {} };
      name = `Review request after ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`;
      description = `Request customer review ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''} after job completion`;
      
      steps.push({
        type: 'delay',
        name: `Wait ${timeValue} ${timeUnit}${timeValue > 1 ? 's' : ''}`,
        config: { delayValue: timeValue, delayUnit: `${timeUnit}s` }
      });
    }
    // Team notifications
    else if (lowerPrompt.includes('team') || lowerPrompt.includes('notify') || lowerPrompt.includes('alert')) {
      trigger = { type: 'job_scheduled', name: 'Job Scheduled', config: {} };
      name = 'Team notification for high-value jobs';
      description = 'Alert team members when high-value jobs are scheduled';
    }
    // Technician dispatch
    else if (lowerPrompt.includes('technician') || lowerPrompt.includes('on the way') || lowerPrompt.includes('dispatch')) {
      trigger = { type: 'job_status_change', name: 'Job Status Changed', config: { status: 'dispatched' } };
      name = 'Customer notification when technician dispatched';
      description = 'Notify customer when technician is on the way';
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
    if (automationName.includes('team')) {
      return 'High-Value Job Alert - {{job_type}}';
    }
    if (automationName.includes('technician')) {
      return 'Your technician is on the way!';
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
    if (automationName.includes('team')) {
      return `New high-value job scheduled!

Client: {{client_name}}
Service: {{job_type}}
Value: {{amount}}
Date: {{appointment_date}}
Time: {{appointment_time}}

Please review and prepare accordingly.`;
    }
    if (automationName.includes('technician')) {
      return `Hi {{client_name}},

Good news! {{technician_name}} is on the way to your location.

Estimated arrival time: {{eta}}
Service: {{job_type}}

Please ensure someone is available to let them in.

Track live: {{tracking_link}}

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
    if (automationName.includes('technician')) {
      return 'Hi {{client_first_name}}, {{technician_name}} is on the way! ETA: {{eta}}. Track: {{tracking_link}} - {{company_name}}';
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
    <div className="relative">
      {/* Enhanced floating animation */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [-1, 1, -1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <Card className={cn(
          "relative overflow-hidden",
          "border-2 border-primary/50",
          "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
          "shadow-[0_0_50px_rgba(var(--primary),0.3)]",
          "hover:shadow-[0_0_80px_rgba(var(--primary),0.5)]",
          "transition-all duration-500"
        )}>
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
          </div>
          
          {/* Enhanced glow effects */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 blur-xl opacity-75 animate-pulse" />
          <div className="absolute -inset-2 bg-primary/20 blur-2xl opacity-50 animate-pulse" />
          
          {/* Sparkle effects */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%'
                  ],
                  y: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%'
                  ]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          <CardContent className="relative p-6 bg-background/95 backdrop-blur-xl rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-xl blur-lg animate-pulse" />
                  <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    AI Automation Builder
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to automate in plain English
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/40 animate-pulse">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    AI Powered
                  </Badge>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      NEW
                    </Badge>
                  </motion.div>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder=" "
                  className={cn(
                    "min-h-[100px] resize-none pr-14 text-base",
                    "bg-white/95 dark:bg-background/95 backdrop-blur-sm",
                    "border-2 border-primary/30 focus:border-primary",
                    "shadow-lg focus:shadow-xl",
                    "transition-all duration-300"
                  )}
                  disabled={isGenerating}
                />
                
                <AnimatePresence mode="wait">
                  {!prompt && (
                    <motion.div
                      key={currentExampleIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center px-3 pointer-events-none"
                    >
                      <p className="text-base text-muted-foreground">
                        <span className="text-sm text-primary/70">Try: </span>
                        <span className="italic">"{AI_EXAMPLES[currentExampleIndex]}"</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={cn(
                    "absolute right-3 top-3 h-10 w-10",
                    "bg-gradient-to-br from-primary to-primary/80",
                    "hover:from-primary/90 hover:to-primary/70",
                    "text-white shadow-lg hover:shadow-xl",
                    "transition-all duration-300",
                    "disabled:opacity-50"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Clickable Examples with enhanced styling */}
              <div className="flex flex-wrap gap-2">
                {AI_EXAMPLES.slice(0, 7).map((example, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        "hover:bg-primary hover:text-white hover:border-primary",
                        "text-xs py-1.5 px-3",
                        "bg-primary/10 border-primary/30",
                        "shadow-sm hover:shadow-lg"
                      )}
                      onClick={() => setPrompt(example)}
                    >
                      {example}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {generatedAutomation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-background rounded-lg border-2 border-primary/20 space-y-3">
                      <div>
                        <h4 className="font-semibold text-base">{generatedAutomation.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {generatedAutomation.description}
                        </p>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="shrink-0">Trigger</Badge>
                        <span className="pt-0.5">{generatedAutomation.trigger.name}</span>
                      </div>
                      
                      <div className="space-y-1">
                        {generatedAutomation.steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm ml-2">
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{step.name}</span>
                          </div>
                        ))}
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
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};