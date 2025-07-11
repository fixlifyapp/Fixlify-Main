
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TechnicianCard } from "./TechnicianCard";
import { TechnicianMetric } from "@/hooks/useTeamMetrics";

interface TopTechniciansProps {
  technicians: TechnicianMetric[];
  isLoading: boolean;
  formatValue: (value: number) => string;
}

export const TopTechnicians = ({
  technicians,
  isLoading,
  formatValue
}: TopTechniciansProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Top Performing Technicians</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
        </div>
      ) : technicians.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech, index) => (
            <TechnicianCard
              key={tech.id}
              name={tech.name}
              jobCount={tech.job_count}
              revenue={tech.total_revenue}
              index={index}
              formatValue={formatValue}
              avatar={tech.avatar}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-fixlyfy-text-secondary">
            <p>No technician data available for this period</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
