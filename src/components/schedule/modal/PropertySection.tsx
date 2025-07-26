import React from "react";
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

interface PropertySectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: string) => (value: string) => void;
}

export const PropertySection = ({
  formData,
  handleChange,
  handleSelectChange,
}: PropertySectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type</Label>
          <Select value={formData.property_type || ''} onValueChange={handleSelectChange('property_type')}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Multi-family">Multi-family</SelectItem>
              <SelectItem value="Condo">Condo</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_age">Property Age</Label>
          <Select value={formData.property_age || ''} onValueChange={handleSelectChange('property_age')}>
            <SelectTrigger>
              <SelectValue placeholder="Select property age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-5 years">0-5 years</SelectItem>
              <SelectItem value="6-10 years">6-10 years</SelectItem>
              <SelectItem value="11-20 years">11-20 years</SelectItem>
              <SelectItem value="21-30 years">21-30 years</SelectItem>
              <SelectItem value="31-50 years">31-50 years</SelectItem>
              <SelectItem value="50+ years">50+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_size">Property Size</Label>
          <Input
            id="property_size"
            value={formData.property_size || ''}
            onChange={handleChange}
            placeholder="e.g., 2000 sq ft, 3 bed/2 bath"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previous_service_date">Previous Service Date</Label>
          <Input
            id="previous_service_date"
            type="date"
            value={formData.previous_service_date || ''}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};