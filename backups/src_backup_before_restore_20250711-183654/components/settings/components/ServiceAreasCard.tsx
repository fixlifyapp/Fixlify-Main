
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, X } from "lucide-react";

interface ServiceAreasCardProps {
  serviceAreas: string[];
  onServiceAreasChange: (areas: string[]) => void;
}

export const ServiceAreasCard = ({ serviceAreas, onServiceAreasChange }: ServiceAreasCardProps) => {
  const [newServiceArea, setNewServiceArea] = useState('');

  const addServiceArea = () => {
    if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
      onServiceAreasChange([...serviceAreas, newServiceArea.trim()]);
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    onServiceAreasChange(serviceAreas.filter(a => a !== area));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Service Areas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newServiceArea}
            onChange={(e) => setNewServiceArea(e.target.value)}
            placeholder="Enter zip code or city name"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
          />
          <Button onClick={addServiceArea}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceAreas.map((area) => (
            <Badge
              key={area}
              variant="secondary"
              className="cursor-pointer flex items-center gap-1"
              onClick={() => removeServiceArea(area)}
            >
              {area}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
