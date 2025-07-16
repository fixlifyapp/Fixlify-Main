import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, DollarSign, FileText, Tag, Star } from 'lucide-react';

interface TriggerConfigFieldsProps {
  triggerType: string;
  config: any;
  onConfigChange: (config: any) => void;
}

const TriggerConfigFields: React.FC<TriggerConfigFieldsProps> = ({
  triggerType,
  config,
  onConfigChange
}) => {
  const updateConfig = (field: string, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  switch (triggerType) {
    case 'job_scheduled':
      return (
        <div className="space-y-4">
          <div>
            <Label>Time Before Appointment</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={config.timeBefore || 24}
                onChange={(e) => updateConfig('timeBefore', parseInt(e.target.value))}
                className="flex-1"
              />
              <Select
                value={config.timeUnit || 'hours'}
                onValueChange={(value) => updateConfig('timeUnit', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Job Types (optional)</Label>
            <Select
              value={config.jobTypes || 'all'}
              onValueChange={(value) => updateConfig('jobTypes', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All job types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'payment_overdue':
      return (
        <div className="space-y-4">
          <div>
            <Label>Days Overdue</Label>
            <Input
              type="number"
              value={config.daysOverdue || 1}
              onChange={(e) => updateConfig('daysOverdue', parseInt(e.target.value))}
              placeholder="1"
            />
          </div>
          
          <div>
            <Label>Minimum Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={config.minimumAmount || ''}
                onChange={(e) => updateConfig('minimumAmount', parseFloat(e.target.value))}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>
        </div>
      );

    case 'client_created':
      return (
        <div className="space-y-4">
          <div>
            <Label>Client Source</Label>
            <Select
              value={config.source || 'all'}
              onValueChange={(value) => updateConfig('source', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="walk-in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Client Type</Label>
            <Select
              value={config.clientType || 'all'}
              onValueChange={(value) => updateConfig('clientType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'job_completed':
      return (
        <div className="space-y-4">
          <div>
            <Label>Completion Status</Label>
            <Select
              value={config.completionStatus || 'all'}
              onValueChange={(value) => updateConfig('completionStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="withInvoice"
              checked={config.withInvoice || false}
              onCheckedChange={(checked) => updateConfig('withInvoice', checked)}
            />
            <Label htmlFor="withInvoice">Only jobs with invoice</Label>
          </div>
        </div>
      );

    case 'invoice_created':
      return (
        <div className="space-y-4">
          <div>
            <Label>Amount Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={config.minAmount || ''}
                  onChange={(e) => updateConfig('minAmount', parseFloat(e.target.value))}
                  placeholder="Min"
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={config.maxAmount || ''}
                  onChange={(e) => updateConfig('maxAmount', parseFloat(e.target.value))}
                  placeholder="Max"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 'review_received':
      return (
        <div className="space-y-4">
          <div>
            <Label>Minimum Rating</Label>
            <Select
              value={config.minRating || 'any'}
              onValueChange={(value) => updateConfig('minRating', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="1">1+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Review Platform</Label>
            <Select
              value={config.platform || 'all'}
              onValueChange={(value) => updateConfig('platform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="yelp">Yelp</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'schedule_time':
      return (
        <div className="space-y-4">
          <div>
            <Label>Schedule Type</Label>
            <Select
              value={config.scheduleType || 'once'}
              onValueChange={(value) => updateConfig('scheduleType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One Time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {config.scheduleType === 'once' && (
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={config.dateTime || ''}
                onChange={(e) => updateConfig('dateTime', e.target.value)}
              />
            </div>
          )}
          
          {config.scheduleType === 'daily' && (
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={config.time || '09:00'}
                onChange={(e) => updateConfig('time', e.target.value)}
              />
            </div>
          )}
          
          {config.scheduleType === 'weekly' && (
            <>
              <div>
                <Label>Days of Week</Label>
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Badge
                      key={day}
                      variant={config.days?.includes(index) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs justify-center"
                      onClick={() => {
                        const days = config.days || [];
                        if (days.includes(index)) {
                          updateConfig('days', days.filter((d: number) => d !== index));
                        } else {
                          updateConfig('days', [...days, index]);
                        }
                      }}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={config.time || '09:00'}
                  onChange={(e) => updateConfig('time', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      );

    case 'manual':
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This workflow will only run when manually triggered by a user.
          </p>
        </div>
      );

    default:
      return null;
  }
};

export default TriggerConfigFields;