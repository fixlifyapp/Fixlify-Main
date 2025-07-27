import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { TAX_REGIONS, TAX_LABELS } from "@/utils/taxRegions";

export function TaxConfig() {
  const { taxConfig, loading, updateTaxSettings } = useTaxSettings();
  const [formData, setFormData] = useState({
    tax_rate: taxConfig.rate,
    tax_region: taxConfig.region,
    tax_label: taxConfig.label
  });

  // Update form data when taxConfig changes
  useEffect(() => {
    setFormData({
      tax_rate: taxConfig.rate,
      tax_region: taxConfig.region,
      tax_label: taxConfig.label
    });
  }, [taxConfig]);

  // Handle region selection with automatic rate and label updates
  const handleRegionChange = (region: string) => {
    const selectedRegion = TAX_REGIONS.find(r => r.value === region);
    if (selectedRegion) {
      setFormData(prev => ({
        ...prev,
        tax_region: region,
        tax_rate: selectedRegion.rate,
        tax_label: selectedRegion.taxLabel
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTaxSettings({
        default_tax_rate: formData.tax_rate,
        tax_region: formData.tax_region,
        tax_label: formData.tax_label
      });
      toast.success("Tax settings updated successfully");
    } catch (error) {
      console.error('Error updating tax settings:', error);
      toast.error("Failed to update tax settings");
    }
  };

  if (loading) {
    return <div>Loading tax settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Configuration</CardTitle>
        <CardDescription>
          Configure default tax settings for invoices and estimates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax_region">Tax Region/Province</Label>
              <Select
                value={formData.tax_region}
                onValueChange={handleRegionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your tax region" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="50"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="13.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_label">Tax Label</Label>
                <Select
                  value={formData.tax_label}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tax_label: value }))}
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
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Preview:</strong> Items will show "{formData.tax_label} ({formData.tax_rate}%)" 
              for taxable items in {formData.tax_region}.
            </p>
          </div>

          <Button type="submit">Save Tax Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}