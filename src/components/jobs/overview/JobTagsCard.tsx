
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Tag, Plus } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useTags } from "@/hooks/useConfigItems";
import { toast } from "sonner";
import { TagSelectionDialog } from "../dialogs/TagSelectionDialog";
import { getTagColor } from "@/data/tags";

interface JobTagsCardProps {
  tags: string[];
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const JobTagsCard = ({ tags, jobId, editable = false, onUpdate }: JobTagsCardProps) => {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [resolvedTags, setResolvedTags] = useState<Array<{name: string, color?: string}>>([]);
  const { updateJob } = useJobs();
  const { items: tagItems } = useTags();

  // Resolve tag UUIDs to tag names and colors
  useEffect(() => {
    if (!tags || tags.length === 0) {
      setResolvedTags([]);
      return;
    }

    const resolved = tags.map(tag => {
      // If it's a UUID, find the tag by ID
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = tagItems.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: getTagColor(tag) };
      }
      // If it's a name, find the tag by name
      const tagItem = tagItems.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: getTagColor(String(tag)) };
    });

    setResolvedTags(resolved);
  }, [tags, tagItems]);

  if (!resolvedTags || resolvedTags.length === 0) {
    if (!editable) return null;
    
    return (
      <>
        <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
          <ModernCardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <ModernCardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </ModernCardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="text-muted-foreground">No tags assigned yet</p>
          </ModernCardContent>
        </ModernCard>

        <TagSelectionDialog
          open={isTagDialogOpen}
          onOpenChange={setIsTagDialogOpen}
          initialTags={[]}
          onSave={async (selectedTags) => {
            if (jobId) {
              const result = await updateJob(jobId, { tags: selectedTags });
              if (result) {
                toast.success("Tags updated successfully");
                if (onUpdate) {
                  onUpdate();
                }
              }
            }
          }}
        />
      </>
    );
  }

  const handleTagsUpdate = async (selectedTags: string[]) => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, { tags: selectedTags });
    if (result) {
      toast.success("Tags updated successfully");
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="flex flex-wrap gap-2">
            {resolvedTags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs"
                style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>

      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        initialTags={resolvedTags.map(t => t.name)}
        onSave={handleTagsUpdate}
      />
    </>
  );
};
