import React, { useState, useRef, useEffect } from "react";
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
  Check,
  X,
  Settings2,
  Type,
  Hash,
  Calendar as CalendarIcon,
  List,
  CheckSquare,
  AlignLeft,
  ExternalLink,
  ListChecks
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Field type icons mapping
const FIELD_TYPE_ICONS: Record<string, any> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  date: CalendarIcon,
  select: List,
  multi_select: ListChecks,
  checkbox: CheckSquare,
};

// Field type badge colors
const FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-50 text-blue-600 border-blue-200',
  textarea: 'bg-violet-50 text-violet-600 border-violet-200',
  number: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  date: 'bg-amber-50 text-amber-600 border-amber-200',
  select: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  multi_select: 'bg-purple-50 text-purple-600 border-purple-200',
  checkbox: 'bg-slate-50 text-slate-600 border-slate-200',
};

export interface CustomFieldDefinition {
  id: string;
  name: string;
  field_type: string;
  required?: boolean;
  placeholder?: string;
  default_value?: string;
  options?: { options?: string[] };
  sort_order?: number;
  description?: string;
}

export interface CustomFieldValue {
  id: string;
  custom_field_id: string;
  value: string;
}

interface EntityCustomFieldsCardProps {
  entityType: 'job' | 'client';
  entityId: string;
  availableFields: CustomFieldDefinition[];
  fieldValues: CustomFieldValue[];
  isLoading: boolean;
  onSave: (values: Record<string, string>) => Promise<boolean>;
  onRefresh: () => void;
  embedded?: boolean;
}

