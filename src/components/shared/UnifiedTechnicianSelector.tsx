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
import { User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UnifiedTechnicianSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  technicians: any[];
  isLoading?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  showManageLink?: boolean;
  allowUnassigned?: boolean;
  className?: string;
}

export const UnifiedTechnicianSelector = ({
  value,
  onValueChange,
  technicians,
  isLoading = false,
  required = false,
  label = "Technician",
  placeholder = "Select technician",
  showManageLink = true,
  allowUnassigned = true,
  className = "",
}: UnifiedTechnicianSelectorProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label>{label} {required && "*"}</Label>
        {showManageLink && (
          <Link to="/settings/team">
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
            <SelectItem value="" disabled>Loading technicians...</SelectItem>
          ) : (
            <>
              {allowUnassigned && (
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span>Unassigned</span>
                  </div>
                </SelectItem>
              )}
              {technicians.length === 0 ? (
                <SelectItem value="" disabled>No technicians found</SelectItem>
              ) : (
                technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {tech.name ? tech.name.substring(0, 2).toUpperCase() : 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{tech.name}</span>
                        {tech.email && (
                          <span className="text-xs text-muted-foreground">{tech.email}</span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};