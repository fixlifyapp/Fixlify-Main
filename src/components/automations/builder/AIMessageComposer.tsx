
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AIMessageComposerProps {
  onMessageGenerated?: (message: string) => void;
  messageType?: 'email' | 'sms';
  context?: any;
}

const AIMessageComposer: React.FC<AIMessageComposerProps> = ({ 
  onMessageGenerated, 
  messageType = 'email',
  context 
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'casual', label: 'Casual' },
  ];

  const generateMessage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation for now
      const messages = {
        professional: "Dear [Customer Name], thank you for choosing our services. We wanted to follow up on your recent [Service Type]. If you have any questions, please don't hesitate to contact us.",
        friendly: "Hi [Customer Name]! We hope you're happy with your recent [Service Type]. We'd love to hear your feedback!",
        urgent: "URGENT: [Customer Name], we need to address an important matter regarding your [Service Type]. Please contact us immediately.",
        casual: "Hey [Customer Name], just checking in about your [Service Type]. Let us know if you need anything!"
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const message = messages[tone as keyof typeof messages] || messages.professional;
      setGeneratedMessage(message);
      onMessageGenerated?.(message);
      toast.success('Message generated successfully!');
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success('Message copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Message Composer
          </CardTitle>
          <CardDescription>
            Generate personalized {messageType} messages using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tone">Message Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt">Message Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what kind of message you want to generate..."
              rows={3}
            />
          </div>

          <Button 
            onClick={generateMessage} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Message
              <Badge variant="secondary">{tone}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{generatedMessage}</p>
            </div>
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMessageComposer;
