
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Workflow,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Settings
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  duration: string;
  dependencies: string[];
}

interface TeamWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  steps: WorkflowStep[];
  teamMembers: string[];
}

export const TeamWorkflowManager = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('1');

  const workflows: TeamWorkflow[] = [
    {
      id: '1',
      name: 'HVAC Installation Process',
      description: 'Standard workflow for HVAC system installations',
      status: 'active',
      progress: 65,
      teamMembers: ['Sarah Johnson', 'Mike Chen', 'David Lee'],
      steps: [
        {
          id: '1',
          name: 'Site Assessment',
          assignee: 'Sarah Johnson',
          status: 'completed',
          duration: '2 hours',
          dependencies: []
        },
        {
          id: '2',
          name: 'Equipment Preparation',
          assignee: 'Mike Chen',
          status: 'completed',
          duration: '1 hour',
          dependencies: ['1']
        },
        {
          id: '3',
          name: 'Installation',
          assignee: 'David Lee',
          status: 'in-progress',
          duration: '4 hours',
          dependencies: ['2']
        },
        {
          id: '4',
          name: 'Testing & Commissioning',
          assignee: 'Sarah Johnson',
          status: 'pending',
          duration: '2 hours',
          dependencies: ['3']
        },
        {
          id: '5',
          name: 'Customer Walkthrough',
          assignee: 'Mike Chen',
          status: 'pending',
          duration: '1 hour',
          dependencies: ['4']
        }
      ]
    },
    {
      id: '2',
      name: 'Emergency Repair Response',
      description: 'Rapid response workflow for emergency repairs',
      status: 'active',
      progress: 30,
      teamMembers: ['Emily Rodriguez', 'Lisa Wang'],
      steps: [
        {
          id: '1',
          name: 'Emergency Call Received',
          assignee: 'Emily Rodriguez',
          status: 'completed',
          duration: '5 minutes',
          dependencies: []
        },
        {
          id: '2',
          name: 'Technician Dispatch',
          assignee: 'Lisa Wang',
          status: 'in-progress',
          duration: '30 minutes',
          dependencies: ['1']
        },
        {
          id: '3',
          name: 'On-Site Diagnosis',
          assignee: 'Emily Rodriguez',
          status: 'pending',
          duration: '45 minutes',
          dependencies: ['2']
        },
        {
          id: '4',
          name: 'Repair Execution',
          assignee: 'Emily Rodriguez',
          status: 'pending',
          duration: '2 hours',
          dependencies: ['3']
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-purple-600" />
            Team Workflow Manager
          </h2>
          <p className="text-gray-600">Manage and track team workflows and processes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure Workflows
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWorkflow === workflow.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-1" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {workflow.teamMembers.length} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflowData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflowData.name}</CardTitle>
                    <p className="text-gray-600">{selectedWorkflowData.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restart
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Overview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-lg font-bold">{selectedWorkflowData.progress}%</span>
                    </div>
                    <Progress value={selectedWorkflowData.progress} className="h-2" />
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{selectedWorkflowData.steps.filter(s => s.status === 'completed').length} Completed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3 text-blue-600" />
                        <span>{selectedWorkflowData.steps.filter(s => s.status === 'in-progress').length} In Progress</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{selectedWorkflowData.steps.filter(s => s.status === 'pending').length} Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Steps */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Workflow Steps</h4>
                    {selectedWorkflowData.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{step.name}</h5>
                            <Badge className={getStatusColor(step.status)} variant="secondary">
                              {step.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Assignee: {step.assignee}</span>
                            <span>Duration: {step.duration}</span>
                          </div>
                        </div>
                        {index < selectedWorkflowData.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Team Members */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Team Members</h4>
                    <div className="flex items-center gap-2">
                      {selectedWorkflowData.teamMembers.map((member, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
