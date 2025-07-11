
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useJobTypes } from "@/hooks/useConfigItems";
import { toast } from "sonner";

interface QuickAddJobTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobTypeAdded?: (jobType: { id: string; name: string }) => void;
}

export const QuickAddJobTypeDialog = ({ 
  open, 
  onOpenChange, 
  onJobTypeAdded 
}: QuickAddJobTypeDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addItem } = useJobTypes();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Job type name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newJobType = await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        is_default: isDefault
      });
      
      if (newJobType) {
        toast.success(`Job type "${newJobType.name}" added successfully`);
        onJobTypeAdded?.(newJobType);
        setName("");
        setDescription("");
        setIsDefault(false);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding job type:", error);
      toast.error("Failed to add job type");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Job Type</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HVAC Repair"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label htmlFor="is_default">Set as default job type</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Job Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
