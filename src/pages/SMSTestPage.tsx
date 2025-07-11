import { SMSTestComponent } from '@/components/test/SMSTestComponent'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SMSTestPage() {
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
        
        <h1 className="text-3xl font-bold">SMS Testing</h1>
        <p className="text-muted-foreground mt-2">
          Test SMS functionality before integrating into the app
        </p>
      </div>

      <div className="grid gap-6">
        <SMSTestComponent />
        
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Integration Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Database schema deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>SMS edge function created</span>
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
          <h3 className="font-semibold mb-3">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Test sending an SMS to verify everything works</li>
            <li>Check communication logs in database</li>
            <li>Integrate SMS sending into estimates</li>
            <li>Add SMS option to invoices</li>
            <li>Implement email functionality</li>
          </ol>
        </div>
      </div>
    </div>
  )
}