
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CustomInstructionsCardProps {
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

export const CustomInstructionsCard = ({ instructions, onInstructionsChange }: CustomInstructionsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom AI Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Add specific instructions for how your AI should handle calls..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Example: "Always ask about warranty status", "Mention our 24/7 emergency service"
        </p>
      </CardContent>
    </Card>
  );
};
