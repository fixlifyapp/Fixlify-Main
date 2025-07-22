
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit2, Save } from "lucide-react";
import { useState } from "react";

interface NotesCardProps {
  jobId: string;
}

export const NotesCard = ({ jobId }: NotesCardProps) => {
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Save notes logic
    console.log('Saving notes for job:', jobId, notes);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add job notes..."
            rows={4}
          />
        ) : (
          <div className="min-h-[100px] p-3 border rounded-md bg-muted/50">
            {notes || (
              <p className="text-muted-foreground">No notes added yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
