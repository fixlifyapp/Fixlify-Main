
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X } from "lucide-react";

interface JobDetailsProps {
  jobId: string;
}

interface JobFormData {
  description: string;
  scheduleDate: string;
  scheduleTime: string;
  type: string;
  tags: string[];
  team: string;
  source: string;
  clientId?: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    description: "",
    scheduleDate: "",
    scheduleTime: "",
    type: "",
    tags: [],
    team: "",
    source: ""
  });

  const handleSave = async () => {
    // Save logic here
    console.log('Saving job details:', { jobId, ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Job Details</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Job description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Schedule Date</label>
                <Input
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Schedule Time</label>
                <Input
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {formData.description || "No description provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Scheduled Date</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.scheduleDate || "Not scheduled"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Scheduled Time</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.scheduleTime || "Not scheduled"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Job Type</h4>
              {formData.type ? (
                <Badge variant="outline">{formData.type}</Badge>
              ) : (
                <p className="text-sm text-muted-foreground">No type selected</p>
              )}
            </div>

            {formData.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
