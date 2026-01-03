import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData } from "./useScheduleJobForm";

interface CustomFieldsSectionProps {
  formData: FormData;
  customFields: any[];
  customFieldsLoading: boolean;
  handleCustomFieldChange: (fieldId: string, value: string) => void;
}

export const CustomFieldsSection = ({
  formData,
  customFields,
  customFieldsLoading,
  handleCustomFieldChange,
}: CustomFieldsSectionProps) => {
  const renderCustomField = (field: any) => {
    const value = formData.customFields[field.id] || '';
    
    switch (field.field_type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Select 
              value={value} 
              onValueChange={(value) => handleCustomFieldChange(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              checked={value === 'true'}
              onCheckedChange={(checked) => 
                handleCustomFieldChange(field.id, checked ? 'true' : 'false')
              }
            />
            <Label htmlFor={field.id}>
              {field.name} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );
      
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
      
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.name} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              value={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || field.name}
            />
          </div>
        );
    }
  };

  if (customFieldsLoading || customFields.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {customFields.map(field => renderCustomField(field))}
    </div>
  );
}; 