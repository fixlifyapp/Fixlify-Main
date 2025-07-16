
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Zap, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AutomationWorkflowListProps {
  workflows: any[];
  onToggleStatus: (id: string) => void;
  onExecute: (id: string) => void;
  onEdit: (workflow: any) => void;
}

export const AutomationWorkflowList = ({ 
  workflows, 
  onToggleStatus, 
  onExecute, 
  onEdit 
}: AutomationWorkflowListProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'all') return true;
    return workflow.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, color: 'bg-green-500', text: 'Active' },
      paused: { variant: 'secondary' as const, color: 'bg-yellow-500', text: 'Paused' },
      draft: { variant: 'outline' as const, color: 'bg-gray-500', text: 'Draft' },
      archived: { variant: 'destructive' as const, color: 'bg-red-500', text: 'Archived' }
    };
    
    return variants[status] || variants.draft;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      missed_call: Phone,
      appointment: Calendar,
      payment: MessageSquare,
      review: TrendingUp,
      estimate: Mail,
      customer_journey: Zap
    };
    
    return icons[category] || Zap;
  };

  if (workflows.length === 0) {
    return (
      <ModernCard variant="elevated" className="text-center py-12">
        <ModernCardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-fixlyfy to-fixlyfy-light flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Automations Yet</h3>
              <p className="text-gray-600 mb-4">Create your first automation to streamline your workflow</p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'paused', 'draft'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-gradient-to-r from-fixlyfy to-fixlyfy-light text-white' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <Badge variant="secondary" className="ml-2">
              {status === 'all' ? workflows.length : workflows.filter(w => w.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-6">
        {filteredWorkflows.map((workflow) => {
          const statusInfo = getStatusBadge(workflow.status);
          const CategoryIcon = getCategoryIcon(workflow.category);
          const successRate = workflow.execution_count > 0 
            ? ((workflow.success_count / workflow.execution_count) * 100).toFixed(1)
            : '0';

          return (
            <ModernCard key={workflow.id} variant="elevated" hoverable className="group">
              <ModernCardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fixlyfy to-fixlyfy-light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-fixlyfy transition-colors">
                          {workflow.name}
                        </h3>
                        <Badge {...statusInfo}>
                          <div className={`w-2 h-2 rounded-full ${statusInfo.color} mr-1`}></div>
                          {statusInfo.text}
                        </Badge>
                      </div>
                      
                      {workflow.description && (
                        <p className="text-gray-600 text-sm">{workflow.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {workflow.execution_count} executions
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {successRate}% success rate
                        </span>
                        {workflow.last_triggered_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last run {formatDistanceToNow(new Date(workflow.last_triggered_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {workflow.status === 'active' && (
                      <GradientButton
                        size="sm"
                        onClick={() => onExecute(workflow.id)}
                        variant="success"
                        className="shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Run Now
                      </GradientButton>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleStatus(workflow.id)}
                      className="hover:bg-gray-50"
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(workflow)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this automation?')) {
                              toast.success('Automation deleted');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          );
        })}
      </div>
    </div>
  );
};
