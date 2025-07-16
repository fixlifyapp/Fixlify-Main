
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Edit, Plus, Save, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface MessageTemplate {
  id: string;
  template_type: string;
  template_name: string;
  message_content: string;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const templateTypes = [
  { value: 'estimate_send', label: 'Estimate Sent to Client', description: 'When sending estimates to clients' },
  { value: 'invoice_send', label: 'Invoice Sent to Client', description: 'When sending invoices to clients' },
  { value: 'estimate_approved', label: 'Estimate Approved', description: 'Notification when client approves estimate' },
  { value: 'invoice_approved', label: 'Invoice Approved', description: 'Notification when client approves invoice' },
  { value: 'estimate_rejected', label: 'Estimate Rejected', description: 'Notification when client rejects estimate' },
  { value: 'invoice_rejected', label: 'Invoice Rejected', description: 'Notification when client rejects invoice' },
  { value: 'deposit_request', label: 'Deposit Request', description: 'Request for deposit payment after approval' }
];

const getVariablesByType = (templateType: string): string[] => {
  const commonVars = ['client_name', 'company_name'];
  
  switch (templateType) {
    case 'estimate_send':
      return [...commonVars, 'estimate_number', 'total', 'approval_link'];
    case 'invoice_send':
      return [...commonVars, 'invoice_number', 'amount_due', 'approval_link'];
    case 'estimate_approved':
    case 'estimate_rejected':
      return [...commonVars, 'estimate_number', 'total', 'rejection_reason'];
    case 'invoice_approved':
    case 'invoice_rejected':
      return [...commonVars, 'invoice_number', 'amount_due', 'rejection_reason'];
    case 'deposit_request':
      return [...commonVars, 'estimate_number', 'deposit_amount', 'payment_link'];
    default:
      return commonVars;
  }
};

export const MessageTemplatesConfig = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    template_type: '',
    template_name: '',
    message_content: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('template_type', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedTemplates = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables as string[]
          : typeof template.variables === 'string'
          ? JSON.parse(template.variables)
          : []
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load message templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.template_type || !formData.template_name || !formData.message_content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const variables = getVariablesByType(formData.template_type);
      
      const templateData = {
        user_id: user.id,
        template_type: formData.template_type,
        template_name: formData.template_name,
        message_content: formData.message_content,
        variables: variables,
        is_active: formData.is_active
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('message_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('message_templates')
          .insert(templateData);
        
        if (error) throw error;
        toast.success('Template created successfully');
      }

      setIsDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        template_type: '',
        template_name: '',
        message_content: '',
        is_active: true
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_type: template.template_type,
      template_name: template.template_name,
      message_content: template.message_content,
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      template_type: '',
      template_name: '',
      message_content: '',
      is_active: true
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message_content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.message_content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{${variable}}` + after;
      
      setFormData(prev => ({ ...prev, message_content: newText }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading message templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Message Templates</h3>
          <p className="text-sm text-muted-foreground">
            Configure default messages for estimates, invoices, and client communications
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message_content">Message Content</Label>
                <Textarea
                  id="message_content"
                  value={formData.message_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, message_content: e.target.value }))}
                  placeholder="Enter your message template..."
                  rows={6}
                />
              </div>

              {formData.template_type && (
                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getVariablesByType(formData.template_type).map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                        className="text-xs"
                      >
                        {`{${variable}}`}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click on variables to insert them into your message
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Active Template</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templateTypes.map((type) => {
          const typeTemplates = templates.filter(t => t.template_type === type.value);
          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {type.label}
                  </div>
                  <Badge variant="secondary">{typeTemplates.length} templates</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </CardHeader>
              <CardContent>
                {typeTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No templates created for this type yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {typeTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{template.template_name}</h4>
                              {template.is_default && <Badge variant="outline">Default</Badge>}
                              {!template.is_active && <Badge variant="destructive">Inactive</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.message_content.substring(0, 100)}
                              {template.message_content.length > 100 && '...'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(template.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Variable Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Common Variables:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code>{`{client_name}`}</code> - Client's name</li>
              <li><code>{`{company_name}`}</code> - Your company name</li>
              <li><code>{`{estimate_number}`}</code> - Estimate number (e.g., EST-001)</li>
              <li><code>{`{invoice_number}`}</code> - Invoice number (e.g., INV-001)</li>
              <li><code>{`{total}`}</code> - Total amount</li>
              <li><code>{`{amount_due}`}</code> - Amount due for invoices</li>
              <li><code>{`{approval_link}`}</code> - Link for client to approve/reject</li>
              <li><code>{`{deposit_amount}`}</code> - 50% deposit amount</li>
              <li><code>{`{payment_link}`}</code> - Payment link for deposits</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
