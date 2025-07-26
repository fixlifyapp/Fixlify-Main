import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface UnifiedJobTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  jobTypes: any[];
  isLoading?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  showManageLink?: boolean;
  className?: string;
}

export const UnifiedJobTypeSelector = ({
  value,
  onValueChange,
  jobTypes,
  isLoading = false,
  required = false,
  label = "Job Type",
  placeholder = "Select type",
  showManageLink = true,
  className = "",
}: UnifiedJobTypeSelectorProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>{label} {required && "*"}</Label>
        {showManageLink && (
          <Link to="/settings/configuration">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Settings className="w-3 h-3 mr-1" />
              Manage
            </Button>
          </Link>
        )}
      </div>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="" disabled>Loading types...</SelectItem>
          ) : jobTypes.length === 0 ? (
            <SelectItem value="" disabled>No job types found</SelectItem>
          ) : (
            jobTypes.map(type => (
              <SelectItem key={type.id} value={type.name}>
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
    </div>
  );
};