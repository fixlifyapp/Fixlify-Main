import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Filter } from 'lucide-react';
import { useEnhancedWorkflowData } from '@/hooks/useEnhancedWorkflowData';

interface Condition {
  id: string;
  property: string;
  operator: string;
  value: string;
  group: number;
}

interface ConditionGroup {
  id: number;
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

interface AdvancedConditionBuilderProps {
  triggerType: string;
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const OPERATORS = {
  text: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' }
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'greater_equal', label: '≥' },
    { value: 'less_equal', label: '≤' }
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' }
  ],
  date: [
    { value: 'on', label: 'on' },
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'between', label: 'between' }
  ]
};

export const AdvancedConditionBuilder = ({
  triggerType,
  conditions,
  onChange
}: AdvancedConditionBuilderProps) => {
  const workflowData = useEnhancedWorkflowData();
  const jobStatuses = workflowData.getJobStatusOptions();
  const jobTypes = workflowData.getJobTypeOptions();
  const tags = workflowData.getTagOptions();
  const teamMembers = workflowData.getTeamMemberOptions();
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([
    { id: 1, logic: 'AND', conditions: [] }
  ]);

  // Get available properties based on trigger type
  const getAvailableProperties = () => {
    const baseProperties = [
      { value: 'job.id', label: 'Job ID', type: 'text' },
      { value: 'job.title', label: 'Job Title', type: 'text' },
      { value: 'job.description', label: 'Job Description', type: 'text' },
      { value: 'job.created_at', label: 'Created Date', type: 'date' },
      { value: 'job.scheduled_date', label: 'Scheduled Date', type: 'date' },
      { value: 'client.name', label: 'Client Name', type: 'text' },
      { value: 'client.email', label: 'Client Email', type: 'text' },
      { value: 'client.phone', label: 'Client Phone', type: 'text' }
    ];

    if (triggerType.includes('job')) {
      return [
        ...baseProperties,
        { value: 'job.status', label: 'Job Status', type: 'select', options: jobStatuses },
        { value: 'job.type', label: 'Job Type', type: 'select', options: jobTypes },
        { value: 'job.tags', label: 'Job Tags', type: 'multiselect', options: tags },
        { value: 'job.technician_id', label: 'Technician', type: 'select', options: teamMembers },
        { value: 'job.priority', label: 'Priority', type: 'select', options: [
          { id: 'low', name: 'Low' },
          { id: 'medium', name: 'Medium' },
          { id: 'high', name: 'High' },
          { id: 'urgent', name: 'Urgent' }
        ]},
        { value: 'job.total_amount', label: 'Total Amount', type: 'number' }
      ];
    }

    return baseProperties;
  };

  const addCondition = (groupId: number) => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      property: '',
      operator: 'equals',
      value: '',
      group: groupId
    };

    setConditionGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    );
  };

  const removeCondition = (conditionId: string) => {
    setConditionGroups(groups =>
      groups.map(group => ({
        ...group,
        conditions: group.conditions.filter(c => c.id !== conditionId)
      }))
    );
  };

  const updateCondition = (conditionId: string, field: keyof Condition, value: string) => {
    setConditionGroups(groups =>
      groups.map(group => ({
        ...group,
        conditions: group.conditions.map(condition =>
          condition.id === conditionId
            ? { ...condition, [field]: value }
            : condition
        )
      }))
    );

    // Update parent component
    const allConditions = conditionGroups.flatMap(group => group.conditions);
    onChange(allConditions);
  };

  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: Date.now(),
      logic: 'OR',
      conditions: []
    };
    setConditionGroups([...conditionGroups, newGroup]);
  };

  const removeConditionGroup = (groupId: number) => {
    if (conditionGroups.length > 1) {
      setConditionGroups(groups => groups.filter(g => g.id !== groupId));
    }
  };

  const getPropertyType = (propertyValue: string) => {
    const property = getAvailableProperties().find(p => p.value === propertyValue);
    return property?.type || 'text';
  };

  const getPropertyOptions = (propertyValue: string) => {
    const property = getAvailableProperties().find(p => p.value === propertyValue);
    return property?.options || [];
  };

  const renderValueInput = (condition: Condition) => {
    const propertyType = getPropertyType(condition.property);
    const options = getPropertyOptions(condition.property);

    if (propertyType === 'select' && options.length > 0) {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) => updateCondition(condition.id, 'value', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (propertyType === 'multiselect' && options.length > 0) {
      return (
        <div className="w-40">
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(condition.id, 'value', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tags" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (propertyType === 'date') {
      return (
        <Input
          type="date"
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
          className="w-40"
        />
      );
    }

    if (propertyType === 'number') {
      return (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
          className="w-40"
          placeholder="Enter amount"
        />
      );
    }

    return (
      <Input
        value={condition.value}
        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
        className="w-40"
        placeholder="Enter value"
      />
    );
  };

  const availableProperties = getAvailableProperties();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditionGroups.map((group, groupIndex) => (
          <div key={group.id} className="space-y-3">
            {groupIndex > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">OR</Badge>
                <div className="flex-1 h-px bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeConditionGroup(group.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="border rounded-lg p-4 space-y-3">
              {group.conditions.map((condition, conditionIndex) => (
                <div key={condition.id} className="space-y-2">
                  {conditionIndex > 0 && (
                    <div className="flex items-center">
                      <Badge variant="secondary" className="text-xs">AND</Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-medium min-w-fit">If</Label>
                    
                    <Select
                      value={condition.property}
                      onValueChange={(value) => updateCondition(condition.id, 'property', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProperties.map((property) => (
                          <SelectItem key={property.value} value={property.value}>
                            {property.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS[getPropertyType(condition.property) as keyof typeof OPERATORS]?.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {renderValueInput(condition)}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(group.id)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addConditionGroup}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition Group (OR)
        </Button>
      </CardContent>
    </Card>
  );
};