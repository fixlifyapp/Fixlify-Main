import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Send, CheckCircle, XCircle, Loader2, Paperclip } from 'lucide-react'
import { useAuthState } from '@/hooks/useAuthState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EmailTestComponent() {
  const { user } = useAuthState()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('Test Email from Fixlify')
  const [message, setMessage] = useState('')
  const [template, setTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const templates = [
    { value: '', label: 'No template (custom message)' },
    { value: 'estimate_ready_email', label: 'Estimate Ready' },
    { value: 'invoice_ready_email', label: 'Invoice Ready' },
    { value: 'payment_received_email', label: 'Payment Received' },
    { value: 'appointment_reminder_email', label: 'Appointment Reminder' },
    { value: 'job_update_email', label: 'Job Update' }
  ]

  const sendTestEmail = async () => {
    if (!to || !subject) {
      setResult({
        success: false,
        message: 'Please enter email address and subject'
      })
      return
    }

    if (!template && !message) {
      setResult({
        success: false,
        message: 'Please enter a message or select a template'
      })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const body: any = {
        to,
        subject,
        metadata: { 
          test: true,
          source: 'email-test-component'
        }
      }

      if (template) {
        // Use template
        body.template = template
        body.variables = {
          client_name: 'Test Customer',
          estimate_number: 'EST-001',
          invoice_number: 'INV-001',
          amount: '$100.00',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          link: 'https://example.com/test-link',
          company_name: 'Test Company',
          date: new Date().toLocaleDateString(),
          time: '2:00 PM',
          service: 'Test Service',
          location: '123 Test St',
          job_type: 'Test Job',
          status: 'In Progress',
          message: 'This is a test update',
          payment_date: new Date().toLocaleDateString()
        }
      } else {
        // Custom message
        body.html = message.replace(/\n/g, '<br>')
        body.text = message
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body
      })

      if (error) throw error

      setResult({
        success: true,
        message: 'Email sent successfully!',
        details: data
      })
    } catch (error: any) {
      console.error('Email send error:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to send email',
        details: error
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Test Tool
        </CardTitle>
        <CardDescription>
          Test email sending functionality with Mailgun
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">To Email</Label>
          <Input
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Email subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Template (Optional)</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {template && (
            <p className="text-sm text-muted-foreground">
              Template will use test data for variables
            </p>
          )}
        </div>
        
        {!template && (
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              placeholder="Enter your email message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
            <p className="text-sm text-muted-foreground">
              HTML is supported. Line breaks will be converted to &lt;br&gt; tags.
            </p>
          </div>
        )}
        
        <Button 
          onClick={sendTestEmail} 
          disabled={sending || !to || !subject || (!message && !template)}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </>
          )}
        </Button>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription>{result.message}</AlertDescription>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer">
                      View details
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Prerequisites:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mailgun API credentials must be configured</li>
            <li>• Mailgun domain must be verified</li>
            <li>• Recipient email must be valid</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
