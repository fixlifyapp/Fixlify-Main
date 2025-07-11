
import { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle, 
  Clock, 
  Wrench, 
  FileText, 
  DollarSign,
  Star,
  Archive
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  status: string;
  description?: string;
  completed: boolean;
  current: boolean;
  assignee?: string;
  dueDate?: string;
  estimatedDuration?: number;
}

interface WorkflowAction {
  id: string;
  label: string;
  targetStatus: string;
  primary: boolean;
  icon?: any;
  requiresConfirmation?: boolean;
}

const WORKFLOW_TEMPLATES = {
  'appliance-repair': [
    { id: 'scheduled', name: 'Job Scheduled', description: 'Initial scheduling and client confirmation' },
    { id: 'en-route', name: 'En Route', description: 'Technician traveling to location' },
    { id: 'on-site', name: 'On Site', description: 'Arrived at customer location' },
    { id: 'diagnosing', name: 'Diagnosing', description: 'Identifying the problem' },
    { id: 'waiting-parts', name: 'Waiting for Parts', description: 'Parts ordered, waiting for delivery' },
    { id: 'in-progress', name: 'Repair in Progress', description: 'Actively working on repair' },
    { id: 'testing', name: 'Testing', description: 'Verifying repair completion' },
    { id: 'completed', name: 'Work Completed', description: 'Repair finished successfully' },
    { id: 'invoiced', name: 'Invoiced', description: 'Invoice sent to customer' },
    { id: 'paid', name: 'Paid', description: 'Payment received' },
    { id: 'closed', name: 'Closed', description: 'Job fully completed and closed' }
  ],
  'maintenance': [
    { id: 'scheduled', name: 'Scheduled', description: 'Maintenance appointment scheduled' },
    { id: 'en-route', name: 'En Route', description: 'Technician traveling to location' },
    { id: 'in-progress', name: 'In Progress', description: 'Performing maintenance tasks' },
    { id: 'completed', name: 'Completed', description: 'Maintenance completed' },
    { id: 'invoiced', name: 'Invoiced', description: 'Invoice sent' },
    { id: 'closed', name: 'Closed', description: 'Job closed' }
  ],
  'installation': [
    { id: 'scheduled', name: 'Scheduled', description: 'Installation scheduled' },
    { id: 'preparing', name: 'Preparing', description: 'Gathering tools and materials' },
    { id: 'en-route', name: 'En Route', description: 'Traveling to installation site' },
    { id: 'installing', name: 'Installing', description: 'Installation in progress' },
    { id: 'testing', name: 'Testing', description: 'Testing installation' },
    { id: 'completed', name: 'Completed', description: 'Installation completed' },
    { id: 'invoiced', name: 'Invoiced', description: 'Invoice sent' },
    { id: 'closed', name: 'Closed', description: 'Job closed' }
  ]
};

const STATUS_ACTIONS: Record<string, WorkflowAction[]> = {
  'scheduled': [
    { id: 'start', label: 'Start Job', targetStatus: 'en-route', primary: true, icon: Clock },
    { id: 'cancel', label: 'Cancel', targetStatus: 'cancelled', primary: false }
  ],
  'en-route': [
    { id: 'arrive', label: 'Arrived On-Site', targetStatus: 'on-site', primary: true, icon: CheckCircle },
    { id: 'delay', label: 'Report Delay', targetStatus: 'delayed', primary: false }
  ],
  'on-site': [
    { id: 'diagnose', label: 'Start Diagnosis', targetStatus: 'diagnosing', primary: true, icon: Wrench }
  ],
  'diagnosing': [
    { id: 'parts-needed', label: 'Order Parts', targetStatus: 'waiting-parts', primary: false },
    { id: 'start-repair', label: 'Start Repair', targetStatus: 'in-progress', primary: true, icon: Wrench }
  ],
  'waiting-parts': [
    { id: 'parts-arrived', label: 'Parts Arrived', targetStatus: 'in-progress', primary: true, icon: Wrench }
  ],
  'in-progress': [
    { id: 'test', label: 'Start Testing', targetStatus: 'testing', primary: true, icon: CheckCircle }
  ],
  'testing': [
    { id: 'complete', label: 'Mark Complete', targetStatus: 'completed', primary: true, icon: CheckCircle },
    { id: 'needs-work', label: 'Needs More Work', targetStatus: 'in-progress', primary: false }
  ],
  'completed': [
    { id: 'invoice', label: 'Send Invoice', targetStatus: 'invoiced', primary: true, icon: FileText }
  ],
  'invoiced': [
    { id: 'mark-paid', label: 'Mark as Paid', targetStatus: 'paid', primary: true, icon: DollarSign }
  ],
  'paid': [
    { id: 'close', label: 'Close Job', targetStatus: 'closed', primary: true, icon: Archive }
  ]
};

export const useJobWorkflow = (jobId: string, currentStatus: string) => {
  const [isLoading, setIsLoading] = useState(false);

  // Determine workflow template based on job type (simplified for demo)
  const getWorkflowTemplate = () => {
    // In a real app, this would be determined by job type or service category
    return WORKFLOW_TEMPLATES['appliance-repair'];
  };

  const workflow = useMemo(() => {
    const template = getWorkflowTemplate();
    const currentIndex = template.findIndex(step => step.id === currentStatus);
    
    return template.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
      assignee: index <= currentIndex ? 'John Doe' : undefined,
      dueDate: index === currentIndex ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
    }));
  }, [currentStatus]);

  const getWorkflowProgress = () => {
    const template = getWorkflowTemplate();
    const currentIndex = template.findIndex(step => step.id === currentStatus);
    return ((currentIndex + 1) / template.length) * 100;
  };

  const getNextActions = () => {
    return STATUS_ACTIONS[currentStatus] || [];
  };

  const updateJobStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      // Here you would update the job status in your database
      console.log(`Updating job ${jobId} status from ${currentStatus} to ${newStatus}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger a refresh of the job data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update job status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workflow,
    isLoading,
    updateJobStatus,
    getNextActions,
    getWorkflowProgress
  };
};
