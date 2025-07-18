
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useJobStatuses, useJobTypes, useTags } from "@/hooks/useConfigItems";

interface JobsFiltersProps {
  onFiltersChange: (filters: any) => void;
  filters: {
    search: string;
    status: string;
    type: string;
    technician: string;
    dateRange: { start: Date | null; end: Date | null };
    tags: string[];
  };
}

export const JobsFilters = ({ onFiltersChange, filters }: JobsFiltersProps) => {
  // Get configuration data dynamically
  const { items: jobStatuses, isLoading: statusesLoading } = useJobStatuses();
  const { items: jobTypes, isLoading: typesLoading } = useJobTypes();
  const { items: tags, isLoading: tagsLoading } = useTags();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { start: range.from || null, end: range.to || null } 
    });
  };

  const handleTagToggle = (tagName: string) => {
    const newTags = filters.tags.includes(tagName)
      ? filters.tags.filter(t => t !== tagName)
      : [...filters.tags, tagName];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      type: "all",
      technician: "all",
      dateRange: { start: null, end: null },
      tags: []
    });
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.type !== "all" || 
                          filters.dateRange.start || filters.dateRange.end || filters.tags.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search - Enhanced to search multiple fields */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs, clients, descriptions..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statusesLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : (
            jobStatuses
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              .map((status) => (
                <SelectItem key={status.id} value={status.name.toLowerCase()}>
                  <div className="flex items-center gap-2">
                    {status.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                    )}
                    {status.name}
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={filters.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {typesLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : (
            jobTypes.map((type) => (
              <SelectItem key={type.id} value={type.name.toLowerCase()}>
                <div className="flex items-center gap-2">
                  {type.color && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                  )}
                  {type.name}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !filters.dateRange.start && !filters.dateRange.end && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.start ? (
              filters.dateRange.end ? (
                <>
                  {format(filters.dateRange.start, "LLL dd")} -{" "}
                  {format(filters.dateRange.end, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.start, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange.start || undefined}
            selected={{ from: filters.dateRange.start || undefined, to: filters.dateRange.end || undefined }}
            onSelect={(range) => handleDateRangeChange(range || {})}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Tags Filter - Improved functionality */}
      {!tagsLoading && tags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Tags
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter by Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleTagToggle(tag.name)}
                    style={tag.color && filters.tags.includes(tag.name) ? 
                      { backgroundColor: tag.color, color: 'white' } : 
                      tag.color ? { borderColor: tag.color, color: tag.color } : {}
                    }
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {filters.tags.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onFiltersChange({ ...filters, tags: [] })}
                  className="w-full"
                >
                  Clear Tags
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear All
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleSearchChange("")}
              />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStatusChange("all")}
              />
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTypeChange("all")}
              />
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
