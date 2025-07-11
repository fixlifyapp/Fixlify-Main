
import React, { useState, useRef } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAI } from '@/hooks/use-ai';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Variable, 
  Wand2, 
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface AIMessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  messageType: 'sms' | 'email';
  contextData?: any;
}

export const AIMessageComposer = ({ 
  value, 
  onChange, 
  messageType, 
  contextData = {} 
}: AIMessageComposerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateText } = useAI({
    systemContext: `You are an expert at writing professional ${messageType === 'sms' ? 'SMS messages' : 'email content'} for field service businesses. Keep messages professional, helpful, and action-oriented. ${messageType === 'sms' ? 'Keep SMS messages under 160 characters when possible.' : 'For emails, include proper formatting and structure.'}`
  });

  const availableVariables = [
    { key: 'client_name', label: 'Client Name', icon: User, example: 'John Smith' },
    { key: 'client_phone', label: 'Client Phone', icon: Phone, example: '(555) 123-4567' },
    { key: 'client_email', label: 'Client Email', icon: User, example: 'john@example.com' },
    { key: 'client_address', label: 'Client Address', icon: MapPin, example: '123 Main St' },
    { key: 'job_id', label: 'Job ID', icon: MessageSquare, example: 'JOB-001' },
    { key: 'job_title', label: 'Job Title', icon: MessageSquare, example: 'HVAC Repair' },
    { key: 'job_status', label: 'Job Status', icon: MessageSquare, example: 'Scheduled' },
    { key: 'scheduled_date', label: 'Scheduled Date', icon: Calendar, example: 'March 15, 2024' },
    { key: 'scheduled_time', label: 'Scheduled Time', icon: Clock, example: '2:00 PM' },
    { key: 'total_amount', label: 'Total Amount', icon: DollarSign, example: '$450.00' },
    { key: 'company_name', label: 'Company Name', icon: MessageSquare, example: 'Fixlify Services' },
    { key: 'company_phone', label: 'Company Phone', icon: Phone, example: '(555) 987-6543' }
  ];

  const handleGenerateMessage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for message generation');
      return;
    }

    setIsGenerating(true);
    try {
      const contextPrompt = `
Generate a professional ${messageType} message for a field service business.

Requirements:
- ${messageType === 'sms' ? 'Keep it concise (under 160 characters if possible)' : 'Include proper email structure with subject and body'}
- Include relevant variables using {{variable_name}} format
- Be professional and helpful
- Include a clear call to action

Context: ${aiPrompt}

Available variables: ${availableVariables.map(v => `{{${v.key}}}`).join(', ')}

Example context data:
${JSON.stringify({
  client_name: 'John Smith',
  job_title: 'HVAC System Repair',
  scheduled_date: 'Tomorrow',
  scheduled_time: '2:00 PM',
  company_name: 'Fixlify Services'
}, null, 2)}
`;

      const generatedMessage = await generateText(contextPrompt);
      
      if (generatedMessage) {
        onChange(generatedMessage);
        setSuggestions([generatedMessage]);
        toast.success('Message generated successfully');
      }
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!value.trim()) {
      toast.error('Please enter a base message first');
      return;
    }

    setIsGenerating(true);
    try {
      const variationPrompt = `
Create 3 variations of this ${messageType} message, each with a different tone but maintaining professionalism:

Original message: "${value}"

Generate:
1. A friendly/casual version
2. A formal/professional version  
3. A urgent/action-oriented version

Each should use the same variables and maintain the same core message.
`;

      const variations = await generateText(variationPrompt);
      
      if (variations) {
        const variationList = variations.split('\n\n').filter(v => v.trim());
        setSuggestions(variationList);
        toast.success('Message variations generated');
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error('Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;
    const newValue = currentValue.substring(0, start) + `{{${variableKey}}}` + currentValue.substring(end);
    
    onChange(newValue);

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.setSelectionRange(start + variableKey.length + 4, start + variableKey.length + 4);
      textarea.focus();
    }, 0);
  };

  const previewMessage = () => {
    const sampleData = {
      client_name: 'John Smith',
      client_phone: '(555) 123-4567',
      client_email: 'john@example.com',
      client_address: '123 Main St, Anytown, USA',
      job_id: 'JOB-001',
      job_title: 'HVAC System Repair',
      job_status: 'Scheduled',
      scheduled_date: 'March 15, 2024',
      scheduled_time: '2:00 PM',
      total_amount: '$450.00',
      company_name: 'Fixlify Services',
      company_phone: '(555) 987-6543'
    };

    let preview = value;
    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, sampleData[key]);
    });

    return preview;
  };

  return (
    <div className="space-y-6">
      {/* AI Generation */}
      <ModernCard variant="elevated">
        <ModernCardHeader>
          <ModernCardTitle>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Message Generator
            </div>
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Describe the message you want to generate:
            </label>
            <Input
              placeholder="e.g., Send appointment reminder for tomorrow's HVAC repair visit"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <GradientButton
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="flex-1"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Message
            </GradientButton>
            
            <Button
              variant="outline"
              onClick={handleGenerateVariations}
              disabled={isGenerating || !value.trim()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Variations
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Message Editor */}
      <ModernCard variant="elevated">
        <ModernCardHeader>
          <ModernCardTitle>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message Content
            </div>
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={messageType === 'sms' 
              ? "Enter your SMS message... Use {{client_name}} for variables"
              : "Enter your email content... Use {{client_name}} for variables"
            }
            className="min-h-32"
          />
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Characters: {value.length}
              {messageType === 'sms' && value.length > 160 && (
                <Badge variant="destructive" className="ml-2">
                  Over SMS limit
                </Badge>
              )}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(value);
                toast.success('Message copied to clipboard');
              }}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Variables */}
      <ModernCard variant="elevated">
        <ModernCardHeader>
          <ModernCardTitle>
            <div className="flex items-center gap-2">
              <Variable className="w-4 h-4" />
              Available Variables
            </div>
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableVariables.map((variable) => {
              const IconComponent = variable.icon;
              return (
                <Button
                  key={variable.key}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable.key)}
                  className="justify-start h-auto p-3 hover:bg-fixlyfy/5 hover:border-fixlyfy"
                >
                  <IconComponent className="w-4 h-4 mr-2 text-fixlyfy" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {variable.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {`{{${variable.key}}}`}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Preview */}
      {value && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle>Message Preview</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {previewMessage()}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Preview uses sample data. Actual messages will use real client information.
            </p>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <ModernCard variant="elevated">
          <ModernCardHeader>
            <ModernCardTitle>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </div>
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onChange(suggestion)}
              >
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {suggestion}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Click to use this message
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(suggestion);
                      toast.success('Suggestion copied');
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  );
};
