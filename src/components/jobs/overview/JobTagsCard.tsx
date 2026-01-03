import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Tag, Plus } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useUnifiedJobData } from "@/hooks/useUnifiedJobData";
import { toast } from "sonner";
import { TagSelectionDialog } from "../dialogs/TagSelectionDialog";
import { getTagColor } from "@/data/tags";
import { ProfessionalCard, ProfessionalSectionHeader, ProfessionalBadgeGroup } from "@/components/ui/professional-card";

interface JobTagsCardProps {
  tags: string[];
  jobId?: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const JobTagsCard = ({ tags, jobId, editable = false, onUpdate }: JobTagsCardProps) => {
  const { tags: unifiedTags, isLoading: tagsLoading } = useUnifiedJobData();
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [resolvedTags, setResolvedTags] = useState<Array<{ name: string; color?: string }>>([]);
  const { updateJob } = useJobs();

  // Resolve tag UUIDs to tag names and colors
  useEffect(() => {
    if (!tags || tags.length === 0) {
      setResolvedTags([]);
      return;
    }

    const resolved = tags.map(tag => {
      // If it's a UUID, find the tag by ID
      if (typeof tag === 'string' && tag.length === 36 && tag.includes('-')) {
        const tagItem = unifiedTags.find(t => t.id === tag);
        return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: tag, color: getTagColor(tag) };
      }
      // If it's a name, find the tag by name
      const tagItem = unifiedTags.find(t => t.name === tag);
      return tagItem ? { name: tagItem.name, color: tagItem.color } : { name: String(tag), color: getTagColor(String(tag)) };
    });

    setResolvedTags(resolved);
  }, [tags, unifiedTags]);

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

  if (!resolvedTags || resolvedTags.length === 0) {
    if (!editable) return null;

    return (
      <>
        <ProfessionalCard>
          <ProfessionalSectionHeader
            icon={Tag}
            title="Tags"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
          <p className="text-slate-400 text-sm italic">No tags assigned yet</p>
        </ProfessionalCard>

        <TagSelectionDialog
          open={isTagDialogOpen}
          onOpenChange={setIsTagDialogOpen}
          initialTags={[]}
          onSave={handleTagsUpdate}
        />
      </>
    );
  }

  return (
    <>
      <ProfessionalCard>
        <ProfessionalSectionHeader
          icon={Tag}
          title="Tags"
          subtitle={`${resolvedTags.length} tag${resolvedTags.length > 1 ? 's' : ''}`}
          action={
            editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTagDialogOpen(true)}
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )
          }
        />
        <ProfessionalBadgeGroup badges={resolvedTags} maxVisible={10} />
      </ProfessionalCard>

      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        initialTags={resolvedTags.map(t => t.name)}
        onSave={handleTagsUpdate}
      />
    </>
  );
};
