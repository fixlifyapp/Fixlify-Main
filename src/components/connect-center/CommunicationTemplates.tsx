
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Edit, Trash2, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
}

export const CommunicationTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'email' | 'sms'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    category: 'general',
    subject: '',
    content: '',
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [selectedType, templates]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTemplates: Template[] = data?.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type as 'email' | 'sms',
        category: template.category || 'general',
        subject: template.subject,
        content: template.content,
        variables: Array.isArray(template.variables) ? template.variables : [],
        is_active: template.is_active !== false,
        created_at: template.created_at
      })) || [];

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          name: formData.name,
          type: formData.type,
          category: formData.category,
          subject: formData.subject || null,
          content: formData.content,
          variables: formData.variables,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      setShowCreateDialog(false);
      resetForm();
      toast.success('Template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          name: formData.name,
          type: formData.type,
          category: formData.category,
          subject: formData.subject || null,
          content: formData.content,
          variables: formData.variables
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      await fetchTemplates();
      setEditingTemplate(null);
      resetForm();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTemplates();
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      category: 'general',
      subject: '',
      content: '',
      variables: []
    });
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'sms' ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Message Templates
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                {/* ... template form content ... */}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            <Button
              variant={selectedType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('email')}
            >
              Email
            </Button>
            <Button
              variant={selectedType === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('sms')}
            >
              SMS
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No templates found</p>
                <p className="text-sm">Create your first template to get started</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(template.type)}
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {template.subject && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {template.content}
                      </p>
                      
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {`{${variable}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {/* ... edit template form content ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
};
