import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, Info, Loader2 } from "lucide-react";
import { useJobOverview } from "@/hooks/useJobOverview";
import { useLeadSources } from "@/hooks/useConfigItems";
import { toast } from "sonner";
import { ProfessionalCard, ProfessionalSectionHeader } from "@/components/ui/professional-card";

interface EditableJobOverviewCardProps {
  overview: any;
  jobId: string;
  onUpdate?: () => void;
}

export const EditableJobOverviewCard = ({ overview, jobId, onUpdate }: EditableJobOverviewCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    lead_source: overview?.lead_source || "",
  });
  const [optimisticValues, setOptimisticValues] = useState(overview || {});
  const { saveOverview } = useJobOverview(jobId);
  const { items: leadSources, isLoading: leadSourcesLoading } = useLeadSources();

  // Filter to only show active lead sources
  const activeLeadSources = leadSources.filter(source => source.is_active !== false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Optimistic update
    setOptimisticValues({
      ...optimisticValues,
      ...editValues
    });
    setIsEditing(false);
    
    try {
      const result = await saveOverview(editValues);
      if (result) {
        toast.success("Job overview updated successfully");
        onUpdate?.();
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticValues(overview || {});
      setEditValues({
        lead_source: overview?.lead_source || "",
      });
      setIsEditing(true);
      toast.error("Failed to update job overview");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValues({
      lead_source: overview?.lead_source || "",
    });
    setIsEditing(false);
  };

  return (
    <ProfessionalCard>
      <ProfessionalSectionHeader
        icon={Info}
        title="Job Overview"
        subtitle={isSaving ? "Saving..." : undefined}
        action={
          !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              disabled={isSaving}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-500 hover:text-slate-600 hover:bg-slate-50"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      />
      <div className={`${isSaving ? "opacity-70" : ""}`}>
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="lead_source" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Lead Source
            </Label>
            <Select
              value={editValues.lead_source}
              onValueChange={(value) => setEditValues(prev => ({ ...prev, lead_source: value }))}
              disabled={isSaving || leadSourcesLoading}
            >
              <SelectTrigger className="w-full border-slate-200 focus:border-slate-400 focus:ring-slate-300">
                <SelectValue placeholder={leadSourcesLoading ? "Loading..." : "Select lead source"} />
              </SelectTrigger>
              <SelectContent>
                {activeLeadSources.map((source) => (
                  <SelectItem key={source.id} value={source.name}>
                    {source.name}
                  </SelectItem>
                ))}
                {activeLeadSources.length === 0 && !leadSourcesLoading && (
                  <SelectItem value="" disabled>
                    No lead sources configured
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Lead Source</p>
            <p className="text-base font-medium text-slate-800">
              {optimisticValues.lead_source || (
                <span className="text-slate-400 italic">Not specified</span>
              )}
            </p>
          </div>
        )}
      </div>
    </ProfessionalCard>
  );
};