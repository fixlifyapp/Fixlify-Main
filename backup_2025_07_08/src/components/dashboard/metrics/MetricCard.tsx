
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: number;
  changeLabel?: string;
  isLoading: boolean;
}

export const MetricCard = ({
  title,
  value,
  icon,
  iconColor,
  change,
  changeLabel,
  isLoading
}: MetricCardProps) => (
  <Card className="shadow-sm">
    <CardContent className="pt-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-md ${iconColor}`}>
              {icon}
            </div>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm text-fixlyfy-text-secondary">{title}</h3>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            {changeLabel && (
              <p className="text-xs text-fixlyfy-text-secondary mt-1">{changeLabel}</p>
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);
