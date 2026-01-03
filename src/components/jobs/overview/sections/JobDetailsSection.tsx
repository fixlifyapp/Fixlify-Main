import React, { useState, useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnifiedJobTypeSelector } from "@/components/shared/UnifiedJobTypeSelector";
import { useConfigItems } from "@/hooks/useConfigItems";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDetailsSectionProps {
  job: {
    id: string;
    description?: string;
    job_type?: string;
    lead_source?: string;
  };
  onUpdate?: () => void;
}

// Debounce hook for auto-save
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export const JobDetailsSection = ({ job, onUpdate }: JobDetailsSectionProps) => {
  // Local state for editable fields
  const [description, setDescription] = useState(job.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Refs to track original values
  const originalDescription = useRef(job.description || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced description for auto-save
  const debouncedDescription = useDebounce(description, 800);

  // Load config items
  const { items: jobTypes, isLoading: jobTypesLoading } = useConfigItems("job_types");
  const { items: leadSources, isLoading: leadSourcesLoading } = useConfigItems("lead_sources");

  // Auto-save description when debounced value changes
  useEffect(() => {
    if (
      isEditingDescription &&
      debouncedDescription !== originalDescription.current &&
      debouncedDescription !== job.description
    ) {
      saveDescription(debouncedDescription);
    }
  }, [debouncedDescription]);

  // Update local state when job prop changes from external source
  // Skip sync if the value matches what we just saved (prevents reset after our own save)
  useEffect(() => {
    const newDesc = job.description || "";
    if (newDesc !== originalDescription.current) {
      setDescription(newDesc);
      originalDescription.current = newDesc;
    }
  }, [job.description]);

  const saveDescription = async (value: string) => {
    setSavingField("description");
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ description: value })
        .eq("id", job.id);

      if (error) throw error;

      originalDescription.current = value;
      setSavedField("description");
      setTimeout(() => setSavedField(null), 1500);
      onUpdate?.();
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save description");
    } finally {
      setSavingField(null);
    }
  };

  const handleDescriptionBlur = () => {
    // Save on blur if changed
    if (description !== originalDescription.current) {
      saveDescription(description);
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setDescription(originalDescription.current);
      setIsEditingDescription(false);
    }
  };

  const handleJobTypeChange = async (value: string) => {
    setSavingField("job_type");
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ job_type: value })
        .eq("id", job.id);

      if (error) throw error;
      setSavedField("job_type");
      setTimeout(() => setSavedField(null), 1500);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating job type:", error);
      toast.error("Failed to update job type");
    } finally {
      setSavingField(null);
    }
  };

  const handleLeadSourceChange = async (value: string) => {
    setSavingField("lead_source");
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ lead_source: value })
        .eq("id", job.id);

      if (error) throw error;
      setSavedField("lead_source");
      setTimeout(() => setSavedField(null), 1500);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating lead source:", error);
      toast.error("Failed to update lead source");
    } finally {
      setSavingField(null);
    }
  };

  // Status indicator component
  const SaveIndicator = ({ field }: { field: string }) => {
    if (savingField === field) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }
    if (savedField === field) {
      return <Check className="h-3 w-3 text-emerald-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Job Description - Click to Edit, Auto-save */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Description
          </Label>
          <SaveIndicator field="description" />
        </div>

        {isEditingDescription ? (
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            placeholder="Describe the job details..."
            rows={3}
            className="resize-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        ) : (
          <div
            className={cn(
              "p-3 rounded-lg border min-h-[80px] cursor-text transition-all",
              "hover:border-primary/50 hover:bg-muted/30",
              !description && "text-muted-foreground italic"
            )}
            onClick={() => {
              setIsEditingDescription(true);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
          >
            {description || "Click to add description..."}
          </div>
        )}
      </div>

      {/* Job Type & Lead Source - Instant save on select */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Job Type
            </Label>
            <SaveIndicator field="job_type" />
          </div>
          <UnifiedJobTypeSelector
            value={job.job_type || ""}
            onValueChange={handleJobTypeChange}
            jobTypes={jobTypes}
            isLoading={jobTypesLoading}
            required={false}
            className="w-full"
            hideLabel
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lead Source
            </Label>
            <SaveIndicator field="lead_source" />
          </div>
          <Select
            value={job.lead_source || ""}
            onValueChange={handleLeadSourceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {leadSourcesLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                leadSources
                  .filter((source: any) => source.is_active)
                  .map((source: any) => (
                    <SelectItem key={source.id} value={source.name}>
                      {source.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
