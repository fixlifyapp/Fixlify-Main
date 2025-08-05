import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Lightbulb, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowSuggestion {
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  benefits: string;
}

interface AIWorkflowAssistantProps {
  onCreateWorkflow: (workflow: any) => void;
  businessType?: string;
}

export const AIWorkflowAssistant: React.FC<AIWorkflowAssistantProps> = ({ 
  onCreateWorkflow, 
  businessType = 'Service Business' 
}) => {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [generatedTrigger, setGeneratedTrigger] = useState<any>(null);

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workflow-assistant', {
        body: {
          type: 'suggest_workflows',
          context: { businessType }
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuggestions(data.data);
        toast.success('AI generated workflow suggestions!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateTriggerFromText = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workflow-assistant', {
        body: {
          type: 'generate_trigger',
          context: { userInput: naturalLanguageInput }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedTrigger(data.data);
        toast.success('AI converted your text to a trigger!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating trigger:', error);
      toast.error('Failed to generate trigger');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflowFromSuggestion = (suggestion: WorkflowSuggestion) => {
    const workflow = {
      name: suggestion.name,
      description: suggestion.description,
      trigger: {
        type: suggestion.trigger,
        conditions: {}
      },
      actions: suggestion.actions.map(action => ({
        type: action.toLowerCase().replace(/ /g, '_'),
        config: {}
      })),
      enabled: true
    };
    
    onCreateWorkflow(workflow);
    toast.success(`Created workflow: ${suggestion.name}`);
  };

  const createWorkflowFromTrigger = () => {
    if (!generatedTrigger) return;
    
    const workflow = {
      name: `Auto: ${generatedTrigger.description}`,
      description: generatedTrigger.description,
      trigger: {
        type: generatedTrigger.trigger_type,
        conditions: generatedTrigger.conditions || {}
      },
      actions: [],
      enabled: true
    };
    
    onCreateWorkflow(workflow);
    toast.success('Created workflow from natural language!');
    setNaturalLanguageInput('');
    setGeneratedTrigger(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Workflow Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="natural" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Natural Language
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Get AI-powered workflow suggestions for your {businessType}
              </p>
              <Button 
                onClick={getSuggestions}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Get AI Suggestions
              </Button>
            </div>

            <div className="grid gap-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{suggestion.name}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => createWorkflowFromSuggestion(suggestion)}
                          className="flex items-center gap-1"
                        >
                          <Wand2 className="h-3 w-3" />
                          Create
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Trigger: {suggestion.trigger}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.actions.map((action, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          💡 {suggestion.benefits}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="natural" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Describe what you want to automate in plain English
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 'Send welcome email when new customer signs up'"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateTriggerFromText()}
                />
                <Button 
                  onClick={generateTriggerFromText}
                  disabled={loading || !naturalLanguageInput.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
            </div>

            {generatedTrigger && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-green-700">Generated Trigger</h4>
                        <p className="text-sm text-muted-foreground">{generatedTrigger.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={createWorkflowFromTrigger}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Create Workflow
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      {generatedTrigger.trigger_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">AI Templates Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Industry-specific workflow templates powered by AI
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};