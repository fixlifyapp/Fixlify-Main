
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Search, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  is_default: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateSelectorProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  children: React.ReactNode;
}

export const EmailTemplateSelector = ({ onSelectTemplate, children }: EmailTemplateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_message_templates')
        .select('*')
        .eq('type', 'email')
        .order('name');

      if (error) throw error;

      // Transform data to match our interface
      const transformedTemplates: EmailTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        subject: template.subject || '',
        content: template.content,
        variables: Array.isArray(template.variables) 
          ? template.variables.map(v => typeof v === 'string' ? v : JSON.stringify(v))
          : [],
        category: template.category || 'general',
        is_default: template.is_default || false,
        use_count: template.use_count || 0,
        created_at: template.created_at,
        updated_at: template.updated_at,
      }));

      setTemplates(transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'estimate':
        return 'bg-blue-500';
      case 'invoice':
        return 'bg-green-500';
      case 'followup':
        return 'bg-orange-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Select Email Template</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">Loading templates...</div>
            ) : (
              <div className="grid gap-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">
                            {template.subject}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                          {template.is_default && (
                            <Badge variant="outline">Default</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm line-clamp-2">{template.content}</p>
                        
                        {template.variables.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 5).map((variable, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                            {template.variables.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.variables.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Used {template.use_count} times
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSelectTemplate(template)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredTemplates.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No templates found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || categoryFilter !== 'all' 
                          ? 'No templates match your filters'
                          : 'Create your first email template'
                        }
                      </p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
