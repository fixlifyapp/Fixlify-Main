import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Terminal,
  FileText,
  Zap,
  Bug,
  TestTube,
  PlayCircle
} from 'lucide-react';

interface TestResult {
  id: string;
  workflowName: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  executionTime: number;
  steps: Array<{
    name: string;
    status: 'success' | 'failed' | 'pending';
    duration: number;
    output?: string;
    error?: string;
  }>;
  startedAt: string;
  completedAt?: string;
}

const mockWorkflows = [
  { id: '1', name: 'Job Completed Notification', type: 'Email Workflow' },
  { id: '2', name: 'Payment Reminder', type: 'SMS Workflow' },
  { id: '3', name: 'Follow-up Sequence', type: 'Multi-step Workflow' },
  { id: '4', name: 'Appointment Confirmation', type: 'Notification Workflow' },
];

const mockTestData = {
  jobId: 'JOB-2024-001',
  clientId: 'CLI-001',
  status: 'completed',
  amount: 250.00,
  technician: 'John Doe',
  service: 'Plumbing Repair'
};

export const AutomationTesting: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [testData, setTestData] = useState<string>(JSON.stringify(mockTestData, null, 2));
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    if (!selectedWorkflow) {
      toast.error('Please select a workflow to test');
      return;
    }

    try {
      JSON.parse(testData);
    } catch (error) {
      toast.error('Invalid test data JSON format');
      return;
    }

    setIsRunning(true);
    const workflow = mockWorkflows.find(w => w.id === selectedWorkflow);
    
    // Create new test result
    const newTestResult: TestResult = {
      id: Date.now().toString(),
      workflowName: workflow?.name || 'Unknown',
      status: 'running',
      executionTime: 0,
      steps: [
        { name: 'Trigger Validation', status: 'pending', duration: 0 },
        { name: 'Condition Check', status: 'pending', duration: 0 },
        { name: 'Action Execution', status: 'pending', duration: 0 },
        { name: 'Cleanup', status: 'pending', duration: 0 },
      ],
      startedAt: new Date().toISOString(),
    };

    setTestResults(prev => [newTestResult, ...prev]);

    // Simulate test execution
    for (let i = 0; i < newTestResult.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      setTestResults(prev => prev.map(result => {
        if (result.id === newTestResult.id) {
          const updatedSteps = [...result.steps];
          updatedSteps[i] = {
            ...updatedSteps[i],
            status: Math.random() > 0.1 ? 'success' : 'failed',
            duration: Math.floor(800 + Math.random() * 1200),
            output: Math.random() > 0.5 ? 'Step completed successfully' : undefined,
            error: Math.random() > 0.9 ? 'Simulated error occurred' : undefined,
          };
          
          return {
            ...result,
            steps: updatedSteps,
            executionTime: updatedSteps.reduce((acc, step) => acc + step.duration, 0),
          };
        }
        return result;
      }));
    }

    // Complete the test
    setTestResults(prev => prev.map(result => {
      if (result.id === newTestResult.id) {
        const hasFailures = result.steps.some(step => step.status === 'failed');
        return {
          ...result,
          status: hasFailures ? 'failed' : 'success',
          completedAt: new Date().toISOString(),
        };
      }
      return result;
    }));

    setIsRunning(false);
    toast.success('Test execution completed');
  };

  const clearResults = () => {
    setTestResults([]);
    toast.info('Test results cleared');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Automation Testing</h2>
        <p className="text-gray-600">Test your workflows with simulated data before deploying</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflow">Select Workflow</Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workflow to test" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWorkflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        <div>
                          <div className="font-medium">{workflow.name}</div>
                          <div className="text-xs text-gray-500">{workflow.type}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="testData">Test Data (JSON)</Label>
                <Textarea
                  id="testData"
                  value={testData}
                  onChange={(e) => setTestData(e.target.value)}
                  placeholder="Enter test data in JSON format"
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={runTest} 
                  disabled={isRunning || !selectedWorkflow}
                  className="w-full"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running Test...' : 'Run Test'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={clearResults}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Results
                </Button>
              </div>

              {/* Quick Test Templates */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Templates</h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setTestData(JSON.stringify(mockTestData, null, 2))}
                  >
                    <Bug className="h-3 w-3 mr-2" />
                    Job Completion
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setTestData(JSON.stringify({
                      ...mockTestData,
                      invoiceId: 'INV-001',
                      dueDate: '2024-02-01',
                      overdueDays: 7
                    }, null, 2))}
                  >
                    <Bug className="h-3 w-3 mr-2" />
                    Payment Reminder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setTestData(JSON.stringify({
                      clientId: 'CLI-002',
                      appointmentDate: '2024-01-25',
                      service: 'HVAC Maintenance'
                    }, null, 2))}
                  >
                    <Bug className="h-3 w-3 mr-2" />
                    Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet. Run a test to see the execution details.</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {testResults.map((result) => (
                      <Card key={result.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{result.workflowName}</h4>
                              <p className="text-sm text-gray-500">
                                Started: {new Date(result.startedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              {getStatusBadge(result.status)}
                            </div>
                          </div>
                          {result.completedAt && (
                            <div className="text-sm text-gray-600">
                              Execution time: {result.executionTime}ms
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {result.steps.map((step, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(step.status)}
                                  <span className="text-sm">{step.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {step.duration > 0 && (
                                    <span className="text-xs text-gray-500">{step.duration}ms</span>
                                  )}
                                  {getStatusBadge(step.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Show any step outputs or errors */}
                          {result.steps.some(step => step.output || step.error) && (
                            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                              <h5 className="font-medium mb-2">Step Details:</h5>
                              {result.steps.map((step, index) => (
                                step.output || step.error ? (
                                  <div key={index} className="mb-2">
                                    <span className="font-medium">{step.name}:</span>
                                    {step.output && (
                                      <div className="text-green-700 font-mono text-xs">{step.output}</div>
                                    )}
                                    {step.error && (
                                      <div className="text-red-700 font-mono text-xs">{step.error}</div>
                                    )}
                                  </div>
                                ) : null
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};