import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { TAX_COUNTRIES, getTaxDetailsByCountryAndRegion } from "@/utils/taxRegions";

export function TaxConfig() {
  const { taxConfig, loading, updateTaxSettings } = useTaxSettings();
  const [formData, setFormData] = useState({
    country: 'Canada',
    tax_rate: taxConfig.rate,
    tax_region: taxConfig.region,
    tax_label: taxConfig.label
  });

  // Update form data when taxConfig changes - use specific values instead of whole object
  useEffect(() => {
    // Determine country from existing region
    let detectedCountry = 'Canada';
    
    // Check which country this region belongs to
    for (const [countryName, countryData] of Object.entries(TAX_COUNTRIES)) {
      if (countryData.provinces.find(p => p.value === taxConfig.region)) {
        detectedCountry = countryName;
        break;
      }
    }
    
    setFormData({
      country: detectedCountry,
      tax_rate: taxConfig.rate,
      tax_region: taxConfig.region,
      tax_label: taxConfig.label
    });
  }, [taxConfig.rate, taxConfig.region, taxConfig.label]); // Only depend on specific values

  // Handle country selection
  const handleCountryChange = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country,
      tax_region: '', // Reset region when country changes
      tax_rate: 0,
      tax_label: 'Tax'
    }));
  };

  // Handle region selection with automatic rate and label updates
  const handleRegionChange = (region: string) => {
    const selectedRegion = getTaxDetailsByCountryAndRegion(formData.country, region);
    console.log('Region change:', region, 'Country:', formData.country, 'Found:', selectedRegion);
    
    if (selectedRegion) {
      const newFormData = {
        ...formData,
        tax_region: region,
        tax_rate: selectedRegion.rate,
        tax_label: selectedRegion.taxLabel
      };
      console.log('Updating form data:', newFormData);
      setFormData(newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting tax settings:', formData);
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

  const availableProvinces = TAX_COUNTRIES[formData.country as keyof typeof TAX_COUNTRIES]?.provinces || [];

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
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TAX_COUNTRIES).map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_region">Province/State</Label>
              <Select
                value={formData.tax_region}
                onValueChange={handleRegionChange}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select your province/state" : "First select a country"} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {availableProvinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
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
                  value={formData.tax_rate || 0}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  placeholder="Select province to see rate"
                />
                <p className="text-xs text-muted-foreground">Rate is automatically set based on your province/state selection</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_label">Tax Label</Label>
                <Input
                  id="tax_label"
                  value={formData.tax_label || 'Tax'}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  placeholder="Select province to see label"
                />
                <p className="text-xs text-muted-foreground">Label is automatically set based on your province/state selection</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Preview:</strong> Items will show "{formData.tax_label} ({formData.tax_rate}%)" 
              for taxable items in {formData.tax_region || 'your selected province'}.
            </p>
          </div>

          <Button type="submit" disabled={!formData.tax_region || formData.tax_rate === 0}>
            Save Tax Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}