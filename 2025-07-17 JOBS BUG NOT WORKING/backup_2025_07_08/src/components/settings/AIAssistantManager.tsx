
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Save, Eye, Wand2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface AITemplate {
  id: string;
  name: string;
  description: string;
  base_prompt: string;
  variables: string[];
  category: string;
  is_default: boolean;
}

interface AIConfig {
  id?: string;
  agent_name: string;
  base_prompt: string;
  voice_id: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  business_niche: string;
}

export const AIAssistantManager = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    agent_name: 'AI Assistant',
    base_prompt: '',
    voice_id: 'alloy',
    diagnostic_price: 75,
    emergency_surcharge: 50,
    business_niche: 'General Service'
  });
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadAIConfig();
  }, []);

  useEffect(() => {
    if (aiConfig.base_prompt) {
      generatePreview();
    }
  }, [aiConfig]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_assistant_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      // Properly handle the Json type for variables
      const processedTemplates: AITemplate[] = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables as string[]
          : typeof template.variables === 'string'
          ? JSON.parse(template.variables)
          : []
      }));
      
      setTemplates(processedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load AI templates');
    }
  };

  const loadAIConfig = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAiConfig({
          id: data.id,
          agent_name: data.agent_name || 'AI Assistant',
          base_prompt: data.base_prompt || '',
          voice_id: data.voice_id || 'alloy',
          diagnostic_price: data.diagnostic_price || 75,
          emergency_surcharge: data.emergency_surcharge || 50,
          business_niche: data.business_niche || 'General Service'
        });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      // Get company settings for variables
      const { data: companyData } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Get job types
      const { data: jobTypes } = await supabase
        .from('job_types')
        .select('name')
        .eq('created_by', user?.id);

      const variables = {
        company_name: companyData?.company_name || 'Your Company',
        agent_name: aiConfig.agent_name,
        business_type: companyData?.business_type || aiConfig.business_niche,
        diagnostic_price: aiConfig.diagnostic_price.toString(),
        emergency_surcharge: aiConfig.emergency_surcharge.toString(),
        service_areas: 'your local area',
        business_hours: 'Monday-Friday 8AM-5PM',
        job_types: jobTypes?.map(jt => jt.name).join(', ') || 'various services'
      };

      let preview = aiConfig.base_prompt;
      Object.entries(variables).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      setPreviewPrompt(preview);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setAiConfig(prev => ({
        ...prev,
        base_prompt: template.base_prompt
      }));
      toast.success(`Applied template: ${template.name}`);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      if (aiConfig.id) {
        // Update existing config
        const { error } = await supabase
          .from('ai_agent_configs')
          .update({
            agent_name: aiConfig.agent_name,
            base_prompt: aiConfig.base_prompt,
            voice_id: aiConfig.voice_id,
            diagnostic_price: aiConfig.diagnostic_price,
            emergency_surcharge: aiConfig.emergency_surcharge,
            business_niche: aiConfig.business_niche,
            updated_at: new Date().toISOString()
          })
          .eq('id', aiConfig.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .insert({
            user_id: user.id,
            agent_name: aiConfig.agent_name,
            base_prompt: aiConfig.base_prompt,
            voice_id: aiConfig.voice_id,
            diagnostic_price: aiConfig.diagnostic_price,
            emergency_surcharge: aiConfig.emergency_surcharge,
            business_niche: aiConfig.business_niche
          })
          .select()
          .single();

        if (error) throw error;
        setAiConfig(prev => ({ ...prev, id: data.id }));
      }

      toast.success('AI Assistant configuration saved successfully');
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error('Failed to save AI configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Professional)' },
    { value: 'echo', label: 'Echo (Friendly)' },
    { value: 'fable', label: 'Fable (Warm)' },
    { value: 'onyx', label: 'Onyx (Authoritative)' },
    { value: 'nova', label: 'Nova (Energetic)' },
    { value: 'shimmer', label: 'Shimmer (Clear)' }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading AI Assistant configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Choose a Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a prompt template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.name}</span>
                      {template.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Start with a pre-built template or create your own custom prompt
            </p>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                value={aiConfig.agent_name}
                onChange={(e) => setAiConfig(prev => ({ ...prev, agent_name: e.target.value }))}
                placeholder="AI Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label>Voice</Label>
              <Select 
                value={aiConfig.voice_id} 
                onValueChange={(value) => setAiConfig(prev => ({ ...prev, voice_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      {voice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Diagnostic Price ($)</Label>
              <Input
                type="number"
                value={aiConfig.diagnostic_price}
                onChange={(e) => setAiConfig(prev => ({ ...prev, diagnostic_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Surcharge ($)</Label>
              <Input
                type="number"
                value={aiConfig.emergency_surcharge}
                onChange={(e) => setAiConfig(prev => ({ ...prev, emergency_surcharge: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Input
                value={aiConfig.business_niche}
                onChange={(e) => setAiConfig(prev => ({ ...prev, business_niche: e.target.value }))}
                placeholder="HVAC, Plumbing, etc."
              />
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-3">
            <Label>Custom Prompt</Label>
            <Textarea
              value={aiConfig.base_prompt}
              onChange={(e) => setAiConfig(prev => ({ ...prev, base_prompt: e.target.value }))}
              placeholder="Enter your custom AI assistant prompt..."
              className="min-h-32"
            />
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              <span>Available variables:</span>
              {['{company_name}', '{agent_name}', '{business_type}', '{diagnostic_price}', '{emergency_surcharge}', '{service_areas}', '{business_hours}', '{job_types}'].map(variable => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewPrompt && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview with Current Data
              </Label>
              <div className="bg-muted p-4 rounded-lg text-sm">
                {previewPrompt}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </Button>
            <Button variant="outline" onClick={generatePreview} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Update Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
