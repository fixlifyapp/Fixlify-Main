
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface SystemSettingsCardProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
}

export const SystemSettingsCard = ({ userSettings, updateUserSettings }: SystemSettingsCardProps) => {
  const handleSettingChange = (field: string, value: string) => {
    updateUserSettings({ [field]: value });
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Settings className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={userSettings.language || 'en'} 
              onValueChange={(value) => handleSettingChange('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={userSettings.timezone || 'utc-7'} 
              onValueChange={(value) => handleSettingChange('timezone', value)}
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
                <SelectItem value="utc+3">Moscow Time (UTC+3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={userSettings.currency || 'usd'} 
              onValueChange={(value) => handleSettingChange('currency', value)}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="rub">RUB (₽)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select 
              value={userSettings.date_format || 'mm-dd-yyyy'} 
              onValueChange={(value) => handleSettingChange('date_format', value)}
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
      </CardContent>
    </Card>
  );
};
