import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CommunicationAutomation, CommunicationTemplate } from '@/types/communications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export function CommunicationAutomations() {
  const [automations, setAutomations] = useState<CommunicationAutomation[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<CommunicationAutomation | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    trigger_type: 'estimate_created' as CommunicationAutomation['trigger_type'],
    template_id: '',
    delay_minutes: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const orgId = profile?.organization_id || user?.id;

      // Load automations
      const { data: automationsData, error: automationsError } = await supabase
        .from('communication_automations')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (automationsError) throw automationsError;

      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (templatesError) throw templatesError;

      setAutomations(automationsData || []);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load automations');
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

      const automationData = {
        ...formData,
        organization_id: profile?.organization_id || user?.id
      };

      if (editingAutomation) {
        const { error } = await supabase
          .from('communication_automations')
          .update(automationData)
          .eq('id', editingAutomation.id);
        
        if (error) throw error;
        toast.success('Automation updated successfully');
      } else {
        const { error } = await supabase
          .from('communication_automations')
          .insert(automationData);
        
        if (error) throw error;
        toast.success('Automation created successfully');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error('Failed to save automation');
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const { error } = await supabase
        .from('communication_automations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Automation deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('communication_automations')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Automation ${!isActive ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trigger_type: 'estimate_created',
      template_id: '',
      delay_minutes: 0,
      is_active: true
    });
    setEditingAutomation(null);
  };

  const openEditDialog = (automation: CommunicationAutomation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      trigger_type: automation.trigger_type,
      template_id: automation.template_id,
      delay_minutes: automation.delay_minutes || 0,
      is_active: automation.is_active
    });
    setDialogOpen(true);
  };

  const getTemplate = (templateId: string) => {
    return templates.find(t => t.id === templateId);
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'estimate_created':
        return 'Estimate Created';
      case 'invoice_created':
        return 'Invoice Created';
      case 'job_completed':
        return 'Job Completed';
      case 'custom':
        return 'Custom';
      default:
        return trigger;
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Communication Automations</CardTitle>
          <CardDescription>Automatically send messages based on triggers</CardDescription>
          <div className="flex justify-end">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Automation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No automations found
                  </TableCell>
                </TableRow>
              ) : (
                automations.map((automation) => {
                  const template = getTemplate(automation.template_id);
                  return (
                    <TableRow key={automation.id}>
                      <TableCell className="font-medium">{automation.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTriggerLabel(automation.trigger_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template ? (
                          <span className="text-sm">{template.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Template not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {automation.delay_minutes ? `${automation.delay_minutes} min` : 'Immediate'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={automation.is_active ? 'default' : 'secondary'}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(automation.id, automation.is_active)}
                        >
                          {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(automation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(automation.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAutomation ? 'Edit Automation' : 'Create Automation'}
            </DialogTitle>
            <DialogDescription>
              Set up automatic communications based on system events
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
                placeholder="Automation name..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trigger" className="text-right">
                Trigger
              </Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value: CommunicationAutomation['trigger_type']) => 
                  setFormData(prev => ({ ...prev, trigger_type: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estimate_created">Estimate Created</SelectItem>
                  <SelectItem value="invoice_created">Invoice Created</SelectItem>
                  <SelectItem value="job_completed">Job Completed</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Template
              </Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, template_id: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delay" className="text-right">
                Delay (minutes)
              </Label>
              <Input
                id="delay"
                type="number"
                min="0"
                value={formData.delay_minutes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  delay_minutes: parseInt(e.target.value) || 0 
                }))}
                className="col-span-3"
                placeholder="0"
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
              {editingAutomation ? 'Update' : 'Create'} Automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}