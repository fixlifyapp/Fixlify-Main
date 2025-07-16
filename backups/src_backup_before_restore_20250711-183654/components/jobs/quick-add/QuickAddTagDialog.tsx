
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTags } from "@/hooks/useConfigItems";
import { toast } from "sonner";

interface QuickAddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagAdded?: (tag: { id: string; name: string }) => void;
}

const TAG_CATEGORIES = [
  "General",
  "Service Type",
  "Equipment",
  "Location",
  "Status",
  "Customer Type"
];

export const QuickAddTagDialog = ({ 
  open, 
  onOpenChange, 
  onTagAdded 
}: QuickAddTagDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addItem } = useTags();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTag = await addItem({
        name: name.trim(),
        category: category
      });
      
      if (newTag) {
        toast.success(`Tag "${newTag.name}" added successfully`);
        onTagAdded?.(newTag);
        setName("");
        setCategory("General");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tag</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tag Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Urgent, Emergency, Warranty"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TAG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
