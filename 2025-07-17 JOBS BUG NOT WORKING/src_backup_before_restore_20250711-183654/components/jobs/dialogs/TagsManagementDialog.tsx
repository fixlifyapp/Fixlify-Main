
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { globalTags, getTagColor } from "@/data/tags";

interface TagsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTags: string[];
  onSave: (tags: string[]) => void;
}

export function TagsManagementDialog({
  open,
  onOpenChange,
  initialTags,
  onSave,
}: TagsManagementDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  
  const commonTags = globalTags.map(tag => tag.name);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = () => {
    onSave(selectedTags);
    onOpenChange(false);
    toast.success("Tags updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Selected tags */}
          <div>
            <Label>Selected Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getTagColor(tag)}`}
                  >
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags selected</p>
              )}
            </div>
          </div>
          
          {/* Add custom tag */}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
            />
            <Button 
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>
          
          {/* Common tags */}
          <div>
            <Label className="mb-2 block">Common Tags</Label>
            <div className="grid grid-cols-2 gap-2">
              {globalTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`tag-${tag.id}`} 
                    checked={selectedTags.includes(tag.name)}
                    onCheckedChange={() => handleToggleTag(tag.name)}
                  />
                  <Label 
                    htmlFor={`tag-${tag.id}`}
                    className={`px-2 py-0.5 rounded-md ${tag.color}`}
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
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
