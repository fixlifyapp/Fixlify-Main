
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Info, Play } from "lucide-react";
import { toast } from "sonner";

interface GreetingTemplateEditorProps {
  greetingTemplate: string;
  onTemplateChange: (template: string) => void;
  agentName: string;
  companyName: string;
  businessType: string;
}

const TEMPLATE_VARIABLES = [
  { key: '{agent_name}', description: 'AI agent name' },
  { key: '{company_name}', description: 'Company name' },
  { key: '{business_type}', description: 'Type of business' },
  { key: '{time_of_day}', description: 'Morning/Afternoon/Evening' }
];

const PRESET_TEMPLATES = [
  {
    name: 'Professional',
    template: 'Hello, my name is {agent_name}. I\'m an AI assistant for {company_name}. How can I help you today?'
  },
  {
    name: 'Friendly',
    template: 'Hi there! I\'m {agent_name}, your friendly AI assistant from {company_name}. What can I do for you today?'
  },
  {
    name: 'Service-Focused',
    template: 'Good {time_of_day}! This is {agent_name} from {company_name}. I\'m here to help with your {business_type} needs. How may I assist you?'
  },
  {
    name: 'Emergency Ready',
    template: 'Hello, I\'m {agent_name} from {company_name}. If this is an emergency, I can connect you immediately. Otherwise, how can I help you today?'
  }
];

export const GreetingTemplateEditor = ({ 
  greetingTemplate, 
  onTemplateChange, 
  agentName, 
  companyName, 
  businessType 
}: GreetingTemplateEditorProps) => {
  const [previewGreeting, setPreviewGreeting] = useState('');

  const generatePreview = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';
    
    const preview = greetingTemplate
      .replace(/{agent_name}/g, agentName || 'AI Assistant')
      .replace(/{company_name}/g, companyName || 'our company')
      .replace(/{business_type}/g, businessType || 'service')
      .replace(/{time_of_day}/g, timeOfDay);
    
    setPreviewGreeting(preview);
    toast.success('Preview generated! See below how your greeting will sound.');
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('greeting-template') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = greetingTemplate.substring(0, start) + variable + greetingTemplate.substring(end);
      onTemplateChange(newValue);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const usePresetTemplate = (template: string) => {
    onTemplateChange(template);
    toast.success('Template applied!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Greeting Template Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Templates */}
        <div>
          <Label className="text-sm font-medium">Quick Templates</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {PRESET_TEMPLATES.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => usePresetTemplate(preset.template)}
                className="justify-start text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {preset.template.substring(0, 40)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Template Variables */}
        <div>
          <Label className="text-sm font-medium">Available Variables</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TEMPLATE_VARIABLES.map((variable) => (
              <Button
                key={variable.key}
                variant="secondary"
                size="sm"
                onClick={() => insertVariable(variable.key)}
                className="gap-1"
              >
                <Badge variant="outline" className="text-xs">
                  {variable.key}
                </Badge>
                <span className="text-xs">{variable.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div>
          <Label htmlFor="greeting-template">Greeting Template</Label>
          <Textarea
            id="greeting-template"
            value={greetingTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            placeholder="Enter your custom greeting template..."
            rows={4}
            className="mt-1"
          />
          <div className="flex items-center gap-2 mt-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              Use variables like {TEMPLATE_VARIABLES[0].key} to personalize your greeting
            </span>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button onClick={generatePreview} size="sm" className="gap-2">
              <Play className="h-3 w-3" />
              Generate Preview
            </Button>
          </div>
          
          {previewGreeting && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Label className="text-sm font-medium text-green-800">Preview:</Label>
              <p className="text-green-700 mt-1 italic">"{previewGreeting}"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
