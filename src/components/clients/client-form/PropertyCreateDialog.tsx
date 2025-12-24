
import { useState, useEffect } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhoneForTelnyx } from "@/utils/phoneUtils";

interface PropertyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientType?: string;
  onPropertyCreated: () => void;
}

export const PropertyCreateDialog = ({
  open,
  onOpenChange,
  clientId,
  clientType,
  onPropertyCreated,
}: PropertyCreateDialogProps) => {
  const [formData, setFormData] = useState({
    property_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    property_type: "Residential",
    is_primary: false,
    notes: "",
    tenant_name: "",
    tenant_phone: "",
    tenant_email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantSectionOpen, setTenantSectionOpen] = useState(false);

  // Auto-expand tenant section for Commercial/Landlord client types
  useEffect(() => {
    if (clientType === 'commercial' || clientType === 'landlord') {
      setTenantSectionOpen(true);
    }
  }, [clientType]);

  // Also expand when property type is Commercial
  useEffect(() => {
    if (formData.property_type === 'Commercial') {
      setTenantSectionOpen(true);
    }
  }, [formData.property_type]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({
      property_name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      property_type: "Residential",
      is_primary: false,
      notes: "",
      tenant_name: "",
      tenant_phone: "",
      tenant_email: "",
    });
    setTenantSectionOpen(clientType === 'commercial' || clientType === 'landlord');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.property_name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format tenant phone if provided
      const formattedTenantPhone = formData.tenant_phone
        ? formatPhoneForTelnyx(formData.tenant_phone)
        : null;

      const { error } = await supabase
        .from('client_properties')
        .insert({
          client_id: clientId,
          property_name: formData.property_name,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          property_type: formData.property_type,
          is_primary: formData.is_primary,
          notes: formData.notes || null,
          tenant_name: formData.tenant_name || null,
          tenant_phone: formattedTenantPhone,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Create a new property location for this client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="property_name">Property Name *</Label>
              <Input
                id="property_name"
                value={formData.property_name}
                onChange={(e) => handleChange("property_name", e.target.value)}
                placeholder="e.g., Main Office, Home, Secondary Location"
                required
              />
            </div>

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
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                placeholder="ZIP code"
              />
            </div>

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

            {/* Tenant Contact Section - Collapsible */}
            <Collapsible open={tenantSectionOpen} onOpenChange={setTenantSectionOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Tenant Contact</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    tenantSectionOpen && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Add tenant contact info if someone else lives at this property
                  </p>
                  <div>
                    <Label htmlFor="tenant_name">Tenant Name</Label>
                    <Input
                      id="tenant_name"
                      value={formData.tenant_name}
                      onChange={(e) => handleChange("tenant_name", e.target.value)}
                      placeholder="Name of tenant/occupant"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant_phone">Tenant Phone</Label>
                    <Input
                      id="tenant_phone"
                      value={formData.tenant_phone}
                      onChange={(e) => handleChange("tenant_phone", e.target.value)}
                      placeholder="Phone for scheduling access"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant_email">Tenant Email</Label>
                    <Input
                      id="tenant_email"
                      type="email"
                      value={formData.tenant_email}
                      onChange={(e) => handleChange("tenant_email", e.target.value)}
                      placeholder="tenant@email.com"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
