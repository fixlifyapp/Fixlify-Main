
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Plus, Search, Edit, Copy } from 'lucide-react';
import { toast } from 'sonner';

type CommunicationType = 'email' | 'sms';
type CommunicationCategory = 'estimate' | 'invoice' | 'followup' | 'reminder' | 'general';

interface CommunicationTemplate {
  id: string;
  name: string;
  type: CommunicationType;
  subject: string;
  content: string;
  variables: string[];
  category: CommunicationCategory;
  content_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CommunicationTemplates = () => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_message_templates')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform data to match our interface
      const transformedTemplates: CommunicationTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        type: template.type as CommunicationType,
        subject: template.subject || '',
        content: template.content,
        variables: Array.isArray(template.variables) 
          ? template.variables.map(v => typeof v === 'string' ? v : JSON.stringify(v))
          : [],
        category: (template.category || 'general') as CommunicationCategory,
        content_template: template.content,
        is_active: true,
        created_at: template.created_at,
        updated_at: template.updated_at,
      }));

      setTemplates(transformedTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: CommunicationType) => {
    return type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const getCategoryColor = (category: CommunicationCategory) => {
    switch (category) {
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

  const duplicateTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const { data, error } = await supabase
        .from('automation_message_templates')
        .insert({
          name: `${template.name} (Copy)`,
          type: template.type,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          category: template.category,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  if (loading) {
    return <div className="p-6">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Templates</h2>
          <p className="text-muted-foreground">
            Manage your email and SMS templates
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="estimate">Estimate</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="followup">Follow-up</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(template.type)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.subject && (
                      <p className="text-sm text-muted-foreground">
                        Subject: {template.subject}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge variant="outline">
                    {template.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="line-clamp-3">{template.content}</p>
                </div>
                
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateTemplate(template.id)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
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
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'No templates match your filters'
                  : 'Create your first communication template'
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
    </div>
  );
};

export default CommunicationTemplates;
