
import { Badge } from "@/components/ui/badge";

interface ClientStatusBadgeProps {
  status?: string;
  className?: string;
}

export const ClientStatusBadge = ({ status = "active", className }: ClientStatusBadgeProps) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <Badge 
      variant={getStatusVariant(status)} 
      className={className}
    >
      {getStatusText(status)}
    </Badge>
  );
};
