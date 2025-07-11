
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSettings } from "@/hooks/useUserSettings";

interface TaxSettingsCardProps {
  userSettings: UserSettings;
  updateUserSettings: (updates: Partial<UserSettings>) => void;
}

const TAX_REGIONS = [
  { value: 'Alberta', label: 'Alberta (5% GST)' },
  { value: 'British Columbia', label: 'British Columbia (12% GST+PST)' },
  { value: 'Manitoba', label: 'Manitoba (12% GST+PST)' },
  { value: 'New Brunswick', label: 'New Brunswick (15% HST)' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador (15% HST)' },
  { value: 'Northwest Territories', label: 'Northwest Territories (5% GST)' },
  { value: 'Nova Scotia', label: 'Nova Scotia (15% HST)' },
  { value: 'Nunavut', label: 'Nunavut (5% GST)' },
  { value: 'Ontario', label: 'Ontario (13% HST)' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island (15% HST)' },
  { value: 'Quebec', label: 'Quebec (14.975% GST+QST)' },
  { value: 'Saskatchewan', label: 'Saskatchewan (11% GST+PST)' },
  { value: 'Yukon', label: 'Yukon (5% GST)' },
  { value: 'United States', label: 'United States (Variable Sales Tax)' },
  { value: 'Custom', label: 'Custom/Other' }
];

const TAX_LABELS = [
  { value: 'HST', label: 'HST (Harmonized Sales Tax)' },
  { value: 'GST', label: 'GST (Goods and Services Tax)' },
  { value: 'PST', label: 'PST (Provincial Sales Tax)' },
  { value: 'GST+PST', label: 'GST + PST' },
  { value: 'GST+QST', label: 'GST + QST (Quebec)' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'Tax', label: 'Tax' }
];

export const TaxSettingsCard = ({ userSettings, updateUserSettings }: TaxSettingsCardProps) => {
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
            onValueChange={(value) => updateUserSettings({ tax_region: value })}
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
