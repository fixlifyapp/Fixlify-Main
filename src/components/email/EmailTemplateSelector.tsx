
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Eye, Edit } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  is_default: boolean;
  description?: string;
  tone?: string;
  preview_text?: string;
}

interface EmailTemplateSelectorProps {
  onTemplateSelect: (template: EmailTemplate) => void;
  selectedTemplate?: EmailTemplate;
  category?: string;
}

export const EmailTemplateSelector = ({ 
  onTemplateSelect, 
  selectedTemplate, 
  category = "general" 
}: EmailTemplateSelectorProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('automation_message_templates')
        .select('*')
        .eq('type', 'email')
        .eq('category', selectedCategory)
        .order('name');

      if (error) throw error;

      // Transform the data to match our interface
      const transformedTemplates: EmailTemplate[] = (data || []).map(template => {
        let variables: string[] = [];
        
        // Handle different types of variables data
        if (Array.isArray(template.variables)) {
          variables = template.variables.map(v => String(v));
        } else if (typeof template.variables === 'string') {
          variables = [template.variables];
        } else if (template.variables) {
          // If it's an object or other type, convert to string
          variables = [String(template.variables)];
        }

        return {
          id: template.id,
          name: template.name,
          subject: template.subject || '',
          content: template.content,
          category: template.category || 'general',
          variables: variables,
          is_default: template.is_default || false,
          description: template.description || undefined,
          tone: template.tone || undefined,
          preview_text: template.preview_text || undefined,
        };
      });

      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'service', label: 'Service' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found for this category</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.is_default && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                    {template.description && (
                      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
