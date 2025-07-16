
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Widget {
  id: string;
  type: 'chart' | 'table';
  metric: string;
  dimension?: string;
  data?: any[];
  columns?: any[];
}

interface ReportWidgetProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
  onRemove: () => void;
}

export const ReportWidget = ({ widget, onUpdate, onRemove }: ReportWidgetProps) => {
  const renderChart = () => {
    if (!widget.data?.length) {
      return (
        <div className="h-64 flex items-center justify-center text-fixlyfy-text-secondary">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={widget.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={widget.dimension || 'date'} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={widget.metric} fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    if (!widget.data?.length || !widget.columns?.length) {
      return (
        <div className="h-64 flex items-center justify-center text-fixlyfy-text-secondary">
          No data available
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {widget.columns.map(col => (
                <th key={col.key} className="text-left p-2 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widget.data.slice(0, 10).map((row, index) => (
              <tr key={index} className="border-b">
                {widget.columns!.map(col => (
                  <td key={col.key} className="p-2">
                    {typeof row[col.key] === 'number' && col.key.includes('revenue') 
                      ? `$${row[col.key].toFixed(2)}`
                      : row[col.key] || '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <Select value={widget.metric} onValueChange={(value) => onUpdate({ metric: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="jobs">Jobs</SelectItem>
                <SelectItem value="technician_stats">Technician Stats</SelectItem>
              </SelectContent>
            </Select>
            
            {widget.type === 'chart' && (
              <Select value={widget.dimension} onValueChange={(value) => onUpdate({ dimension: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dimension" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Settings size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X size={14} />
          </Button>
        </div>
      </div>

      {widget.type === 'chart' ? renderChart() : renderTable()}
    </Card>
  );
};
