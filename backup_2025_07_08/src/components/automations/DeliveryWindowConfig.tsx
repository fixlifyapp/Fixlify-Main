import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DeliveryWindowConfigProps {
  deliveryWindow?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
    weekdays?: boolean[];
  };
  onChange: (deliveryWindow: any) => void;
  userTimezone?: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sun', short: 'S' },
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AK)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HI)' },
  { value: 'UTC', label: 'UTC' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour12}:00 ${ampm}`,
  };
});

export const DeliveryWindowConfig: React.FC<DeliveryWindowConfigProps> = ({
  deliveryWindow = {
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    weekdays: [1, 2, 3, 4, 5], // Mon-Fri default
  },
  onChange,
  userTimezone = 'America/New_York',
}) => {
  const [currentTime, setCurrentTime] = useState('');

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setCurrentTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [userTimezone]);

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...deliveryWindow,
      enabled,
      timezone: deliveryWindow.timezone || userTimezone,
    });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    onChange({
      ...deliveryWindow,
      [field]: value,
    });
  };

  const handleTimezoneChange = (timezone: string) => {
    onChange({
      ...deliveryWindow,
      timezone,
    });
  };

  const handleWeekdayToggle = (day: number) => {
    const currentWeekdays = deliveryWindow.weekdays || [1, 2, 3, 4, 5];
    const newWeekdays = currentWeekdays.includes(day)
      ? currentWeekdays.filter(d => d !== day)
      : [...currentWeekdays, day].sort();
    
    onChange({
      ...deliveryWindow,
      weekdays: newWeekdays,
    });
  };

  return (
    <Card className="p-4 border-dashed">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="delivery-window" className="text-sm font-medium">
              Delivery Window
            </Label>
          </div>
          <Switch
            id="delivery-window"
            checked={deliveryWindow.enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {deliveryWindow.enabled && (
          <div className="space-y-3 pl-6">
            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Select
                  value={deliveryWindow.startTime}
                  onValueChange={(value) => handleTimeChange('startTime', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Select
                  value={deliveryWindow.endTime}
                  onValueChange={(value) => handleTimeChange('endTime', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekdays */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Days of Week</Label>
              <div className="flex gap-1">
                {WEEKDAYS.map(day => {
                  const isSelected = (deliveryWindow.weekdays || [1, 2, 3, 4, 5]).includes(day.value);
                  return (
                    <button
                      key={day.value}
                      onClick={() => handleWeekdayToggle(day.value)}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-colors
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Timezone
              </Label>
              <Select
                value={deliveryWindow.timezone || userTimezone}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger className="h-8 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Messages will only be sent during these hours. Messages triggered outside this window will be queued and sent at the next available time.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};