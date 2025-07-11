
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Variable {
  name: string;
  description: string;
  example: string;
}

const availableVariables: Variable[] = [
  {
    name: '{company_name}',
    description: 'Your company name from company settings',
    example: 'ABC HVAC Services'
  },
  {
    name: '{agent_name}',
    description: 'The AI agent name you configured',
    example: 'Sarah'
  },
  {
    name: '{business_type}',
    description: 'Your business type/niche',
    example: 'HVAC and Plumbing Services'
  },
  {
    name: '{diagnostic_price}',
    description: 'Your diagnostic fee amount',
    example: '75'
  },
  {
    name: '{emergency_surcharge}',
    description: 'Emergency service surcharge',
    example: '50'
  },
  {
    name: '{service_areas}',
    description: 'Areas where you provide service',
    example: 'San Francisco, Oakland, San Jose'
  },
  {
    name: '{business_hours}',
    description: 'Your business operating hours',
    example: 'Monday-Friday 8AM-5PM'
  },
  {
    name: '{job_types}',
    description: 'Types of services you offer',
    example: 'HVAC Repair, Plumbing, Electrical'
  }
];

export const AIVariablesHelp = () => {
  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast.success(`Copied ${variable} to clipboard`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Available Variables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use these variables in your AI Assistant prompt. They will be automatically replaced with your actual business data when calls are handled.
        </p>
        
        <div className="space-y-3">
          {availableVariables.map((variable) => (
            <div key={variable.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className="font-mono cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => copyVariable(variable.name)}
                  >
                    {variable.name}
                  </Badge>
                  <Copy className="h-3 w-3 text-muted-foreground cursor-pointer" onClick={() => copyVariable(variable.name)} />
                </div>
                <p className="text-sm text-muted-foreground">{variable.description}</p>
                <p className="text-xs text-green-600 mt-1">Example: "{variable.example}"</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Variables are case-sensitive and must include the curly braces {}</li>
            <li>• Update your company settings to ensure variables show correct information</li>
            <li>• Use the preview feature to see how your prompt looks with real data</li>
            <li>• Keep prompts conversational and professional for best results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
