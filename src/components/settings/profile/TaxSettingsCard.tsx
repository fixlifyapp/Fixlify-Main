
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSettings } from "@/hooks/useUserSettings";

interface TaxSettingsCardProps {
  userSettings: UserSettings;
  updateUserSettings: (updates: Partial<UserSettings>) => void;
}

import { TAX_REGIONS, TAX_LABELS, getTaxDetailsByRegion } from "@/utils/taxRegions";

export const TaxSettingsCard = ({ userSettings, updateUserSettings }: TaxSettingsCardProps) => {
  // Handle region selection with automatic rate and label updates
  const handleRegionChange = (region: string) => {
    const selectedRegion = getTaxDetailsByRegion(region);
    if (selectedRegion) {
      updateUserSettings({
        tax_region: region,
        default_tax_rate: selectedRegion.rate,
        tax_label: selectedRegion.taxLabel
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Configuration</CardTitle>
        <CardDescription>
          Configure your default tax settings for estimates, invoices, and products
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={userSettings.default_tax_rate || 13}
              onChange={(e) => updateUserSettings({ 
                default_tax_rate: parseFloat(e.target.value) || 0 
              })}
              placeholder="13.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-label">Tax Label</Label>
            <Select
              value={userSettings.tax_label || 'HST'}
              onValueChange={(value) => updateUserSettings({ tax_label: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tax label" />
              </SelectTrigger>
              <SelectContent>
                {TAX_LABELS.map((label) => (
                  <SelectItem key={label.value} value={label.value}>
                    {label.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax-region">Tax Region/Jurisdiction</Label>
            <Select
              value={userSettings.tax_region || 'Ontario'}
              onValueChange={handleRegionChange}
            >
            <SelectTrigger>
              <SelectValue placeholder="Select tax region" />
            </SelectTrigger>
            <SelectContent>
              {TAX_REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Preview:</strong> Items will show "{userSettings.tax_label || 'HST'} ({userSettings.default_tax_rate || 13}%)" 
            for taxable items in {userSettings.tax_region || 'Ontario'}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
