
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
import { useLeadSources } from "@/hooks/useConfigItems";

interface LeadSourceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSource: string;
  onSave: (source: string) => void;
}

export function LeadSourceSelectionDialog({
  open,
  onOpenChange,
  initialSource,
  onSave
}: LeadSourceSelectionDialogProps) {
  const [selectedSource, setSelectedSource] = useState(initialSource);
  const [newSource, setNewSource] = useState("");
  const { items: leadSources, isLoading, addItem } = useLeadSources();
  
  const activeSources = leadSources.filter(source => source.is_active);

  useEffect(() => {
    setSelectedSource(initialSource);
  }, [initialSource]);

  const handleSave = () => {
    onSave(selectedSource);
    onOpenChange(false);
    toast.success("Lead source updated");
  };

  const handleAddSource = async () => {
    if (newSource.trim()) {
      try {
        const newLeadSource = await addItem({
          name: newSource.trim(),
          is_active: true
        });
        
        if (newLeadSource) {
          setSelectedSource(newLeadSource.name);
        }
        
        setNewSource("");
        toast.success("Lead source added");
      } catch (error) {
        toast.error("Failed to add lead source");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Lead Source</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading sources...</div>
          ) : (
            <RadioGroup 
              value={selectedSource} 
              onValueChange={setSelectedSource}
              className="space-y-3"
            >
              {activeSources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={source.name} id={`source-${source.id}`} />
                  <Label htmlFor={`source-${source.id}`}>{source.name}</Label>
                </div>
              ))}
              
              {activeSources.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No lead sources available. Add one below.
                </div>
              )}
            </RadioGroup>
          )}
          
          <div className="mt-6 border-t pt-4">
            <Label className="mb-2 block">Add New Lead Source</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Enter new lead source"
                className="flex-1"
              />
              <Button 
                onClick={handleAddSource}
                disabled={!newSource.trim()}
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
