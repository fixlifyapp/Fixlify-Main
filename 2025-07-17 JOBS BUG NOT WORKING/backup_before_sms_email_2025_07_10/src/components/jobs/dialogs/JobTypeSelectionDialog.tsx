
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useJobTypes } from "@/hooks/useConfigItems";

interface JobTypeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: string;
  onSave: (type: string) => void;
}

export function JobTypeSelectionDialog({
  open,
  onOpenChange,
  initialType,
  onSave
}: JobTypeSelectionDialogProps) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [newType, setNewType] = useState("");
  const { items: jobTypes, isLoading, addItem } = useJobTypes();

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const handleSave = () => {
    onSave(selectedType);
    onOpenChange(false);
    toast.success("Job type updated");
  };

  const handleAddType = async () => {
    if (newType.trim()) {
      try {
        const newJobType = await addItem({
          name: newType.trim(),
          is_default: false
        });
        
        if (newJobType) {
          setSelectedType(newJobType.name);
        }
        
        setNewType("");
        toast.success("Job type added");
      } catch (error) {
        toast.error("Failed to add job type");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Job Type</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading job types...</div>
          ) : (
            <RadioGroup 
              value={selectedType} 
              onValueChange={setSelectedType}
              className="space-y-3"
            >
              {jobTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.name} id={`type-${type.id}`} />
                  <Label htmlFor={`type-${type.id}`} className="flex items-center gap-2">
                    {type.color && (
                      <div 
                        className="w-3 h-3 rounded-full border" 
                        style={{ backgroundColor: type.color }}
                      />
                    )}
                    {type.name}
                  </Label>
                </div>
              ))}
              
              {jobTypes.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No job types available. Add one below.
                </div>
              )}
            </RadioGroup>
          )}
          
          <div className="mt-6 border-t pt-4">
            <Label className="mb-2 block">Add New Job Type</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Enter new job type"
                className="flex-1"
              />
              <Button 
                onClick={handleAddType}
                disabled={!newType.trim()}
                type="button"
              >
                <Plus size={16} /> Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
