
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Download, Calendar, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportsFiltersProps {
  filters: {
    reportType: string;
    jobType: string;
    technician: string;
    serviceArea: string;
    adGroup: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onExport: () => void;
  onSearch: (query: string) => void;
}

export const ReportsFilters = ({ 
  filters, 
  onFilterChange, 
  onExport,
  onSearch 
}: ReportsFiltersProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {/* Primary Filters Row */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
        <Select value={filters.reportType} onValueChange={(value) => onFilterChange('reportType', value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Standard Report" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Report</SelectItem>
            <SelectItem value="custom">Custom Report</SelectItem>
            <SelectItem value="summary">Summary Report</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.jobType} onValueChange={(value) => onFilterChange('jobType', value)}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Types</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.technician} onValueChange={(value) => onFilterChange('technician', value)}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Select Technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            <SelectItem value="john-doe">John Doe</SelectItem>
            <SelectItem value="jane-smith">Jane Smith</SelectItem>
            <SelectItem value="mike-wilson">Mike Wilson</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.serviceArea} onValueChange={(value) => onFilterChange('serviceArea', value)}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="All Service Areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Service Areas</SelectItem>
            <SelectItem value="downtown">Downtown</SelectItem>
            <SelectItem value="suburbs">Suburbs</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.adGroup} onValueChange={(value) => onFilterChange('adGroup', value)}>
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Ad Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="google">Google Ads</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white border rounded-md px-3 py-2">
          <Calendar size={16} className="text-gray-500" />
          <Select value={filters.dateRange} onValueChange={(value) => onFilterChange('dateRange', value)}>
            <SelectTrigger className="border-0 p-0 h-auto shadow-none">
              <SelectValue placeholder="Custom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-sm">from</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="text-sm">to</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="w-32"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
            Export
          </Button>
          <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500">
            Export By Mail
          </Button>
          <Button variant="outline">
            Fields
          </Button>
          <Button variant="outline">
            Print
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-md p-1">
          <Button 
            variant={filters.status === 'created' ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange('status', 'created')}
            className={filters.status === 'created' ? 'bg-gray-300' : ''}
          >
            Created
          </Button>
          <Button 
            variant={filters.status === 'scheduled' ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange('status', 'scheduled')}
            className={filters.status === 'scheduled' ? 'bg-gray-300' : ''}
          >
            Scheduled
          </Button>
          <Button 
            variant={filters.status === 'closed' ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange('status', 'closed')}
            className={filters.status === 'closed' ? 'bg-gray-300' : ''}
          >
            Closed
          </Button>
        </div>
      </div>

      {/* Search and Entries */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <Select defaultValue="50">
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="search"
            className="pl-10 w-48"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
