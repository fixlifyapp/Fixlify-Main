
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useTags } from "@/hooks/useConfigItems";

interface TagSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTags: string[];
  onSave: (tags: string[]) => void;
}

export function TagSelectionDialog({
  open,
  onOpenChange,
  initialTags,
  onSave
}: TagSelectionDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const { items: tags, isLoading, addItem } = useTags();

  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  const handleToggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddTag = async () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      try {
        const newTagItem = await addItem({
          name: newTag.trim(),
          category: 'General',
          color: '#6366f1'
        });
        
        if (newTagItem) {
          setSelectedTags(prev => [...prev, newTagItem.name]);
        }
        
        setNewTag("");
        toast.success("Tag added");
      } catch (error) {
        toast.error("Failed to add tag");
      }
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

  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Selected tags */}
          <div>
            <Label className="mb-2 block">Selected Tags</Label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => {
                  const tagData = tags.find(t => t.name === tag);
                  return (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="flex items-center gap-1"
                      style={tagData?.color ? { borderColor: tagData.color, color: tagData.color } : undefined}
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTag(tag)}
                        className="h-4 w-4 p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">No tags selected</span>
              )}
            </div>
          </div>
          
          {/* Add custom tag */}
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add new tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
            />
            <Button 
              onClick={handleAddTag}
              disabled={!newTag.trim() || isLoading}
            >
              <Plus size={16} /> Add
            </Button>
          </div>
          
          {/* Available tags by category */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : (
            Object.entries(groupedTags).map(([category, categoryTags]) => (
              <div key={category}>
                <Label className="mb-2 block font-medium">{category}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={selectedTags.includes(tag.name)}
                        onCheckedChange={() => handleToggleTag(tag.name)}
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {tag.color && (
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
