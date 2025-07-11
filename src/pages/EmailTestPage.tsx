import { EmailTestComponent } from '@/components/test/EmailTestComponent'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmailTestPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold">Email Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test email functionality with templates and custom messages
        </p>
      </div>

      <div className="grid gap-6">
        <EmailTestComponent />
        
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Integration Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Database schema deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Email edge function created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Email templates ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Webhook handler ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Waiting for first test</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">Available Templates</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Estimate Ready:</strong> Professional email for sending estimates</li>
            <li><strong>Invoice Ready:</strong> Professional email for sending invoices</li>
            <li><strong>Payment Received:</strong> Thank you email with receipt</li>
            <li><strong>Appointment Reminder:</strong> Reminder with date/time/location</li>
            <li><strong>Job Update:</strong> Status update for ongoing jobs</li>
          </ul>
        </div>

        <div className="mt-4 p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Test sending an email with a template</li>
            <li>Test custom HTML email</li>
            <li>Check communication logs in database</li>
            <li>Verify Mailgun webhook integration</li>
            <li>Test email delivery tracking</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
