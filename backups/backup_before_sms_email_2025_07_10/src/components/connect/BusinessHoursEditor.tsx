
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { BusinessHours } from "@/types/businessHours";

interface BusinessHoursEditorProps {
  businessHours: BusinessHours;
  onBusinessHoursChange: (hours: BusinessHours) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export const BusinessHoursEditor = ({ businessHours, onBusinessHoursChange }: BusinessHoursEditorProps) => {
  const updateDay = (day: string, field: 'open' | 'close' | 'enabled', value: string | boolean) => {
    const updatedHours = {
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    };
    onBusinessHoursChange(updatedHours);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="w-20">
              <Switch
                checked={businessHours[key]?.enabled || false}
                onCheckedChange={(checked) => updateDay(key, 'enabled', checked)}
              />
            </div>
            <div className="w-24 text-sm font-medium">
              {label}
            </div>
            {businessHours[key]?.enabled && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${key}-open`} className="text-xs">Open:</Label>
                  <Input
                    id={`${key}-open`}
                    type="time"
                    value={businessHours[key]?.open || '08:00'}
                    onChange={(e) => updateDay(key, 'open', e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${key}-close`} className="text-xs">Close:</Label>
                  <Input
                    id={`${key}-close`}
                    type="time"
                    value={businessHours[key]?.close || '17:00'}
                    onChange={(e) => updateDay(key, 'close', e.target.value)}
                    className="w-32"
                  />
                </div>
              </>
            )}
            {!businessHours[key]?.enabled && (
              <div className="text-sm text-muted-foreground">Closed</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
