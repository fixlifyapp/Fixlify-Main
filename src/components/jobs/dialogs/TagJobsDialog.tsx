
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface TagJobsDialogProps {
  selectedJobs: string[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (tags: string[]) => void;
}

export function TagJobsDialog({ selectedJobs, onOpenChange, onSuccess }: TagJobsDialogProps) {
  const { tags, isLoading: tagsLoading } = useUnifiedJobData();
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags(prev => [...prev, customTag]);
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update each job with the new tags
      for (const jobId of selectedJobs) {
        // Get current job tags
        const { data: currentJob, error: fetchError } = await supabase
          .from('jobs')
          .select('tags')
          .eq('id', jobId)
          .single();

        if (fetchError) {
          console.error(`Failed to fetch job ${jobId}:`, fetchError);
          continue;
        }

        // Merge existing tags with new ones
        const existingTags = Array.isArray(currentJob.tags) ? currentJob.tags : [];
        const newTags = [...new Set([...existingTags, ...selectedTags])];

        // Update the job with new tags
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ 
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);

        if (updateError) {
          console.error(`Failed to update job ${jobId}:`, updateError);
          throw updateError;
        }
      }
      
      toast.success(`Successfully tagged ${selectedJobs.length} job${selectedJobs.length > 1 ? 's' : ''}`);
      onSuccess(selectedTags);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to tag jobs:", error);
      toast.error("Failed to tag jobs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Tags to Jobs</DialogTitle>
        <DialogDescription>
          Select tags to add to the {selectedJobs.length} selected jobs.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Tags
            </label>
            {tagsLoading ? (
              <div className="text-center py-4">
                <span className="text-sm text-muted-foreground">Loading tags...</span>
              </div>
            ) : tags.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`tag-${tag.id}`} 
                      checked={selectedTags.includes(tag.name)}
                      onCheckedChange={() => handleTagToggle(tag.name)}
                    />
                    <label 
                      htmlFor={`tag-${tag.id}`} 
                      className="text-sm px-2 py-0.5 rounded-md border cursor-pointer"
                      style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-sm text-muted-foreground">No tags available. Create tags in Settings → Configuration.</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Custom Tag
            </label>
            <div className="flex gap-2">
              <Input 
                value={customTag} 
                onChange={(e) => setCustomTag(e.target.value)} 
                placeholder="Enter custom tag"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Tags:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => {
                  const tagData = tags.find(t => t.name === tag);
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="flex items-center gap-1"
                      style={tagData?.color ? { borderColor: tagData.color, color: tagData.color } : {}}
                    >
                      {tag}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
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
          <Button type="submit" disabled={isSubmitting || selectedTags.length === 0}>
            {isSubmitting ? "Adding Tags..." : "Add Tags"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
