import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, Info, Loader2 } from "lucide-react";
import { useJobOverview } from "@/hooks/useJobOverview";
import { useLeadSources } from "@/hooks/useConfigItems";
import { toast } from "sonner";

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
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={Info}>
            Job Overview
            {isSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </ModernCardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
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
                className="text-green-600 hover:text-green-700"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-600"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        <div className={`space-y-4 ${isSaving ? "opacity-70" : ""}`}>
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="lead_source">Lead Source</Label>
              <Select
                value={editValues.lead_source}
                onValueChange={(value) => setEditValues(prev => ({ ...prev, lead_source: value }))}
                disabled={isSaving || leadSourcesLoading}
              >
                <SelectTrigger className="w-full">
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
            <div>
              <h4 className="font-medium mb-1">Lead Source</h4>
              <p className="text-sm text-muted-foreground">
                {optimisticValues.lead_source || 'Not specified'}
              </p>
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};