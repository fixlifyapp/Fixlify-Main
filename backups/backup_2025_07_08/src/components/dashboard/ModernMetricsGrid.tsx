
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";

export const ModernMetricsGrid = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-lg font-semibold">+12.5%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-lg font-semibold">247</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Job Value</p>
              <p className="text-lg font-semibold">$185</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-lg font-semibold">2.3h</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
