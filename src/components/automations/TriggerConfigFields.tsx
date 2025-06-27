import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, Filter, Sun, Cloud, CloudRain, CloudSnow, ThermometerSun } from 'lucide-react';

interface TriggerConfigFieldsProps {
  triggerType: string;
  config: Record<string, any>;
  onUpdate: (config: Record<string, any>) => void;
  jobStatuses?: Array<{ id: string; name: string }>;
}

const TriggerConfigFields: React.FC<TriggerConfigFieldsProps> = ({
  triggerType,
  config,
  onUpdate,
  jobStatuses = []
}) => {
  const updateConfig = (field: string, value: any) => {
    onUpdate({ ...config, [field]: value });
  };

  switch (triggerType) {
    case 'job_completed':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Job Type (Optional)</Label>
            <Select value={config.jobType || 'all'} onValueChange={(v) => updateConfig('jobType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Service Category</Label>
            <Select value={config.serviceCategory || 'all'} onValueChange={(v) => updateConfig('serviceCategory', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Include Weekend Jobs</Label>
            <Switch 
              checked={config.includeWeekends ?? true} 
              onCheckedChange={(v) => updateConfig('includeWeekends', v)} 
            />
          </div>
        </div>
      );

    case 'job_scheduled':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Send Reminder</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={config.hoursBeforeJob || 24}
                onChange={(e) => updateConfig('hoursBeforeJob', parseInt(e.target.value) || 24)}
                className="w-20"
                min="1"
              />
              <span className="text-sm text-muted-foreground">hours before appointment</span>
            </div>
          </div>
          <div>
            <Label>Priority Level</Label>
            <Select value={config.priority || 'all'} onValueChange={(v) => updateConfig('priority', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority Only</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'invoice_threshold':
    case 'invoice_paid':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Amount Threshold</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">$</span>
              <Input
                type="number"
                value={config.threshold || config.minAmount || 500}
                onChange={(e) => updateConfig(triggerType === 'invoice_threshold' ? 'threshold' : 'minAmount', parseInt(e.target.value) || 0)}
                placeholder="0 for any amount"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trigger only for invoices above this amount
            </p>
          </div>
          {triggerType === 'invoice_paid' && (
            <div>
              <Label>Payment Method</Label>
              <Select value={config.paymentMethod || 'all'} onValueChange={(v) => updateConfig('paymentMethod', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="ach">ACH Transfer</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {triggerType === 'invoice_threshold' && (
            <div className="flex items-center justify-between">
              <Label>Include Estimates</Label>
              <Switch 
                checked={config.includeEstimates ?? false} 
                onCheckedChange={(v) => updateConfig('includeEstimates', v)} 
              />
            </div>
          )}
        </div>
      );

    case 'payment_overdue':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Days Overdue</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[config.daysOverdue || 7]}
                onValueChange={([v]) => updateConfig('daysOverdue', v)}
                min={1}
                max={90}
                step={1}
                className="flex-1"
              />
              <Badge variant="secondary" className="w-16 justify-center">
                {config.daysOverdue || 7} days
              </Badge>
            </div>
          </div>
          <div>
            <Label>Minimum Amount</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">$</span>
              <Input
                type="number"
                value={config.minAmount || 0}
                onChange={(e) => updateConfig('minAmount', parseInt(e.target.value) || 0)}
                placeholder="0 for any amount"
                min="0"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Exclude Disputed Invoices</Label>
            <Switch 
              checked={config.excludeDisputed ?? true} 
              onCheckedChange={(v) => updateConfig('excludeDisputed', v)} 
            />
          </div>
        </div>
      );

    case 'customer_created':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Customer Source</Label>
            <Select value={config.source || 'all'} onValueChange={(v) => updateConfig('source', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Required Contact Info</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Has Phone Number</span>
              <Switch 
                checked={config.hasPhoneNumber ?? false} 
                onCheckedChange={(v) => updateConfig('hasPhoneNumber', v)} 
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Has Email Address</span>
              <Switch 
                checked={config.hasEmail ?? false} 
                onCheckedChange={(v) => updateConfig('hasEmail', v)} 
              />
            </div>
          </div>
        </div>
      );

    case 'rating_below_threshold':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Rating Threshold</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[config.ratingThreshold || 3]}
                onValueChange={([v]) => updateConfig('ratingThreshold', v)}
                min={1}
                max={5}
                step={0.5}
                className="flex-1"
              />
              <Badge variant="secondary" className="w-20 justify-center">
                ≤ {config.ratingThreshold || 3} stars
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Include Reviews with Comments</Label>
            <Switch 
              checked={config.includeComments ?? true} 
              onCheckedChange={(v) => updateConfig('includeComments', v)} 
            />
          </div>
        </div>
      );

    case 'days_since_last_service':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Days Since Service</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[config.daysSince || 90]}
                onValueChange={([v]) => updateConfig('daysSince', v)}
                min={30}
                max={365}
                step={30}
                className="flex-1"
              />
              <Badge variant="secondary" className="w-20 justify-center">
                {config.daysSince || 90} days
              </Badge>
            </div>
          </div>
          <div>
            <Label>Service Type</Label>
            <Select value={config.serviceType || 'all'} onValueChange={(v) => updateConfig('serviceType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Customer Segment</Label>
            <Select value={config.customerSegment || 'all'} onValueChange={(v) => updateConfig('customerSegment', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="vip">VIP Customers</SelectItem>
                <SelectItem value="regular">Regular Customers</SelectItem>
                <SelectItem value="new">New Customers (&lt; 6 months)</SelectItem>
                <SelectItem value="at_risk">At Risk (no recent activity)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'weather_forecast':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Weather Condition</Label>
            <Select value={config.weatherCondition || 'extreme_heat'} onValueChange={(v) => updateConfig('weatherCondition', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extreme_heat">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4" />
                    Extreme Heat
                  </div>
                </SelectItem>
                <SelectItem value="extreme_cold">
                  <div className="flex items-center gap-2">
                    <CloudSnow className="w-4 h-4" />
                    Extreme Cold
                  </div>
                </SelectItem>
                <SelectItem value="heavy_rain">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    Heavy Rain
                  </div>
                </SelectItem>
                <SelectItem value="storm">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Storm Warning
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Temperature Threshold (°F)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[config.temperature || 90]}
                onValueChange={([v]) => updateConfig('temperature', v)}
                min={config.weatherCondition?.includes('cold') ? -20 : 50}
                max={config.weatherCondition?.includes('cold') ? 50 : 120}
                step={5}
                className="flex-1"
              />
              <Badge variant="secondary" className="w-16 justify-center">
                {config.temperature || 90}°F
              </Badge>
            </div>
          </div>
          <div>
            <Label>Forecast Days Ahead</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={config.daysAhead || 1}
                onChange={(e) => updateConfig('daysAhead', parseInt(e.target.value) || 1)}
                className="w-20"
                min="1"
                max="7"
              />
              <span className="text-sm text-muted-foreground">days ahead</span>
            </div>
          </div>
        </div>
      );

    case 'membership_expiring':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Days Before Expiry</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[config.daysBeforeExpiry || 30]}
                onValueChange={([v]) => updateConfig('daysBeforeExpiry', v)}
                min={7}
                max={90}
                step={7}
                className="flex-1"
              />
              <Badge variant="secondary" className="w-20 justify-center">
                {config.daysBeforeExpiry || 30} days
              </Badge>
            </div>
          </div>
          <div>
            <Label>Membership Type</Label>
            <Select value={config.membershipType || 'all'} onValueChange={(v) => updateConfig('membershipType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="maintenance">Maintenance Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'time_based':
      return (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Schedule Type</Label>
            <Select value={config.schedule || 'daily'} onValueChange={(v) => updateConfig('schedule', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={config.time || '09:00'}
              onChange={(e) => updateConfig('time', e.target.value)}
            />
          </div>
          {config.schedule === 'weekly' && (
            <div>
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <Badge
                    key={day}
                    variant={config.recurringDays?.includes(index) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const days = config.recurringDays || [];
                      if (days.includes(index)) {
                        updateConfig('recurringDays', days.filter(d => d !== index));
                      } else {
                        updateConfig('recurringDays', [...days, index]);
                      }
                    }}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'estimate_sent':
    case 'estimate_expired':
      return (
        <div className="space-y-4 mt-4">
          {triggerType === 'estimate_expired' && (
            <div>
              <Label>Days Until Expiry</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[config.daysUntilExpiry || 7]}
                  onValueChange={([v]) => updateConfig('daysUntilExpiry', v)}
                  min={1}
                  max={30}
                  step={1}
                  className="flex-1"
                />
                <Badge variant="secondary" className="w-20 justify-center">
                  {config.daysUntilExpiry || 7} days
                </Badge>
              </div>
            </div>
          )}
          <div>
            <Label>Minimum Estimate Amount</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">$</span>
              <Input
                type="number"
                value={config.minAmount || config.estimateAmount || 0}
                onChange={(e) => updateConfig(triggerType === 'estimate_sent' ? 'minAmount' : 'estimateAmount', parseInt(e.target.value) || 0)}
                placeholder="0 for any amount"
                min="0"
              />
            </div>
          </div>
          <div>
            <Label>Estimate Type</Label>
            <Select value={config.estimateType || 'all'} onValueChange={(v) => updateConfig('estimateType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Estimates</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="maintenance">Maintenance Contract</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'manual':
      return (
        <div className="mt-4 p-4 bg-muted rounded-lg">
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
