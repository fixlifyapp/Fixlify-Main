import { useState } from "react";
import { ChevronDown, Briefcase, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency, cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  status: string;
  job_type?: string;
  date?: string;
  schedule_start?: string;
  revenue?: number;
  created_at: string;
}

interface RecentJobsCardProps {
  jobs: Job[];
  totalCount: number;
  clientId: string;
}

const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'in_progress':
    case 'in-progress':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'scheduled':
      return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'new':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
};

const formatJobDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const RecentJobsCard = ({ jobs, totalCount, clientId }: RecentJobsCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center justify-between border-b border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Recent Jobs</h3>
              <Badge variant="secondary" className="text-xs">
                {totalCount}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {jobs.length > 0 ? (
            <>
              {/* Jobs Table */}
              <div className="divide-y divide-border/50">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-xs capitalize border", getStatusStyle(job.status))}
                    >
                      {job.status?.replace('_', ' ')}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {job.title || 'Untitled Job'}
                      </p>
                      {job.job_type && (
                        <p className="text-xs text-muted-foreground">{job.job_type}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatJobDate(job.schedule_start || job.date || job.created_at)}
                    </div>

                    {job.revenue !== undefined && job.revenue > 0 && (
                      <div className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(job.revenue)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              {totalCount > jobs.length && (
                <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/jobs?client=${clientId}`)}
                  >
                    View All Jobs ({totalCount})
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No jobs yet</p>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
