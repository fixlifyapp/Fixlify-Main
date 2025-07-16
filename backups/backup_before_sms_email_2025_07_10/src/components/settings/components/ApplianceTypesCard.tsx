
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { APPLIANCE_TYPES } from "../utils/aiSettingsUtils";

interface ApplianceTypesCardProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export const ApplianceTypesCard = ({ selectedTypes, onTypesChange }: ApplianceTypesCardProps) => {
  const toggleApplianceType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypesChange(newTypes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Services We Provide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {APPLIANCE_TYPES.map((type) => (
            <div
              key={type}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTypes.includes(type)
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => toggleApplianceType(type)}
            >
              <div className="font-medium text-sm">{type}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
