import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Activity, Settings, 
  Play, Pause, Trash2, BarChart3 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AutomationPerformanceTableProps {
  automations: any[];
  onOptimize: (automation: any) => void;
}

export const AutomationPerformanceTable = ({ 
  automations, 
  onOptimize 
}: AutomationPerformanceTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getPerformanceScore = (automation: any) => {
    if (!automation.execution_count) return 0;
    return Math.round((automation.success_count / automation.execution_count) * 100);
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Automation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Executions</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>Last Triggered</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {automations.map((automation) => {
          const score = getPerformanceScore(automation);
          const isUnderperforming = score < 80 && automation.execution_count > 10;
          
          return (
            <TableRow key={automation.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{automation.name}</p>
                  <p className="text-sm text-muted-foreground">{automation.category}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(automation.status)}>
                  {automation.status}
                </Badge>
              </TableCell>              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{automation.execution_count || 0}</span>
                  {automation.execution_count > 0 && (
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={score} className="w-20" />
                  <span className="text-sm font-medium">{score}%</span>
                  {isUnderperforming && (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {automation.last_triggered_at ? (
                  formatDistanceToNow(new Date(automation.last_triggered_at), { 
                    addSuffix: true 
                  })
                ) : (
                  'Never'
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {automation.status === 'active' ? (
                    <Button size="sm" variant="ghost">
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {isUnderperforming && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onOptimize(automation)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};