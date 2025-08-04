import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useClientStatsOptimized } from "@/hooks/useClientStatsOptimized";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientStatsCardProps {
  clientId: string;
}

export const ClientStatsCard = ({ clientId }: ClientStatsCardProps) => {
  const { stats, isLoading } = useClientStatsOptimized(clientId);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader>
        <ModernCardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Client Statistics
          </div>
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Wrench className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-600">Total Jobs</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900">{stats.totalJobs}</div>
                <div className="text-xs text-blue-600">{stats.jobsThisYear} this year</div>
              </>
            )}
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">Total Revenue</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-xs text-green-600">{formatCurrency(stats.revenueThisYear)} this year</div>
              </>
            )}
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm font-medium text-orange-600">Avg Job Value</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto" />
            ) : (
              <div className="text-2xl font-bold text-orange-900">{formatCurrency(stats.averageJobValue)}</div>
            )}
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-600">Last Service</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-24 mx-auto" />
            ) : (
              <div className="text-sm font-bold text-purple-900">{formatDate(stats.lastServiceDate)}</div>
            )}
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};