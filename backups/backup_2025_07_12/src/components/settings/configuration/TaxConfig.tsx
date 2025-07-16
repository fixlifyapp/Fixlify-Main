
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Receipt, Save, Info } from "lucide-react";

const TAX_REGIONS = [
  { value: 'Alberta', label: 'Alberta', rate: 5.00, taxLabel: 'GST' },
  { value: 'British Columbia', label: 'British Columbia', rate: 12.00, taxLabel: 'GST+PST' },
  { value: 'Manitoba', label: 'Manitoba', rate: 12.00, taxLabel: 'GST+PST' },
  { value: 'New Brunswick', label: 'New Brunswick', rate: 15.00, taxLabel: 'HST' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador', rate: 15.00, taxLabel: 'HST' },
  { value: 'Northwest Territories', label: 'Northwest Territories', rate: 5.00, taxLabel: 'GST' },
  { value: 'Nova Scotia', label: 'Nova Scotia', rate: 15.00, taxLabel: 'HST' },
  { value: 'Nunavut', label: 'Nunavut', rate: 5.00, taxLabel: 'GST' },
  { value: 'Ontario', label: 'Ontario', rate: 13.00, taxLabel: 'HST' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island', rate: 15.00, taxLabel: 'HST' },
  { value: 'Quebec', label: 'Quebec', rate: 14.975, taxLabel: 'GST+QST' },
  { value: 'Saskatchewan', label: 'Saskatchewan', rate: 11.00, taxLabel: 'GST+PST' },
  { value: 'Yukon', label: 'Yukon', rate: 5.00, taxLabel: 'GST' },
  { value: 'United States', label: 'United States', rate: 8.25, taxLabel: 'Sales Tax' },
];

export const TaxConfig = () => {
  const { taxConfig, loading, updateTaxSettings } = useTaxSettings();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');

  // Update selected region when taxConfig changes
  useEffect(() => {
    console.log('TaxConfig - taxConfig updated:', taxConfig);
    if (taxConfig.region) {
      setSelectedRegion(taxConfig.region);
    }
  }, [taxConfig.region]);

  const handleRegionChange = (selectedRegionValue: string) => {
    console.log('TaxConfig - Region changed to:', selectedRegionValue);
    setSelectedRegion(selectedRegionValue);
  };

  const handleSave = async () => {
    const region = TAX_REGIONS.find(r => r.value === selectedRegion);
    if (!region) {
      toast.error('Please select a valid tax region');
      return;
    }

    console.log('TaxConfig - Saving tax settings for region:', region);
    setIsUpdating(true);
    
    try {
      await updateTaxSettings({
        tax_region: region.value,
        default_tax_rate: region.rate,
        tax_label: region.taxLabel
      });
      toast.success('Tax settings updated successfully');
      console.log('TaxConfig - Tax settings saved successfully');
    } catch (error) {
      console.error('TaxConfig - Error saving tax settings:', error);
      toast.error('Failed to update tax settings');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Get current region data for preview
  const currentRegionData = TAX_REGIONS.find(r => r.value === selectedRegion);
  const previewRate = currentRegionData?.rate || 0;
  const previewLabel = currentRegionData?.taxLabel || 'Tax';

  // Check if there are changes to enable save button
  const hasChanges = selectedRegion !== taxConfig.region;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-medium">Tax Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure your default tax settings for estimates, invoices, and products
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Default Tax Settings
          </CardTitle>
          <CardDescription>
            Select your tax region and the tax rate and label will be automatically set
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tax-region">Tax Region/Jurisdiction</Label>
            <Select
              value={selectedRegion}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tax region" />
              </SelectTrigger>
              <SelectContent>
                {TAX_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label} ({region.rate}% {region.taxLabel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Preview</h4>
                <p className="text-sm text-blue-700">
                  Items will show "{previewLabel} ({previewRate}%)" 
                  for taxable items in {selectedRegion || 'selected region'}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating || !hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Tax Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
