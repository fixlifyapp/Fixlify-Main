import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X, Info, Loader2 } from "lucide-react";
import { useJobOverview } from "@/hooks/useJobOverview";
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
    property_type: overview?.property_type || "",
    property_age: overview?.property_age || "",
    property_size: overview?.property_size || "",
    lead_source: overview?.lead_source || "",
    previous_service_date: overview?.previous_service_date ? overview.previous_service_date.split('T')[0] : "",
  });
  const [optimisticValues, setOptimisticValues] = useState(overview || {});
  const { saveOverview } = useJobOverview(jobId);

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
        property_type: overview?.property_type || "",
        property_age: overview?.property_age || "",
        property_size: overview?.property_size || "",
        lead_source: overview?.lead_source || "",
        previous_service_date: overview?.previous_service_date ? overview.previous_service_date.split('T')[0] : "",
      });
      setIsEditing(true);
      toast.error("Failed to update job overview");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValues({
      property_type: overview?.property_type || "",
      property_age: overview?.property_age || "",
      property_size: overview?.property_size || "",
      lead_source: overview?.lead_source || "",
      previous_service_date: overview?.previous_service_date ? overview.previous_service_date.split('T')[0] : "",
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
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isSaving ? "opacity-70" : ""}`}>
          {isEditing ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select value={editValues.property_type} onValueChange={(value) => setEditValues(prev => ({ ...prev, property_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Multi-family">Multi-family</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="property_age">Property Age</Label>
                  <Select value={editValues.property_age} onValueChange={(value) => setEditValues(prev => ({ ...prev, property_age: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5 years">0-5 years</SelectItem>
                      <SelectItem value="6-10 years">6-10 years</SelectItem>
                      <SelectItem value="11-20 years">11-20 years</SelectItem>
                      <SelectItem value="21-30 years">21-30 years</SelectItem>
                      <SelectItem value="31-50 years">31-50 years</SelectItem>
                      <SelectItem value="50+ years">50+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="property_size">Property Size</Label>
                  <Input
                    id="property_size"
                    value={editValues.property_size}
                    onChange={(e) => setEditValues(prev => ({ ...prev, property_size: e.target.value }))}
                    placeholder="e.g., 2000 sq ft, 3 bed/2 bath"
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Input
                    id="lead_source"
                    value={editValues.lead_source}
                    onChange={(e) => setEditValues(prev => ({ ...prev, lead_source: e.target.value }))}
                    placeholder="Enter lead source"
                    disabled={isSaving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="previous_service_date">Previous Service Date</Label>
                  <Input
                    id="previous_service_date"
                    type="date"
                    value={editValues.previous_service_date}
                    onChange={(e) => setEditValues(prev => ({ ...prev, previous_service_date: e.target.value }))}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Property Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {optimisticValues.property_type || 'Not specified'}
                  </p>
                </div>
                
                {optimisticValues.property_age && (
                  <div>
                    <h4 className="font-medium mb-1">Property Age</h4>
                    <p className="text-sm text-muted-foreground">{optimisticValues.property_age}</p>
                  </div>
                )}
                
                {optimisticValues.property_size && (
                  <div>
                    <h4 className="font-medium mb-1">Property Size</h4>
                    <p className="text-sm text-muted-foreground">{optimisticValues.property_size}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Lead Source</h4>
                  <p className="text-sm text-muted-foreground">
                    {optimisticValues.lead_source || 'Not specified'}
                  </p>
                </div>
                
                {optimisticValues.previous_service_date && (
                  <div>
                    <h4 className="font-medium mb-1">Previous Service Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(optimisticValues.previous_service_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};