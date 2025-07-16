
import React, { useState } from "react";
import { SharedDialog, FormDialogFooter } from "@/components/ui/shared-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BaseModalProps } from "@/components/ui/modal-provider";
import { toast } from "sonner";

export interface SelectionOption {
  value: string;
  label: string;
  color?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

interface SelectionModalProps extends BaseModalProps {
  title: string;
  options: SelectionOption[];
  initialSelection: string;
  onSave: (selected: string) => void;
  allowCustom?: boolean;
  onAddCustom?: (custom: string) => void;
  customLabel?: string;
  customPlaceholder?: string;
  successMessage?: string;
}

export function SelectionModal({
  open,
  onOpenChange,
  title,
  options,
  initialSelection,
  onSave,
  allowCustom = false,
  onAddCustom,
  customLabel = "Add Custom Option",
  customPlaceholder = "Enter custom option",
  successMessage = "Selection updated"
}: SelectionModalProps) {
  const [selectedOption, setSelectedOption] = useState(initialSelection);
  const [customOption, setCustomOption] = useState("");

  const handleSave = () => {
    onSave(selectedOption);
    onOpenChange(false);
    if (successMessage) {
      toast.success(successMessage);
    }
  };

  const handleAddCustom = () => {
    if (customOption.trim() && onAddCustom) {
      onAddCustom(customOption.trim());
      setCustomOption("");
      toast.success("Custom option added");
    }
  };

  return (
    <SharedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footerContent={
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSave}
        />
      }
    >
      <RadioGroup 
        value={selectedOption} 
        onValueChange={setSelectedOption}
        className="space-y-3"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`selection-${option.value}`} />
            <Label 
              htmlFor={`selection-${option.value}`} 
              className={`flex items-center gap-2 ${option.color ? option.color : ''} ${option.bgColor ? option.bgColor : ''}`}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {allowCustom && onAddCustom && (
        <div className="mt-6 border-t pt-4">
          <Label className="mb-2 block">{customLabel}</Label>
          <div className="flex items-center gap-2">
            <Input
              value={customOption}
              onChange={(e) => setCustomOption(e.target.value)}
              placeholder={customPlaceholder}
              className="flex-1"
            />
            <Button 
              onClick={handleAddCustom}
              disabled={!customOption.trim()}
              type="button"
            >
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>
        </div>
      )}
    </SharedDialog>
  );
}
