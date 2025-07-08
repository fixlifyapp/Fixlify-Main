
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DeliveryWindow {
  enabled: boolean;
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
}

interface DeliveryWindowConfigProps {
  value: DeliveryWindow;
  onChange: (value: DeliveryWindow) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
];

export const DeliveryWindowConfig: React.FC<DeliveryWindowConfigProps> = ({ value, onChange }) => {
  const handleDayToggle = (day: string) => {
    const newDays = value.days?.includes(day) 
      ? value.days.filter(d => d !== day)
      : [...(value.days || []), day];
    
    onChange({
      ...value,
      days: newDays
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Window</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={value.enabled}
            onCheckedChange={(enabled) => onChange({ ...value, enabled })}
          />
          <Label>Enable delivery window restrictions</Label>
        </div>

        {value.enabled && (
          <>
            <div>
              <Label className="text-sm font-medium">Days of Week</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Switch
                      checked={value.days?.includes(day.value) || false}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={value.startTime || '09:00'}
                  onChange={(e) => onChange({ ...value, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={value.endTime || '17:00'}
                  onChange={(e) => onChange({ ...value, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Timezone</Label>
              <Select
                value={value.timezone || 'America/New_York'}
                onValueChange={(timezone) => onChange({ ...value, timezone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
