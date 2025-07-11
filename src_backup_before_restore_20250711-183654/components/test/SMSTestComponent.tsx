import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuthState } from '@/hooks/useAuthState'

export function SMSTestComponent() {
  const { user } = useAuthState()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('Test SMS from Fixlify - Your estimate is ready!')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const sendTestSMS = async () => {
    if (!phoneNumber || !message) {
      setResult({
        success: false,
        message: 'Please enter both phone number and message'
      })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: phoneNumber,
          message: message,
          metadata: { 
            test: true,
            source: 'sms-test-component'
          }
        }
      })

      if (error) throw error

      setResult({
        success: true,
        message: 'SMS sent successfully!',
        details: data
      })
    } catch (error: any) {
      console.error('SMS send error:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to send SMS',
        details: error
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          SMS Test Tool
        </CardTitle>
        <CardDescription>
          Test SMS sending functionality with Telnyx
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={sending}
          />
          <p className="text-sm text-muted-foreground">
            Include country code (e.g., +1 for US)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            maxLength={160}
          />
          <p className="text-sm text-muted-foreground">
            {message.length}/160 characters
          </p>
        </div>
        
        <Button 
          onClick={sendTestSMS} 
          disabled={sending || !phoneNumber || !message}
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
              Send Test SMS
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
            <li>• You must have a Telnyx phone number assigned</li>
            <li>• Telnyx API credentials must be configured</li>
            <li>• Recipient must have a valid phone number</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}