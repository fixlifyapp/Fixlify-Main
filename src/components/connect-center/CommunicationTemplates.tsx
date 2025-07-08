
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  category: 'general' | 'estimates' | 'invoices' | 'jobs' | 'follow_up';
  created_at: string;
  updated_at: string;
}

type CommunicationType = 'email' | 'sms';
type CommunicationCategory = 'general' | 'estimates' | 'invoices' | 'jobs' | 'follow_up';

const CommunicationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as CommunicationType,
    category: 'general' as CommunicationCategory,
    subject: '',
    content: '',
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our interface
      const mappedTemplates: CommunicationTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        type: template.type as CommunicationType,
        subject: template.subject || undefined,
        content: template.content,
        variables: Array.isArray(template.variables) ? template.variables : [],
        category: 'general' as CommunicationCategory, // Default since it's not in the DB
        created_at: template.created_at,
        updated_at: template.updated_at
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const templateData = {
        organization_id: user.data.user.id,
        name: formData.name,
        type: formData.type,
        subject: formData.subject || null,
        content: formData.content,
        variables: formData.variables
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('communication_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully!');
      } else {
        const { error } = await supabase
          .from('communication_templates')
          .insert(templateData);

        if (error) throw error;
        toast.success('Template created successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template deleted successfully!');
      fetchTemplates();
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
    setEditingTemplate(null);
  };

  const editTemplate = (template: CommunicationTemplate) => {
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables
    });
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const copyTemplate = async (template: CommunicationTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      toast.success('Template content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy template');
    }
  };

  const extractVariables = (content: string) => {
    const regex = /\{([^}]+)\}/g;
    const matches = content.match(regex);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      variables: extractVariables(content)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communication Templates</CardTitle>
              <CardDescription>
                Create and manage email and SMS templates for automated communications
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </DialogTitle>
                  <DialogDescription>
                    Design reusable communication templates with dynamic variables
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: CommunicationType) => 
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: CommunicationCategory) => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="estimates">Estimates</SelectItem>
                        <SelectItem value="invoices">Invoices</SelectItem>
                        <SelectItem value="jobs">Jobs</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'email' && (
                    <div>
                      <Label htmlFor="template-subject">Subject Line</Label>
                      <Input
                        id="template-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter email subject"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="template-content">Content</Label>
                    <Textarea
                      id="template-content"
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Enter your message content. Use {variable} for dynamic content."
                      rows={8}
                    />
                  </div>

                  {formData.variables.length > 0 && (
                    <div>
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.variables.map((variable, index) => (
                          <Badge key={index} variant="secondary">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveTemplate}>
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates found. Create your first template to get started.
              </div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">
                          {template.type}
                        </Badge>
                        <Badge variant="secondary">
                          {template.category}
                        </Badge>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Subject: {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => copyTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => editTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationTemplates;
