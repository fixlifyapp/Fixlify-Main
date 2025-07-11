
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";

interface ClientInfoCardProps {
  client: {
    name: string;
    email: string;
    phone?: string;
  };
}

export export const ClientInfoCard = ({ client }: ClientInfoCardProps) => {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Your Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-medium text-sm sm:text-base truncate">{client.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-medium text-sm sm:text-base truncate">{client.email}</div>
            </div>
          </div>
          {client.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium text-sm sm:text-base">{client.phone}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
