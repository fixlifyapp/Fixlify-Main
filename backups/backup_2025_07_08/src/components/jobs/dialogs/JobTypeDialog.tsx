
import { useState } from "react";
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

interface JobTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: string;
  onSave: (type: string) => void;
  onAddType?: (type: string) => void;
}

export function JobTypeDialog({
  open,
  onOpenChange,
  initialType,
  onSave,
  onAddType
}: JobTypeDialogProps) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [newType, setNewType] = useState("");

  const types = [
    "Installation", 
    "Repair", 
    "Maintenance", 
    "Inspection", 
    "Emergency", 
    "Replacement", 
    "Consultation"
  ];

  const handleSave = () => {
    onSave(selectedType);
    onOpenChange(false);
    toast.success("Job type updated");
  };

  const handleAddType = () => {
    if (newType.trim() && onAddType) {
      onAddType(newType.trim());
      setNewType("");
      toast.success("Custom job type added");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Job Type</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedType} 
            onValueChange={setSelectedType}
            className="space-y-3"
          >
            {types.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}`} />
                <Label htmlFor={`type-${type}`}>{type}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {onAddType && (
            <div className="mt-6 border-t pt-4">
              <Label className="mb-2 block">Add Custom Job Type</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Enter custom job type"
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
          )}
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
