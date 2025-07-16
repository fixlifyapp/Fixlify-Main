
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SystemSettingsSectionProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
  isEditing?: boolean;
}

export const SystemSettingsSection = ({ userSettings, updateUserSettings, isEditing = true }: SystemSettingsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">System Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select 
            value={userSettings.language} 
            onValueChange={(value) => updateUserSettings({ language: value })}
            disabled={!isEditing}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select 
            value={userSettings.timezone} 
            onValueChange={(value) => updateUserSettings({ timezone: value })}
            disabled={!isEditing}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc-7">Pacific Time (UTC-7)</SelectItem>
              <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
              <SelectItem value="utc-4">Atlantic Time (UTC-4)</SelectItem>
              <SelectItem value="utc-0">UTC</SelectItem>
              <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={userSettings.currency} 
            onValueChange={(value) => updateUserSettings({ currency: value })}
            disabled={!isEditing}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="eur">EUR (€)</SelectItem>
              <SelectItem value="gbp">GBP (£)</SelectItem>
              <SelectItem value="cad">CAD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date-format">Date Format</Label>
          <Select 
            value={userSettings.date_format} 
            onValueChange={(value) => updateUserSettings({ date_format: value })}
            disabled={!isEditing}
          >
            <SelectTrigger id="date-format">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
