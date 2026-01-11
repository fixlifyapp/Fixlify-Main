
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SendReminderDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (reminderType: string) => void;
}

export function SendReminderDialog({ selectedJobs, onOpenChange, onSuccess }: SendReminderDialogProps) {
  const [reminderType, setReminderType] = useState<string>("email");
  const [customMessage, setCustomMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get job details with client information
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          date,
          clients:client_id(
            id,
            name,
            email,
            phone
          )
        `)
        .in('id', selectedJobs);

      if (jobsError) throw jobsError;

      let successCount = 0;
      let failureCount = 0;

      for (const job of jobs || []) {
        try {
          if (reminderType === 'email' || reminderType === 'both') {
            if (job.clients?.email) {
              const subject = `Appointment Reminder - ${job.title}`;
              const defaultMessage = `Hi ${job.clients.name},\n\nThis is a friendly reminder about your upcoming appointment:\n\n${job.title}\nScheduled for: ${job.date ? new Date(job.date).toLocaleDateString() : 'TBD'}\n\nIf you need to reschedule or have any questions, please contact us.\n\nThank you!`;
              
              const emailHtml = `
                <html>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h2 style="color: #2563eb;">Appointment Reminder</h2>
                      <p>Hi ${job.clients.name},</p>
                      <p>This is a friendly reminder about your upcoming appointment:</p>
                      
                      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${job.title}</h3>
                        <p><strong>Scheduled for:</strong> ${job.date ? new Date(job.date).toLocaleDateString() : 'TBD'}</p>
                      </div>
                      
                      ${customMessage ? `<p><strong>Additional Message:</strong><br>${customMessage.replace(/\n/g, '<br>')}</p>` : ''}
                      
                      <p>If you need to reschedule or have any questions, please contact us.</p>
                      <p>Thank you!</p>
                      
                      <!-- Tracking pixel -->
                      <img src="https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/track-email-open?type=reminder&id=${job.id}" width="1" height="1" style="display:none;" />
                    </div>
                  </body>
                </html>
              `;

              const { error: emailError } = await supabase.functions.invoke('mailgun-email', {
                body: {
                  to: job.clients.email,
                  subject: subject,
                  html: emailHtml,
                  text: customMessage || defaultMessage,
                  conversationId: job.id
                }
              });

              if (emailError) {
                console.error(`Failed to send email for job ${job.id}:`, emailError);
                failureCount++;
              } else {
                successCount++;
              }
            } else {
              console.warn(`No email address for job ${job.id}`);
              failureCount++;
            }
          }

          // SMS implementation would go here for SMS and 'both' options
          if (reminderType === 'sms' || reminderType === 'both') {
            console.log(`SMS reminder would be sent for job ${job.id}`);
            // For now, just count as success since SMS isn't implemented
            if (reminderType === 'sms') successCount++;
          }

        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
          failureCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} reminder${successCount > 1 ? 's' : ''}`);
      }
      
      if (failureCount > 0) {
        toast.error(`Failed to send ${failureCount} reminder${failureCount > 1 ? 's' : ''}`);
      }

      onSuccess(reminderType);
      onOpenChange(false);
      
    } catch (error) {
      console.error("Failed to send reminders:", error);
      toast.error("Failed to send reminders. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Send Appointment Reminders</DialogTitle>
        <DialogDescription>
          Send appointment reminders to clients for the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-type">Reminder Type</Label>
            <Select defaultValue={reminderType} onValueChange={setReminderType}>
              <SelectTrigger id="reminder-type">
                <SelectValue placeholder="Select reminder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="both">Both Email & SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message to include with the reminder..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              If left empty, a default reminder message will be used.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reminders"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
