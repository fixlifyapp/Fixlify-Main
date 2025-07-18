import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Search, Filter, Send, Eye, Copy, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EmailService } from '@/services/email-service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  tone: string;
  description: string;
  use_count: number;
}

interface EmailTemplateSelectorProps {
  clientEmail?: string;
  clientId?: string;
  jobId?: string;
  onSend?: () => void;
}

export const EmailTemplateSelector = ({ 
  clientEmail, 
  clientId, 
  jobId,
  onSend 
}: EmailTemplateSelectorProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_message_templates')
        .select('*')
        .eq('type', 'email')
        .order('use_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'appointment', 'job_completion', 'billing', 'marketing', 'retention', 'follow_up'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      friendly: 'bg-green-100 text-green-800',
      professional: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      warm: 'bg-yellow-100 text-yellow-800',
      consultative: 'bg-purple-100 text-purple-800',
      helpful: 'bg-indigo-100 text-indigo-800',
      personal: 'bg-pink-100 text-pink-800',
      appreciative: 'bg-orange-100 text-orange-800',
      delightful: 'bg-teal-100 text-teal-800',
      innovative: 'bg-cyan-100 text-cyan-800',
      expert: 'bg-gray-100 text-gray-800',
      exclusive: 'bg-amber-100 text-amber-800',
      caring: 'bg-rose-100 text-rose-800',
      data_driven: 'bg-slate-100 text-slate-800'
    };
    return colors[tone] || 'bg-gray-100 text-gray-800';
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize variables with defaults
    const defaultVars: Record<string, string> = {};
    template.variables.forEach(varName => {
      defaultVars[varName] = '';
    });
    
    // Set some common defaults
    defaultVars.client_email = clientEmail || '';
    defaultVars.company_name = 'Your Company';
    defaultVars.company_phone = '(555) 123-4567';
    
    setVariables(defaultVars);
    setSendDialogOpen(true);
  };

  const getProcessedContent = () => {
    if (!selectedTemplate) return { subject: '', body: '' };
    
    let subject = selectedTemplate.subject;
    let body = selectedTemplate.content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });
    
    return { subject, body };
  };

  const handleSend = async () => {
    if (!selectedTemplate || !clientEmail) return;
    
    setSending(true);
    try {
      const { subject, body } = getProcessedContent();
      
      await EmailService.sendEmail({
        to: clientEmail,
        subject,
        body,
        html: body,
        clientId,
        jobId,
        templateId: selectedTemplate.id
      });

      // Update use count
      await supabase
        .from('automation_message_templates')
        .update({ 
          use_count: (selectedTemplate.use_count || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      toast.success('Email sent successfully!');
      setSendDialogOpen(false);
      if (onSend) onSend();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Templates
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="job_completion">Job Completion</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading templates...
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge className={cn('text-xs', getToneColor(template.tone))}>
                          {template.tone}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Used {template.use_count || 0} times</span>
                      <span>{template.variables.length} variables</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Send Email Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize and Send Email</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Variables */}
              <div className="space-y-4">
                <h3 className="font-medium">Fill in Variables</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTemplate.variables.map((varName) => (
                    <div key={varName}>
                      <Label htmlFor={varName}>{varName.replace(/_/g, ' ')}</Label>
                      <Input
                        id={varName}
                        value={variables[varName] || ''}
                        onChange={(e) => setVariables({
                          ...variables,
                          [varName]: e.target.value
                        })}
                        placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="font-medium">Preview</h3>
                <div className="p-4 rounded-lg border bg-muted/10">
                  <p className="font-medium mb-2">Subject: {getProcessedContent().subject}</p>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: getProcessedContent().body }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !clientEmail}>
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');