// Individual field component with inline editing
const InlineEditField = ({
  field,
  currentValue,
  onSave,
  FieldIcon
}: {
  field: CustomFieldDefinition;
  currentValue: string;
  onSave: (fieldId: string, value: string) => Promise<void>;
  FieldIcon: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Reset edit value when current value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(currentValue);
    }
  }, [currentValue, isEditing]);

  const handleStartEdit = () => {
    setEditValue(currentValue);
    setIsEditing(true);
  };

  const handleSaveField = async () => {
    // Validate required
    if (field.required && !editValue?.trim()) {
      toast.error(`${field.name} is required`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(field.id, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && field.field_type !== 'textarea') {
      e.preventDefault();
      handleSaveField();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Render display value
  const renderDisplayValue = () => {
    const value = currentValue;

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

      case 'multi_select':
        try {
          const selectedValues = JSON.parse(value) as string[];
          if (selectedValues.length === 0) {
            return <span className="text-slate-400 italic text-sm">Not set</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((v, i) => (
                <Badge key={i} variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs font-medium">
                  {v}
                </Badge>
              ))}
            </div>
          );
        } catch {
          return <span className="text-sm font-medium text-slate-700">{value}</span>;
        }

      default:
        return <span className="text-sm font-medium text-slate-700">{value}</span>;
    }
  };

  // Render edit input based on field type
  const renderEditInput = () => {
    switch (field.field_type) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}...`}
              className="h-20 text-sm resize-none"
              disabled={isSaving}
            />
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-7 px-2"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveField}
                disabled={isSaving}
                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveField}
              placeholder={field.placeholder || "0"}
              className="h-8 text-sm flex-1"
              disabled={isSaving}
            />
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
        );

      case 'date': {
        const selectedDate = editValue ? new Date(editValue) : undefined;
        return (
          <Popover open={true} onOpenChange={(open) => !open && handleCancel()}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-sm",
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
                onSelect={async (date) => {
                  const newValue = date ? date.toISOString() : '';
                  setEditValue(newValue);
                  setIsSaving(true);
                  await onSave(field.id, newValue);
                  setIsSaving(false);
                  setIsEditing(false);
                }}
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
            open={true}
            value={editValue}
            onValueChange={async (val) => {
              setEditValue(val);
              setIsSaving(true);
              await onSave(field.id, val);
              setIsSaving(false);
              setIsEditing(false);
            }}
            onOpenChange={(open) => !open && handleCancel()}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={field.placeholder || `Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'multi_select': {
        const options = field.options?.options || [];
        let selectedValues: string[] = [];
        try {
          selectedValues = editValue ? JSON.parse(editValue) : [];
        } catch {
          selectedValues = [];
        }

        const toggleOption = async (option: string) => {
          const newValues = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
          const newValue = JSON.stringify(newValues);
          setEditValue(newValue);
        };

        const handleMultiSelectSave = async () => {
          setIsSaving(true);
          await onSave(field.id, editValue);
          setIsSaving(false);
          setIsEditing(false);
        };

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-white">
              {selectedValues.length === 0 ? (
                <span className="text-sm text-slate-400">Select options...</span>
              ) : (
                selectedValues.map((v, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-purple-50 text-purple-600 border-purple-200 cursor-pointer hover:bg-purple-100"
                    onClick={() => toggleOption(v)}
                  >
                    {v}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {options.filter(opt => !selectedValues.includes(opt)).map((option, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => toggleOption(option)}
                >
                  + {option}
                </Badge>
              ))}
            </div>
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-7 px-2"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMultiSelectSave}
                disabled={isSaving}
                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        );
      }

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id={`checkbox-${field.id}`}
              checked={editValue === 'true'}
              onCheckedChange={async (checked) => {
                const newValue = checked ? 'true' : 'false';
                setEditValue(newValue);
                setIsSaving(true);
                await onSave(field.id, newValue);
                setIsSaving(false);
                setIsEditing(false);
              }}
              disabled={isSaving}
            />
            <label
              htmlFor={`checkbox-${field.id}`}
              className="text-sm text-slate-600 cursor-pointer"
            >
              {field.placeholder || field.name}
            </label>
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveField}
              placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}...`}
              className="h-8 text-sm flex-1"
              disabled={isSaving}
            />
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-lg border transition-all",
        isEditing
          ? "bg-white border-violet-200 shadow-sm ring-2 ring-violet-100 p-3"
          : "bg-slate-50/80 border-slate-200 hover:bg-white hover:border-violet-200 hover:shadow-sm p-3 cursor-pointer group"
      )}
      onClick={() => !isEditing && handleStartEdit()}
    >
      {/* Field header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "flex items-center justify-center w-5 h-5 rounded",
          FIELD_TYPE_COLORS[field.field_type] || FIELD_TYPE_COLORS.text
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

      {/* Field description */}
      {field.description && !isEditing && (
        <p className="text-xs text-slate-400 mb-2">{field.description}</p>
      )}

      {/* Field value or input */}
      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()}>
          {renderEditInput()}
        </div>
      ) : (
        <div className="min-h-[24px] flex items-center">
          {renderDisplayValue()}
        </div>
      )}
    </div>
  );
};

export const EntityCustomFieldsCard = ({
  entityType,
  entityId,
  availableFields,
  fieldValues,
  isLoading,
  onSave,
  onRefresh,
  embedded = false
}: EntityCustomFieldsCardProps) => {
  const navigate = useNavigate();
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Sort fields by sort_order, then by name
  const sortedFields = [...availableFields].sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  const handleGoToSettings = () => {
    navigate('/settings/configuration?tab=custom-fields');
  };

  // Save single field
  const handleSaveField = async (fieldId: string, value: string) => {
    setSavingFields(prev => new Set(prev).add(fieldId));
    try {
      const success = await onSave({ [fieldId]: value });
      if (success) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error saving field:", error);
      toast.error("Failed to save field");
    } finally {
      setSavingFields(prev => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
    }
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

  // Empty state
  if (sortedFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
          <Settings2 className="h-5 w-5 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">
            No {entityType} custom fields configured
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Add custom fields in settings to track additional {entityType} info
          </p>
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

  return (
    <div className="space-y-3">
      {/* Fields grid with inline editing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedFields.map((field) => {
          const existingValue = fieldValues.find(fv => fv.custom_field_id === field.id);
          const currentValue = existingValue?.value || field.default_value || '';
          const FieldIcon = FIELD_TYPE_ICONS[field.field_type] || Type;

          return (
            <InlineEditField
              key={field.id}
              field={field}
              currentValue={currentValue}
              onSave={handleSaveField}
              FieldIcon={FieldIcon}
            />
          );
        })}
      </div>

      {/* Footer with settings link */}
      {embedded && (
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            onClick={handleGoToSettings}
            className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
          >
            <Settings2 className="h-3 w-3" />
            Manage fields
          </button>
          <span className="text-xs text-slate-400">
            Click any field to edit
          </span>
        </div>
      )}
    </div>
  );
};
