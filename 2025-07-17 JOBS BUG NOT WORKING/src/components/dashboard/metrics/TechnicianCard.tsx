
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TechnicianCardProps {
  name: string;
  jobCount: number;
  revenue: number;
  index: number;
  formatValue: (value: number) => string;
  avatar?: string;
}

export const TechnicianCard = ({
  name,
  jobCount,
  revenue,
  index,
  formatValue,
  avatar
}: TechnicianCardProps) => {
  // Get initials from name for avatar fallback
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
    
  return (
    <Card key={index} className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{name}</h3>
              <p className="text-fixlyfy-text-secondary text-sm">{jobCount} Jobs Completed</p>
            </div>
          </div>
          <div className="bg-fixlyfy text-white px-2 py-1 rounded-md text-sm font-medium">
            #{index + 1}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xl font-semibold">{formatValue(revenue)}</p>
          <p className="text-xs text-fixlyfy-text-secondary">Total Revenue</p>
        </div>
      </CardContent>
    </Card>
  );
};
