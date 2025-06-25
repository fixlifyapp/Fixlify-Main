
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  MessageSquare,
  Zap,
  User,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIMessageComposerProps {
  onMessageGenerated: (message: string) => void;
}

export const AIMessageComposer = ({ onMessageGenerated }: AIMessageComposerProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const availableVariables = [
    { name: 'client_name', icon: User, description: 'Client full name' },
    { name: 'client_phone', icon: MessageSquare, description: 'Client phone number' },
    { name: 'client_email', icon: MessageSquare, description: 'Client email address' },
    { name: 'job_title', icon: Zap, description: 'Job or service title' },
    { name: 'scheduled_date', icon: Calendar, description: 'Appointment date' },
    { name: 'scheduled_time', icon: Calendar, description: 'Appointment time' },
    { name: 'total_amount', icon: DollarSign, description: 'Total job cost' },
    { name: 'job_address', icon: MapPin, description: 'Job location' }
  ];

  const quickPrompts = [
    'Write a friendly appointment reminder SMS',
    'Create a professional job completion follow-up email',
    'Generate a payment reminder message',
    'Write a thank you message after service completion',
    'Create a message for rescheduling appointments'
  ];

  const generateMessage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to generate a message');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-message', {
        body: { 
          prompt: prompt,
          context: 'automation_message',
          variables: availableVariables.map(v => v.name)
        }
      });

      if (error) {
        console.error('AI generation error:', error);
        toast.error('Failed to generate message with AI');
        return;
      }

      if (data?.message) {
        setGeneratedMessage(data.message);
        toast.success('AI message generated successfully!');
      } else {
        toast.error('No message was generated');
      }
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast.error('Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    if (generatedMessage) {
      setGeneratedMessage(prev => prev + ' ' + variable);
    } else {
      setPrompt(prev => prev + ` Include ${variable} in the message`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const useGeneratedMessage = () => {
    if (generatedMessage) {
      onMessageGenerated(generatedMessage);
      setGeneratedMessage('');
      setPrompt('');
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50/50 to-white border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          AI Message Composer
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by OpenAI
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Prompts */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Prompts</label>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((quickPrompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(quickPrompt)}
                className="text-xs border-purple-200 hover:border-purple-300 hover:bg-purple-50"
              >
                {quickPrompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Describe the message you want to create
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Write a friendly SMS reminder for customers about their appointment tomorrow, include their name and appointment time"
            className="min-h-[80px] border-purple-200 focus:border-purple-300 focus:ring-purple-200"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateMessage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Message
            </>
          )}
        </Button>

        {/* Generated Message */}
        {generatedMessage && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">Generated Message</label>
            <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
              <p className="text-gray-800 whitespace-pre-wrap">{generatedMessage}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedMessage)}
                className="absolute top-2 right-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={useGeneratedMessage}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Use This Message
              </Button>
              <Button
                variant="outline"
                onClick={generateMessage}
                disabled={isGenerating}
                className="border-purple-200 hover:border-purple-300"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Available Variables */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Available Variables</label>
          <div className="grid grid-cols-2 gap-2">
            {availableVariables.map((variable) => (
              <Button
                key={variable.name}
                variant="outline"
                size="sm"
                onClick={() => insertVariable(variable.name)}
                className="justify-start text-xs border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                title={variable.description}
              >
                <variable.icon className="w-3 h-3 mr-1" />
                {`{{${variable.name}}}`}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
