import { Briefcase, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientStatsRowProps {
  stats: {
    total_jobs: number;
    total_revenue: number;
    avg_job_value: number;
    jobs_this_year: number;
    revenue_this_year: number;
    last_service_date: string | null;
  };
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  iconColor: string;
  bgColor: string;
}

const StatCard = ({ icon: Icon, label, value, subValue, iconColor, bgColor }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-md hover:border-border">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground truncate">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground/70">{subValue}</p>
        )}
      </div>
      <div className={`shrink-0 rounded-lg p-2.5 ${bgColor} transition-transform group-hover:scale-110`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export const ClientStatsRow = ({ stats }: ClientStatsRowProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Briefcase}
        label="Total Jobs"
        value={stats.total_jobs}
        subValue={`${stats.jobs_this_year} this year`}
        iconColor="text-blue-600"
        bgColor="bg-blue-500/10"
      />
      <StatCard
        icon={DollarSign}
        label="Total Revenue"
        value={formatCurrency(stats.total_revenue)}
        subValue={`${formatCurrency(stats.revenue_this_year)} this year`}
        iconColor="text-emerald-600"
        bgColor="bg-emerald-500/10"
      />
      <StatCard
        icon={TrendingUp}
        label="Avg Job Value"
        value={formatCurrency(stats.avg_job_value)}
        iconColor="text-violet-600"
        bgColor="bg-violet-500/10"
      />
      <StatCard
        icon={Calendar}
        label="Last Service"
        value={formatDate(stats.last_service_date)}
        iconColor="text-amber-600"
        bgColor="bg-amber-500/10"
      />
    </div>
  );
};
