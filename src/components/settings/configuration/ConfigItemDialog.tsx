
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ConfigItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (values: any) => Promise<any>;
  children?: React.ReactNode;
  initialValues?: any;
  customFields?: React.ReactNode | ((props: { form: any; fieldType?: string }) => React.ReactNode);
  schema?: z.ZodSchema;
}

// Base schema with only name (required for all types)
const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export function ConfigItemDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  children,
  initialValues = {},
  customFields,
  schema = baseSchema
}: ConfigItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      ...initialValues
    },
  });

  // Reset form when dialog opens or initialValues change
  useEffect(() => {
    if (open) {
      // Ensure we reset with the current initialValues
      const resetValues = {
        name: "",
        ...initialValues
      };
      console.log('Resetting form with values:', resetValues);
      form.reset(resetValues);
    }
  }, [open, initialValues, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Call onSubmit - the parent handler decides whether to close the dialog
      // based on success/failure of the operation
      await onSubmit(values);
      // Note: Dialog close is handled by parent via onOpenChange
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch field_type to conditionally show select options
  const fieldType = form.watch("field_type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter name" 
                      className="text-sm sm:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Render custom fields with access to form state */}
            {typeof customFields === 'function' 
              ? customFields({ form, fieldType })
              : customFields
            }
            {children}
            
            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
