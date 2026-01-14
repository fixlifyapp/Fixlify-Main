import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Sparkles, MessageSquare, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOrganization } from '@/hooks/use-organization';

interface AIMessageGeneratorConfigProps {
  config: any;
  onUpdate: (config: any) => void;
  availableVariables: Array<{ name: string; label: string; type: string }>;
}

export const AIMessageGeneratorConfig: React.FC<AIMessageGeneratorConfigProps> = ({
  config,
  onUpdate,
  availableVariables
}) => {
  const { currentOrganization } = useOrganization();
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageType, setMessageType] = useState(config.messageType || 'email');
  const [tone, setTone] = useState(config.tone || 'professional');
  const [context, setContext] = useState(config.context || '');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');

  const generateMessage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-message', {
        body: {
          messageType: tone,
          context: context || `Generate a ${messageType} message`,
          userInput: '',
          hasUserInput: false,
          variables: availableVariables.slice(0, 10), // Send most relevant variables
          triggerType: config.triggerType,
          companyInfo: {
            businessType: 'service company',
            tone: tone
          },
          organization_id: currentOrganization?.id
        }
      });

      if (error) throw error;

      if (data?.message) {
        setGeneratedMessage(data.message);
        if (messageType === 'email' && data.subject) {
          setGeneratedSubject(data.subject);
        }
        
        // Update parent config
        onUpdate({
          ...config,
          messageType,
          tone,
          context,
          message: data.message,
          subject: data.subject || config.subject
        });
      }
    } catch (error) {
      console.error('Error generating AI message:', error);
      toast.error('Failed to generate message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Message Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </SelectItem>
                <SelectItem value="sms">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  SMS
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Context (Optional)</Label>
          <Textarea
            placeholder="Describe what this message should accomplish..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
        </div>

        <Button
          onClick={generateMessage}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Message
            </>
          )}
        </Button>

        {generatedMessage && (
          <div className="space-y-3 pt-4 border-t">
            {messageType === 'email' && generatedSubject && (
              <div>
                <Label>Generated Subject</Label>
                <Input
                  value={generatedSubject}
                  onChange={(e) => {
                    setGeneratedSubject(e.target.value);
                    onUpdate({ ...config, subject: e.target.value });
                  }}
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label>Generated Message</Label>
              <Textarea
                value={generatedMessage}
                onChange={(e) => {
                  setGeneratedMessage(e.target.value);
                  onUpdate({ ...config, message: e.target.value });
                }}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Available variables you can use:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableVariables.slice(0, 8).map((variable) => (
                  <code key={variable.name} className="bg-muted px-1 py-0.5 rounded text-xs">
                    {`{{${variable.name}}}`}
                  </code>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
