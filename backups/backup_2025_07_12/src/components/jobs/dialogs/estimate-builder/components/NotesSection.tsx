
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeInput } from "@/utils/security";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const NotesSection = ({ notes, onNotesChange }: NotesSectionProps) => {
  const handleNotesChange = (value: string) => {
    // Sanitize input to prevent XSS and limit length
    const sanitizedNotes = sanitizeInput(value, 2000);
    onNotesChange(sanitizedNotes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="upsell-notes">Special Instructions or Comments</Label>
          <Textarea
            id="upsell-notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add any special notes or instructions for the client..."
            rows={3}
            maxLength={2000}
          />
          <div className="text-xs text-muted-foreground">
            {notes.length}/2000 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
