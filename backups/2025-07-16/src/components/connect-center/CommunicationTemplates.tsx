import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CommunicationTemplate, CommunicationType, CommunicationCategory } from '@/types/communications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export function CommunicationTemplates() {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as CommunicationType,
    category: 'general' as CommunicationCategory,
    subject_template: '',
    content_template: '',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('organization_id', profile?.organization_id || user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const templateData = {
        ...formData,
        organization_id: profile?.organization_id || user?.id,
        variables: extractVariables(formData.content_template)
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('communication_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('communication_templates')
          .insert(templateData);
        
        if (error) throw error;
        toast.success('Template created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const extractVariables = (template: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'email',
      category: 'general',
      subject_template: '',
      content_template: '',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: CommunicationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject_template: template.subject_template || '',
      content_template: template.content_template,
      is_active: template.is_active
    });
    setDialogOpen(true);
  };

  const getIcon = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'internal_message':
        return <MessageSquare className="h-4 w-4" />;
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Communication Templates</CardTitle>
          <CardDescription>Manage reusable templates for emails and SMS</CardDescription>
          <div className="flex justify-end">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIcon(template.type)}
                        <span className="capitalize">{template.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {template.variables.map((v) => (
                        <Badge key={v} variant="secondary" className="mr-1">
                          {v}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Create reusable templates with variables like {'{'}{'{'} name {'}'}{'}'}, {'{'}{'{'} amount {'}'}{'}'}, etc.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Template name..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: CommunicationType) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: CommunicationCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'email' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                  className="col-span-3"
                  placeholder="Email subject template..."
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                value={formData.content_template}
                onChange={(e) => setFormData(prev => ({ ...prev, content_template: e.target.value }))}
                className="col-span-3 min-h-[150px]"
                placeholder="Template content with {{variables}}..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="col-span-3">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}