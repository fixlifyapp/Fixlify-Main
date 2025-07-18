
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/components/auth/types";

interface TeamFiltersProps {
  onSearch: (term: string) => void;
  onFilterRole: (role: string | null) => void;
  onFilterStatus: (status: string | null) => void;
  searchTerm: string;
  roleFilter: string | null;
  statusFilter: string | null;
}

export const TeamFilters = ({
  onSearch,
  onFilterRole,
  onFilterStatus,
  searchTerm,
  roleFilter,
  statusFilter
}: TeamFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    onSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  // Helper function to handle empty values
  const getNullableValue = (value: string | null) => {
    return value === null ? "all" : value;
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9 pr-9"
          value={localSearch}
          onChange={handleSearchChange}
        />
        {localSearch && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <div className="flex gap-3">
        <Select
          value={getNullableValue(roleFilter)}
          onValueChange={(value) => onFilterRole(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="dispatcher">Dispatcher</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={getNullableValue(statusFilter)}
          onValueChange={(value) => onFilterStatus(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
