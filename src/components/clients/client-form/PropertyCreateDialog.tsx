
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onPropertyCreated: () => void;
}

export const PropertyCreateDialog = ({
  open,
  onOpenChange,
  clientId,
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.property_name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsSubmitting(true);

    try {
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

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="grid gap-4 py-4 px-1">
        <div className="space-y-2">
          <Label htmlFor="property_name">Property Name *</Label>
          <Input
            id="property_name"
            value={formData.property_name}
            onChange={(e) => handleChange("property_name", e.target.value)}
            placeholder="e.g., Main Office, Home"
            required
          />
        </div>

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="State"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            placeholder="ZIP code"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="is_primary"
            checked={formData.is_primary}
            onCheckedChange={(checked) => handleChange("is_primary", checked === true)}
          />
          <Label htmlFor="is_primary" className="text-sm font-normal">
            Set as primary property
          </Label>
        </div>
      </div>
    </form>
  );

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="flex-1 sm:flex-none"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex-1 sm:flex-none"
      >
        {isSubmitting ? "Creating..." : "Create Property"}
      </Button>
    </>
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Property</DrawerTitle>
            <DrawerDescription>
              Create a new property location for this client.
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="flex-1 px-4 overflow-y-auto max-h-[60vh]">
            {formContent}
          </ScrollArea>
          <DrawerFooter className="flex-row gap-3 pt-4">
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Create a new property location for this client.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
