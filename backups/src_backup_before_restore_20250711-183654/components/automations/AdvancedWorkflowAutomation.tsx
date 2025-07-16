import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Settings, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveWorkflowBuilder from './ComprehensiveWorkflowBuilder';
import { useWorkflows } from '@/hooks/useWorkflows';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const AdvancedWorkflowAutomation: React.FC = () => {
  const navigate = useNavigate();
  const { workflows, isLoading, toggleWorkflow, deleteWorkflow, executeWorkflow } = useWorkflows();
  const [activeTab, setActiveTab] = React.useState('workflows');
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<string | null>(null);

  const handleCreateNew = () => {
    setSelectedWorkflowId(null);
    setActiveTab('builder');
  };

  const handleEditWorkflow = (id: string) => {
    setSelectedWorkflowId(id);
    setActiveTab('builder');
  };

  const handleTestWorkflow = async (id: string) => {
    try {
      await executeWorkflow({ workflowId: id });
      toast.success('Workflow test started. Check the execution history for results.');
    } catch (error) {
      toast.error('Failed to test workflow');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Advanced Workflow Automation</CardTitle>
              <CardDescription>
                Create powerful multi-step workflows with conditional logic and smart timing
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflows">My Workflows</TabsTrigger>
              <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* My Workflows Tab */}
            <TabsContent value="workflows" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading workflows...</div>
              ) : workflows.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No workflows created yet. Start by creating your first workflow.
                    </p>
                    <Button onClick={handleCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workflow
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {workflow.description || 'No description'}
                            </CardDescription>
                          </div>
                          <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                            {workflow.enabled ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Triggers:</span>{' '}
                            {workflow.triggers?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Steps:</span>{' '}
                            {workflow.steps?.length || 0}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditWorkflow(workflow.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestWorkflow(workflow.id)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleWorkflow({ 
                                id: workflow.id, 
                                enabled: !workflow.enabled 
                              })}
                            >
                              {workflow.enabled ? 'Pause' : 'Enable'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Workflow Builder Tab */}
            <TabsContent value="builder">
              {selectedWorkflowId || activeTab === 'builder' ? (
                <ComprehensiveWorkflowBuilder 
                  workflowId={selectedWorkflowId}
                  onSave={() => {
                    setActiveTab('workflows');
                    setSelectedWorkflowId(null);
                  }}
                />
              ) : null}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Templates</CardTitle>
                  <CardDescription>
                    Start with pre-built templates for common automation scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Template cards would go here */}
                    <Card className="border-dashed hover:shadow-lg transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">Coming Soon</CardTitle>
                        <CardDescription>
                          More templates will be available soon
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Analytics</CardTitle>
                  <CardDescription>
                    Track the performance and impact of your workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Analytics will show execution stats, success rates, and ROI metrics
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWorkflowAutomation;