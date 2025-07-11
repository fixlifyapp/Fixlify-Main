
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Send } from "lucide-react";

interface EstimateDetailsProps {
  details: {
    estimate_number: string;
    notes?: string;
  };
  onUpdateDetails: (updates: any) => void;
  onSave: () => Promise<boolean>;
  onSaveAndSend: () => void;
  total: number;
  isLoading: boolean;
  job: any;
}

export const EstimateDetails = ({
  details,
  onUpdateDetails,
  onSave,
  onSaveAndSend,
  total,
  isLoading,
  job
}: EstimateDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimate Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="estimate-number">Estimate Number</Label>
          <Input
            id="estimate-number"
            value={details.estimate_number}
            onChange={(e) => onUpdateDetails({ estimate_number: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="job-title">Job</Label>
          <Input
            id="job-title"
            value={job.title}
            disabled
            className="bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="client-name">Client</Label>
          <Input
            id="client-name"
            value={job.client?.name || 'No client assigned'}
            disabled
            className="bg-muted"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={details.notes || ''}
            onChange={(e) => onUpdateDetails({ notes: e.target.value })}
            placeholder="Additional notes for this estimate..."
            rows={3}
            disabled={isLoading}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (13%):</span>
            <span>${(total * 0.13).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${(total * 1.13).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={onSave}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={onSaveAndSend}
            disabled={isLoading || total === 0}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
