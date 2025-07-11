import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Calendar, Clock, MessageSquare, DollarSign, 
  CreditCard, LogIn, AlertCircle, TrendingUp, Activity,
  CheckCircle, X, Plus, Settings, Users, RefreshCw, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdvancedTrigger {
  id: string;
  type: string;
  name: string;
  config: any;
  enabled: boolean;
}

interface AdvancedTriggersProps {
  triggers: AdvancedTrigger[];
  onUpdate: (triggers: AdvancedTrigger[]) => void;
}

export const AdvancedTriggers: React.FC<AdvancedTriggersProps> = ({ triggers, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState('behavior');

  const triggerCategories = {
    behavior: {
      label: 'Customer Behavior',
      icon: User,
      triggers: [
        {
          type: 'first_job_completed',
          label: 'First Job Completed',
          description: 'Trigger when customer completes their first job',
          icon: CheckCircle,
          config: {
            includeServices: [],
            excludeServices: []
          }
        },
        {
          type: 'days_since_service',
          label: 'Days Since Last Service',
          description: 'Trigger after X days since last service',
          icon: Calendar,
          config: {
            days: 90,
            serviceTypes: 'all'
          }
        },
        {
          type: 'no_response',
          label: 'No Response to Messages',
          description: 'Customer hasn\'t responded in X days',
          icon: MessageSquare,
          config: {
            days: 3,
            messageTypes: ['estimate', 'invoice', 'follow_up']
          }
        },
        {
          type: 'portal_login',
          label: 'Customer Portal Activity',
          description: 'Trigger when customer logs into portal',
          icon: LogIn,
          config: {
            action: 'login',
            pageVisited: ''
          }
        },
        {
          type: 'payment_method_expiring',
          label: 'Payment Method Expiring',
          description: 'Credit card expiring soon',
          icon: CreditCard,
          config: {
            daysBefore: 30
          }
        }
      ]
    },
    engagement: {
      label: 'Engagement Patterns',
      icon: Activity,
      triggers: [
        {
          type: 'high_value_customer',
          label: 'High Value Customer',
          description: 'Customer reaches spending threshold',
          icon: DollarSign,
          config: {
            threshold: 5000,
            period: 'year'
          }
        },
        {
          type: 'review_posted',
          label: 'Review Posted',
          description: 'Customer posts a review',
          icon: Star,
          config: {
            platform: 'all',
            rating: 'any'
          }
        },
        {
          type: 'referral_made',
          label: 'Made a Referral',
          description: 'Customer refers someone',
          icon: Users,
          config: {
            referralConverted: false
          }
        }
      ]
    },
    lifecycle: {
      label: 'Customer Lifecycle',
      icon: TrendingUp,
      triggers: [
        {
          type: 'at_risk',
          label: 'At Risk Customer',
          description: 'No activity for extended period',
          icon: AlertCircle,
          config: {
            inactiveDays: 180,
            previousActivity: 'regular'
          }
        },
        {
          type: 'win_back',
          label: 'Win Back Opportunity',
          description: 'Previous customer, no recent activity',
          icon: RefreshCw,
          config: {
            inactiveDays: 365,
            minimumPreviousJobs: 2
          }
        },
        {
          type: 'seasonal_customer',
          label: 'Seasonal Pattern Detected',
          description: 'Customer has seasonal service pattern',
          icon: Calendar,
          config: {
            season: 'spring',
            daysBefore: 30
          }
        }
      ]
    }
  };

  const addTrigger = (triggerTemplate: any) => {
    const newTrigger: AdvancedTrigger = {
      id: `trigger-${Date.now()}`,
      type: triggerTemplate.type,
      name: triggerTemplate.label,
      config: { ...triggerTemplate.config },
      enabled: true
    };

    onUpdate([...triggers, newTrigger]);
  };

  const updateTrigger = (triggerId: string, updates: Partial<AdvancedTrigger>) => {
    onUpdate(triggers.map(trigger => 
      trigger.id === triggerId ? { ...trigger, ...updates } : trigger
    ));
  };

  const deleteTrigger = (triggerId: string) => {
    onUpdate(triggers.filter(trigger => trigger.id !== triggerId));
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2">
        {Object.entries(triggerCategories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Available Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {triggerCategories[selectedCategory].triggers.map((trigger) => {
              const Icon = trigger.icon;
              const isAdded = triggers.some(t => t.type === trigger.type);
              
              return (
                <div
                  key={trigger.type}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    isAdded ? "bg-muted/50 opacity-60" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{trigger.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trigger.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isAdded ? "secondary" : "default"}
                    onClick={() => !isAdded && addTrigger(trigger)}
                    disabled={isAdded}
                  >
                    {isAdded ? 'Added' : 'Add Trigger'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Triggers */}
      {triggers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {triggers.map((trigger) => (
                <TriggerConfigCard
                  key={trigger.id}
                  trigger={trigger}
                  onUpdate={(updates) => updateTrigger(trigger.id, updates)}
                  onDelete={() => deleteTrigger(trigger.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Trigger Configuration Card
const TriggerConfigCard: React.FC<{
  trigger: AdvancedTrigger;
  onUpdate: (updates: Partial<AdvancedTrigger>) => void;
  onDelete: () => void;
}> = ({ trigger, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderConfig = () => {
    switch (trigger.type) {
      case 'first_job_completed':
        return (
          <div className="space-y-3">
            <div>
              <Label>Service Types</Label>
              <Select
                value={trigger.config.serviceFilter || 'all'}
                onValueChange={(value) => 
                  onUpdate({ config: { ...trigger.config, serviceFilter: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="specific">Specific Services</SelectItem>
                  <SelectItem value="exclude">Exclude Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'days_since_service':
        return (
          <div className="space-y-3">
            <div>
              <Label>Days Since Last Service</Label>
              <Input
                type="number"
                value={trigger.config.days}
                onChange={(e) => 
                  onUpdate({ config: { ...trigger.config, days: parseInt(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Service Types</Label>
              <Select
                value={trigger.config.serviceTypes}
                onValueChange={(value) => 
                  onUpdate({ config: { ...trigger.config, serviceTypes: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Service</SelectItem>
                  <SelectItem value="maintenance">Maintenance Only</SelectItem>
                  <SelectItem value="repair">Repair Only</SelectItem>
                  <SelectItem value="installation">Installation Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'no_response':
        return (
          <div className="space-y-3">
            <div>
              <Label>Days Without Response</Label>
              <Input
                type="number"
                value={trigger.config.days}
                onChange={(e) => 
                  onUpdate({ config: { ...trigger.config, days: parseInt(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Message Types</Label>
              <div className="space-y-2">
                {['estimate', 'invoice', 'follow_up', 'appointment'].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Switch
                      checked={trigger.config.messageTypes?.includes(type)}
                      onCheckedChange={(checked) => {
                        const types = trigger.config.messageTypes || [];
                        onUpdate({
                          config: {
                            ...trigger.config,
                            messageTypes: checked 
                              ? [...types, type]
                              : types.filter(t => t !== type)
                          }
                        });
                      }}
                    />
                    <Label className="capitalize">{type.replace('_', ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'portal_login':
        return (
          <div className="space-y-3">
            <div>
              <Label>Trigger On</Label>
              <Select
                value={trigger.config.action}
                onValueChange={(value) => 
                  onUpdate({ config: { ...trigger.config, action: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="login">Any Login</SelectItem>
                  <SelectItem value="first_login">First Login Only</SelectItem>
                  <SelectItem value="view_invoice">Views Invoice</SelectItem>
                  <SelectItem value="view_estimate">Views Estimate</SelectItem>
                  <SelectItem value="update_info">Updates Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'payment_method_expiring':
        return (
          <div className="space-y-3">
            <div>
              <Label>Days Before Expiry</Label>
              <Input
                type="number"
                value={trigger.config.daysBefore}
                onChange={(e) => 
                  onUpdate({ config: { ...trigger.config, daysBefore: parseInt(e.target.value) } })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={trigger.config.sendReminder}
                onCheckedChange={(checked) => 
                  onUpdate({ config: { ...trigger.config, sendReminder: checked } })
                }
              />
              <Label>Send reminder to update payment method</Label>
            </div>
          </div>
        );

      case 'high_value_customer':
        return (
          <div className="space-y-3">
            <div>
              <Label>Spending Threshold ($)</Label>
              <Input
                type="number"
                value={trigger.config.threshold}
                onChange={(e) => 
                  onUpdate({ config: { ...trigger.config, threshold: parseInt(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Time Period</Label>
              <Select
                value={trigger.config.period}
                onValueChange={(value) => 
                  onUpdate({ config: { ...trigger.config, period: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Per Month</SelectItem>
                  <SelectItem value="quarter">Per Quarter</SelectItem>
                  <SelectItem value="year">Per Year</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Switch
              checked={trigger.enabled}
              onCheckedChange={(checked) => onUpdate({ enabled: checked })}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{trigger.name}</h4>
                <Badge variant={trigger.enabled ? "default" : "secondary"}>
                  {trigger.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Type: {trigger.type.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {renderConfig()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedTriggers;