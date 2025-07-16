
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

export const ClientValuePanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600" />
          Client Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Premium Clients</p>
              <p className="text-sm text-gray-600">High-value customers</p>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">23</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Repeat Customers</p>
              <p className="text-sm text-gray-600">Returning clients</p>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium">67%</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Lifetime Value</span>
              <span className="font-semibold">$1,247</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
