
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Filter, 
  X, 
  Search, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings,
  Save,
  RefreshCw
} from "lucide-react";
import { TimePeriod } from "@/types/dashboard";

interface FilterState {
  services: string[];
  technicians: string[];
  revenueRange: [number, number];
  customerType: string;
  jobStatus: string[];
}

interface SmartFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

export const SmartFilters = ({ onFiltersChange, timePeriod, onTimePeriodChange }: SmartFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    services: [],
    technicians: [],
    revenueRange: [0, 10000],
    customerType: 'all',
    jobStatus: []
  });

  const [savedFilters, setSavedFilters] = useState<{ name: string; filters: FilterState }[]>([
    { name: 'High Value Jobs', filters: { 
      services: ['HVAC'], 
      technicians: [], 
      revenueRange: [500, 10000], 
      customerType: 'commercial', 
      jobStatus: ['completed']
    }},
    { name: 'This Week', filters: { 
      services: [], 
      technicians: [], 
      revenueRange: [0, 10000], 
      customerType: 'all', 
      jobStatus: ['in-progress', 'scheduled']
    }}
  ]);

  const serviceOptions = ['HVAC', 'Plumbing', 'Electrical', 'General Maintenance'];
  const technicianOptions = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Lisa Wilson'];
  const statusOptions = ['scheduled', 'in-progress', 'completed', 'on-hold'];

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      services: [],
      technicians: [],
      revenueRange: [0, 10000] as [number, number],
      customerType: 'all',
      jobStatus: []
    };
    setActiveFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const applySavedFilter = (savedFilter: { name: string; filters: FilterState }) => {
    setActiveFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.services.length > 0) count++;
    if (activeFilters.technicians.length > 0) count++;
    if (activeFilters.revenueRange[0] > 0 || activeFilters.revenueRange[1] < 10000) count++;
    if (activeFilters.customerType !== 'all') count++;
    if (activeFilters.jobStatus.length > 0) count++;
    return count;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Smart Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">{getActiveFilterCount()} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {isExpanded ? 'Simple' : 'Advanced'}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Time Period Selector */}
          <div className="flex flex-wrap gap-2">
            <Label className="text-sm font-medium">Time Period:</Label>
            {(['week', 'month', 'quarter', 'custom'] as TimePeriod[]).map((period) => (
              <Button
                key={period}
                variant={timePeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimePeriodChange(period)}
              >
                {period === 'week' ? 'This Week' : 
                 period === 'month' ? 'This Month' : 
                 period === 'quarter' ? 'Last 90 Days' : 'Custom'}
              </Button>
            ))}
          </div>

          {/* Saved Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applySavedFilter(saved)}
                  className="text-xs"
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-6 pt-4 border-t">
              {/* Service Types */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Service Types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceOptions.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        checked={activeFilters.services.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter('services', [...activeFilters.services, service]);
                          } else {
                            updateFilter('services', activeFilters.services.filter(s => s !== service));
                          }
                        }}
                      />
                      <Label className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technicians */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Technicians</Label>
                <div className="grid grid-cols-2 gap-2">
                  {technicianOptions.map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox
                        checked={activeFilters.technicians.includes(tech)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter('technicians', [...activeFilters.technicians, tech]);
                          } else {
                            updateFilter('technicians', activeFilters.technicians.filter(t => t !== tech));
                          }
                        }}
                      />
                      <Label className="text-sm">{tech}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Revenue Range: ${activeFilters.revenueRange[0]} - ${activeFilters.revenueRange[1]}
                </Label>
                <Slider
                  value={activeFilters.revenueRange}
                  onValueChange={(value) => updateFilter('revenueRange', value as [number, number])}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Customer Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer Type</Label>
                <Select
                  value={activeFilters.customerType}
                  onValueChange={(value) => updateFilter('customerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        checked={activeFilters.jobStatus.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilter('jobStatus', [...activeFilters.jobStatus, status]);
                          } else {
                            updateFilter('jobStatus', activeFilters.jobStatus.filter(s => s !== status));
                          }
                        }}
                      />
                      <Label className="text-sm capitalize">{status.replace('-', ' ')}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
