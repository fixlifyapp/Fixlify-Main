import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useState } from "react";
import { toast } from "sonner";

export function TaxConfig() {
  const { taxConfig, loading, updateTaxSettings } = useTaxSettings();
  const [formData, setFormData] = useState({
    tax_rate: taxConfig.rate,
    tax_region: taxConfig.region,
    tax_label: taxConfig.label
  });

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                placeholder="13.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_region">Tax Region</Label>
              <Input
                id="tax_region"
                value={formData.tax_region}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_region: e.target.value }))}
                placeholder="Ontario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_label">Tax Label</Label>
              <Input
                id="tax_label"
                value={formData.tax_label}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_label: e.target.value }))}
                placeholder="HST"
              />
            </div>
          </div>
          <Button type="submit">Save Tax Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}