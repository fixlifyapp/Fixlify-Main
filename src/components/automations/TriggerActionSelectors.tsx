import React from 'react';
import { 
  AUTOMATION_TRIGGERS, 
  AUTOMATION_ACTIONS,
  WORKFLOW_CATEGORIES 
} from '@/data/automation-config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, RefreshCw, Calendar, UserPlus, UserCheck, Tag,
  FileText, CheckCircle, XCircle, Receipt, DollarSign,
  AlertCircle, CreditCard, Clock, MessageCircle,
  Mail, MessageSquare, CheckSquare, GitBranch, Sparkles,
  Edit, FileText as FileIcon
} from 'lucide-react';

const iconMap = {
  Plus, RefreshCw, Calendar, UserPlus, UserCheck, Tag,
  FileText, CheckCircle, XCircle, Receipt, DollarSign,
  AlertCircle, CreditCard, Clock, MessageCircle,
  Mail, MessageSquare, CheckSquare, GitBranch, Sparkles,
  Edit, FileIcon
};

interface TriggerSelectorProps {
  onSelect: (trigger: string) => void;
  selectedTrigger?: string;
}

export const TriggerSelector: React.FC<TriggerSelectorProps> = ({ 
  onSelect, 
  selectedTrigger 
}) => {
  const triggersByCategory = Object.entries(AUTOMATION_TRIGGERS).reduce((acc, [key, trigger]) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push({ key, ...trigger });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {Object.entries(triggersByCategory).map(([category, triggers]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {WORKFLOW_CATEGORIES[category as keyof typeof WORKFLOW_CATEGORIES]?.name || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {triggers.map((trigger) => {
              const Icon = iconMap[trigger.icon as keyof typeof iconMap] || Plus;
              const isSelected = selectedTrigger === trigger.key;
              
              return (
                <Card 
                  key={trigger.key}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelect(trigger.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{trigger.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trigger.description}
                        </p>
                        {trigger.conditions && (
                          <Badge variant="secondary" className="mt-2">
                            Has conditions
                          </Badge>
                        )}
                        {trigger.timing && (
                          <Badge variant="outline" className="mt-2">
                            Time-based
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ActionSelectorProps {
  onSelect: (action: string) => void;
  selectedActions?: string[];
}

export const ActionSelector: React.FC<ActionSelectorProps> = ({ 
  onSelect, 
  selectedActions = [] 
}) => {
  const actionsByCategory = Object.entries(AUTOMATION_ACTIONS).reduce((acc, [key, action]) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push({ key, ...action });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {Object.entries(actionsByCategory).map(([category, actions]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {WORKFLOW_CATEGORIES[category as keyof typeof WORKFLOW_CATEGORIES]?.name || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action) => {
              const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;
              const isSelected = selectedActions.includes(action.key);
              
              return (
                <Card 
                  key={action.key}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelect(action.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
