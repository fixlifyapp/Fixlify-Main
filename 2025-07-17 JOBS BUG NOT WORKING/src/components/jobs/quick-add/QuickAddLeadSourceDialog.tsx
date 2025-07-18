
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useLeadSources } from "@/hooks/useConfigItems";
import { toast } from "sonner";

interface QuickAddLeadSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadSourceAdded: (leadSource: { id: string; name: string }) => void;
}

interface LeadSourceFormData {
  name: string;
  description?: string;
  is_active: boolean;
}

export const QuickAddLeadSourceDialog = ({
  open,
  onOpenChange,
  onLeadSourceAdded
}: QuickAddLeadSourceDialogProps) => {
  const { addItem } = useLeadSources();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadSourceFormData>({
    defaultValues: {
      name: "",
      description: "",
      is_active: true
    }
  });

  const handleSubmit = async (data: LeadSourceFormData) => {
    try {
      setIsSubmitting(true);
      
      const newLeadSource = await addItem({
        name: data.name,
        description: data.description,
        is_active: data.is_active
      });
      
      if (newLeadSource) {
        onLeadSourceAdded(newLeadSource);
        toast.success("Lead source created successfully");
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating lead source:", error);
      toast.error("Failed to create lead source");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lead Source</DialogTitle>
          <DialogDescription>
            Create a new lead source to track where your clients come from.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Google Ads, Referral, Website"
              {...form.register("name", { required: "Name is required" })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this lead source"
              {...form.register("description")}
            />
          </div>
          
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Lead source is active
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lead Source"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
