
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Phone, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const AmazonConnectFlowInstructions: React.FC = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const lambdaArn = "arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:handle-ai-voice-call";
  const mediaStreamEndpoint = "wss://mqppvcrlvsgrsqelglod.functions.supabase.co/amazon-connect-media-bridge";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Amazon Connect Flow Configuration
            </CardTitle>
            <Badge variant="default">Media Streaming Ready</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Flow Setup Instructions</h3>
              <p className="text-blue-800 text-sm">
                Follow these steps to create your Amazon Connect Contact Flow with AI Media Streaming integration.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700">Step 1: Set Contact Attributes</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add a "Set contact attributes" block with these attributes:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• <code>customerPhone</code>: <code>$.CustomerEndpoint.Address</code></li>
                  <li>• <code>instanceId</code>: <code>$.ContactData.InstanceId</code></li>
                  <li>• <code>contactId</code>: <code>$.ContactData.ContactId</code></li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700">Step 2: Invoke AWS Lambda</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add an "Invoke AWS Lambda function" block:
                </p>
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <code className="text-sm">{lambdaArn}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(lambdaArn, "Lambda ARN")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Replace YOUR_ACCOUNT with your actual AWS account ID
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-700">Step 3: Start Media Streaming</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add a "Start media streaming" block with these settings:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• <strong>Stream Name:</strong> <code>ai-realtime-stream</code></li>
                  <li>• <strong>Data retention:</strong> <code>Disabled</code></li>
                  <li>• <strong>Media streaming to:</strong> <code>Customer and Agent</code></li>
                </ul>
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">{mediaStreamEndpoint}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(mediaStreamEndpoint, "Media Stream Endpoint")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-700">Step 4: Play TTS Greeting</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add a "Play prompt" block:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• <strong>Text-to-speech:</strong> <code>$.External.greeting</code></li>
                  <li>• <strong>Voice:</strong> <code>$.External.voiceConfig.voiceId</code></li>
                  <li>• <strong>Engine:</strong> <code>Neural</code></li>
                </ul>
              </div>

              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="font-semibold text-teal-700">Step 5: Wait and Loop</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add a "Wait" block followed by a "Loop prompts" to keep the media stream active:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• <strong>Wait timeout:</strong> <code>30 seconds</code></li>
                  <li>• <strong>Loop condition:</strong> Media streaming is active</li>
                  <li>• <strong>Success path:</strong> Continue waiting</li>
                  <li>• <strong>Timeout path:</strong> Check for transfer or end call</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-700">Step 6: End Conditions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add termination blocks:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• <strong>Transfer to queue:</strong> When AI requests transfer</li>
                  <li>• <strong>Stop media streaming:</strong> Before ending call</li>
                  <li>• <strong>Disconnect/hang up:</strong> End the call gracefully</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Ensure your Lambda function has the correct IAM permissions</li>
                  <li>• Test the media streaming endpoint before deploying to production</li>
                  <li>• Monitor call logs in the Connect dashboard for debugging</li>
                  <li>• The AI will handle conversation flow through media streaming</li>
                  <li>• Transfer requests will automatically route to your agent queue</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('https://docs.aws.amazon.com/connect/latest/adminguide/contact-flow-logs.html', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Flow Docs
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://docs.aws.amazon.com/connect/latest/adminguide/media-streaming.html', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Media Streaming Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
