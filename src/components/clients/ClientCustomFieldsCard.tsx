import React, { useState } from "react";
import { useClientCustomFields } from "@/hooks/useClientCustomFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Edit2,
  Check,
  X,
  Settings2,
  Type,
  Hash,
  Calendar as CalendarIcon,
  List,
  CheckSquare,
  AlignLeft,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ClientCustomFieldsCardProps {
  clientId: string;
  embedded?: boolean;
}

const getFieldTypeIcon = (fieldType: string) => {
  switch (fieldType) {
    case 'text':
      return Type;
    case 'textarea':
      return AlignLeft;
    case 'number':
      return Hash;
    case 'date':
      return CalendarIcon;
    case 'select':
      return List;
    case 'checkbox':
      return CheckSquare;
    default:
      return Type;
  }
};

const getFieldTypeBadge = (fieldType: string) => {
  const colors: Record<string, string> = {
    text: 'bg-blue-50 text-blue-600 border-blue-200',
    textarea: 'bg-violet-50 text-violet-600 border-violet-200',
    number: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    date: 'bg-amber-50 text-amber-600 border-amber-200',
    select: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    checkbox: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return colors[fieldType] || colors.text;
};

export const ClientCustomFieldsCard = ({ clientId, embedded = false }: ClientCustomFieldsCardProps) => {
  const navigate = useNavigate();
  const {
    customFieldValues,
    availableFields,
    isLoading,
    saveCustomFieldValues,
    refreshFields
  } = useClientCustomFields(clientId);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Initialize edit values when entering edit mode
  const handleStartEdit = () => {
    const currentValues: Record<string, string> = {};
    availableFields.forEach(field => {
      const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
      currentValues[field.id] = existingValue?.value || field.default_value || '';
    });
    setEditValues(currentValues);
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Validate required fields
    const missingRequired = availableFields
      .filter(f => f.required && !editValues[f.id]?.trim())
      .map(f => f.name);

    if (missingRequired.length > 0) {
      toast.error(`Required fields missing: ${missingRequired.join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      const success = await saveCustomFieldValues(clientId, editValues);
      if (success) {
        setIsEditing(false);
        refreshFields();
        toast.success("Custom fields updated");
      }
    } catch (error) {
      console.error("Error saving custom fields:", error);
      toast.error("Failed to save custom fields");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleGoToSettings = () => {
    navigate('/settings/configuration?tab=custom-fields');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-500">Loading custom fields...</span>
      </div>
    );
  }

  // Empty state - no custom fields configured
  if (availableFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
          <Settings2 className="h-5 w-5 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">No client custom fields configured</p>
          <p className="text-xs text-slate-400 mt-0.5">Add custom fields in settings to track additional client info</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoToSettings}
          className="mt-1 h-8 text-xs gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 hover:border-violet-300"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configure Fields
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Render field value for display mode
  const renderDisplayValue = (field: any, value: string) => {
    if (!value || value === '') {
      return <span className="text-slate-400 italic text-sm">Not set</span>;
    }

    switch (field.field_type) {
      case 'checkbox':
        return (
          <Badge variant="outline" className={cn(
            "text-xs font-medium",
            value === 'true'
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          )}>
            {value === 'true' ? 'Yes' : 'No'}
          </Badge>
        );
      case 'date':
        try {
          return (
            <span className="text-sm font-medium text-slate-700">
              {format(new Date(value), "MMM d, yyyy")}
            </span>
          );
        } catch {
          return <span className="text-sm font-medium text-slate-700">{value}</span>;
        }
      case 'select':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 text-xs font-medium">
            {value}
          </Badge>
        );
      default:
        return <span className="text-sm font-medium text-slate-700">{value}</span>;
    }
  };

  // Render field input for edit mode
  const renderEditInput = (field: any) => {
    const value = editValues[field.id] || '';

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}...`}
            className="h-20 text-sm resize-none"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder || "0"}
            className="h-9 text-sm"
          />
        );

      case 'date': {
        const selectedDate = value ? new Date(value) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9 text-sm",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setEditValues(prev => ({
                  ...prev,
                  [field.id]: date ? date.toISOString() : ''
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      }

      case 'select': {
        const options = field.options?.options || [];
        return (
          <Select
            value={value}
            onValueChange={(val) => setEditValues(prev => ({ ...prev, [field.id]: val }))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={field.placeholder || `Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id={`checkbox-${field.id}`}
              checked={value === 'true'}
              onCheckedChange={(checked) => setEditValues(prev => ({
                ...prev,
                [field.id]: checked ? 'true' : 'false'
              }))}
            />
            <label
              htmlFor={`checkbox-${field.id}`}
              className="text-sm text-slate-600 cursor-pointer"
            >
              {field.placeholder || field.name}
            </label>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => setEditValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}...`}
            className="h-9 text-sm"
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with edit controls */}
      {!embedded && (
        <div className="flex items-center justify-end">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 px-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 px-2 text-slate-500 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableFields.map((field) => {
          const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
          const displayValue = existingValue?.value || field.default_value || '';
          const FieldIcon = getFieldTypeIcon(field.field_type);

          return (
            <div
              key={field.id}
              className={cn(
                "rounded-lg border transition-all",
                isEditing
                  ? "bg-white border-violet-200 shadow-sm p-3"
                  : "bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 p-3"
              )}
            >
              {/* Field header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded",
                  getFieldTypeBadge(field.field_type)
                )}>
                  <FieldIcon className="h-3 w-3" />
                </div>
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide flex-1 truncate">
                  {field.name}
                </span>
                {field.required && (
                  <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>

              {/* Field value or input */}
              {isEditing ? (
                renderEditInput(field)
              ) : (
                <div className="min-h-[24px] flex items-center">
                  {renderDisplayValue(field, displayValue)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with settings link when embedded */}
      {embedded && (
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            onClick={handleGoToSettings}
            className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
          >
            <Settings2 className="h-3 w-3" />
            Manage fields
          </button>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-7 px-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
