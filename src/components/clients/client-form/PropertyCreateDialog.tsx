// Property Create Dialog - Full dialog for creating properties from the Properties Tab
// Now with AddressAutocomplete and geocoding support

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressAutocomplete, type AddressData } from "@/components/shared/AddressAutocomplete";
import { AddressPreviewCard } from "@/components/shared/AddressPreviewCard";
import { Home, Building2, Factory, Store, Building, MapPin, Users } from "lucide-react";

interface PropertyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onPropertyCreated: () => void;
  showTenantSection?: boolean;
}

const PROPERTY_TYPES = [
  { value: 'Residential', label: 'Residential', icon: Home },
  { value: 'Commercial', label: 'Commercial', icon: Building2 },
  { value: 'Industrial', label: 'Industrial', icon: Factory },
  { value: 'Retail', label: 'Retail', icon: Store },
  { value: 'Office', label: 'Office', icon: Building },
  { value: 'Other', label: 'Other', icon: MapPin },
];

export const PropertyCreateDialog = ({
  open,
  onOpenChange,
  clientId,
  onPropertyCreated,
  showTenantSection = false,
}: PropertyCreateDialogProps) => {
  const [formData, setFormData] = useState({
    property_name: "",
    property_type: "Residential",
    is_primary: false,
    notes: "",
    // Tenant info
    tenant_name: "",
    tenant_phone: "",
    tenant_email: "",
  });

  // Address state from autocomplete
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddressSelect = (data: AddressData) => {
    setAddressData(data);
    // Auto-fill property name if empty
    if (!formData.property_name && data.address) {
      setFormData(prev => ({
        ...prev,
        property_name: data.address,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      property_name: "",
      property_type: "Residential",
      is_primary: false,
      notes: "",
      tenant_name: "",
      tenant_phone: "",
      tenant_email: "",
    });
    setAddressData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.property_name.trim()) {
      toast.error("Property name is required");
      return;
    }

    if (!addressData?.address) {
      toast.error("Please select an address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('client_properties')
        .insert({
          client_id: clientId,
          property_name: formData.property_name,
          property_type: formData.property_type,
          is_primary: formData.is_primary,
          notes: formData.notes || null,
          // Address from autocomplete
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          country: addressData.country,
          formatted_address: addressData.formatted_address,
          // Geocoding data
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          geocoded_at: addressData.latitude ? new Date().toISOString() : null,
          // Tenant info
          tenant_name: formData.tenant_name || null,
          tenant_phone: formData.tenant_phone || null,
          tenant_email: formData.tenant_email || null,
        });

      if (error) throw error;

      toast.success("Property created successfully!");
      onPropertyCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-fixlyfy" />
            Add New Property
          </DialogTitle>
          <DialogDescription>
            Create a new service location for this client. Address will be verified automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Property Name */}
            <div>
              <Label htmlFor="property_name">Property Name *</Label>
              <Input
                id="property_name"
                value={formData.property_name}
                onChange={(e) => handleChange("property_name", e.target.value)}
                placeholder="e.g., Main Office, Home, Unit 2A"
                required
              />
            </div>

            {/* Property Type */}
            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => handleChange("property_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Address Autocomplete */}
            <div className="space-y-2">
              <Label>Address *</Label>
              <AddressAutocomplete
                placeholder="Start typing address..."
                onSelect={handleAddressSelect}
                autoGeocode
              />
              <p className="text-xs text-muted-foreground">
                Type to search - address will be verified automatically
              </p>
            </div>

            {/* Address Preview */}
            {addressData && (
              <AddressPreviewCard
                address={addressData}
                showGeocodeStatus
              />
            )}

            {/* Tenant Section */}
            {showTenantSection && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-fixlyfy" />
                  Tenant Information (Optional)
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="tenant_name">Tenant Name</Label>
                    <Input
                      id="tenant_name"
                      value={formData.tenant_name}
                      onChange={(e) => handleChange("tenant_name", e.target.value)}
                      placeholder="Tenant's full name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="tenant_phone">Tenant Phone</Label>
                      <Input
                        id="tenant_phone"
                        value={formData.tenant_phone}
                        onChange={(e) => handleChange("tenant_phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenant_email">Tenant Email</Label>
                      <Input
                        id="tenant_email"
                        value={formData.tenant_email}
                        onChange={(e) => handleChange("tenant_email", e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about this property..."
                rows={3}
              />
            </div>

            {/* Primary Property Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => handleChange("is_primary", checked === true)}
              />
              <Label htmlFor="is_primary">Set as primary property</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !addressData?.address}
              className="bg-fixlyfy hover:bg-fixlyfy/90"
            >
              {isSubmitting ? "Creating..." : "Create Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
