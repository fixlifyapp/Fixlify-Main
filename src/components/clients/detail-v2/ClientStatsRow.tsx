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

  const kpiCards = [
    {
      title: "Total Jobs",
      value: stats.total_jobs,
      label: `${stats.jobs_this_year} this year`,
      icon: Briefcase,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.total_revenue),
      label: `${formatCurrency(stats.revenue_this_year)} this year`,
      icon: DollarSign,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Avg Job Value",
      value: formatCurrency(stats.avg_job_value),
      label: "Per job average",
      icon: TrendingUp,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Last Service",
      value: formatDate(stats.last_service_date),
      label: "Most recent job",
      icon: Calendar,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${card.iconColor} shrink-0`} />
                  <p className="text-sm font-medium text-gray-600 truncate">{card.title}</p>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {card.value}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
