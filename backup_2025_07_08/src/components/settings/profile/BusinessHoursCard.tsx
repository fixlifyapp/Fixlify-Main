
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessHoursEditor } from "@/components/connect/BusinessHoursEditor";
import { Clock } from "lucide-react";
import { BusinessHours } from "@/types/businessHours";

interface BusinessHoursCardProps {
  businessHours: BusinessHours;
  onBusinessHoursChange: (hours: BusinessHours) => void;
}

export const BusinessHoursCard = ({ businessHours, onBusinessHoursChange }: BusinessHoursCardProps) => {
  return (
    <Card className="fixlyfy-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-fixlyfy-text">
          <Clock className="h-5 w-5 text-fixlyfy" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BusinessHoursEditor
          businessHours={businessHours}
          onBusinessHoursChange={onBusinessHoursChange}
        />
      </CardContent>
    </Card>
  );
};
